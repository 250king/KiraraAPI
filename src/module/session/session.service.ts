import {
    Injectable,
    Logger,
    ForbiddenException,
    ConflictException,
    InternalServerErrorException,
    ServiceUnavailableException,
} from '@nestjs/common';
import { InjectRedis } from '@songkeys/nestjs-redis';
import { EndpointService } from '@/module/endpoint/endpoint.service';
import { GroupService } from '@/module/group/group.service';
import { XrayService } from '@/module/xray/xray.service';
import { MessageService } from '@/module/message/message.service';
import { SessionDto } from '@/module/session/session.dto';
import { UserEntity } from '@/module/common/user.entity';
import { AddUserOperation, HandlerServiceDefinition, RemoveUserOperation } from '@/lib/app/proxyman/command/command';
import { StatsServiceDefinition } from '@/lib/app/stats/command/command';
import { Account } from '@/lib/proxy/trojan/config';
import { toTypedMessage } from '@/util/grpc';
import { randomBytes, createPublicKey, publicEncrypt, createCipheriv, constants } from 'node:crypto';
import { ConsumeMessage } from 'amqplib';
import Redis from 'ioredis';

@Injectable()
export class SessionService {
    private readonly logger = new Logger(SessionService.name);

    constructor(
        @InjectRedis() private readonly redis: Redis,
        private readonly endpointService: EndpointService,
        private readonly groupService: GroupService,
        private readonly xrayService: XrayService,
        private readonly messageService: MessageService,
    ) {
        this.messageService
            .getChannel()
            .consume('kirara_check_queue', (message) => {
                this.cleanExpiredSessions(message).catch(() => {});
            })
            .catch((err) => {
                this.logger.error(`Failed to consume queue: ${err.message}`);
            });
    }

    async removeUser(region: string, email: string) {
        try {
            const client = this.xrayService.getClient(HandlerServiceDefinition, region);
            await client.alterInbound({
                tag: 'default',
                operation: toTypedMessage(RemoveUserOperation, {
                    email: email,
                }),
            });
        } catch {
            /* empty */
        } finally {
            await this.redis.del(`session:${email}`);
        }
    }

    async cleanExpiredSessions(message: ConsumeMessage) {
        const content = JSON.parse(message.content.toString());
        const email = content.email as string;
        const session = await this.redis.get(`session:${email}`);
        if (!session) {
            this.messageService.getChannel().ack(message);
            return;
        }
        try {
            const client = this.xrayService.getClient(StatsServiceDefinition, session);
            const res = await client.queryStats({
                pattern: `user>>>${email}>>>traffic`,
                reset: false,
            });
            const used = res.stat?.[0]?.value ?? 0;
            if (used === 0) {
                await this.removeUser(session, email);
            } else {
                const content = JSON.stringify({ email: email });
                await this.messageService
                    .getChannel()
                    .publish('amq.direct', 'kirara_delay_queue', Buffer.from(content));
            }
        } catch (err) {
            this.logger.error(`Failed to query stats for user ${email} at region ${session}: ${err.message}`);
        } finally {
            this.messageService.getChannel().ack(message);
        }
    }

    async createSession(data: SessionDto, user: UserEntity) {
        if (!this.groupService.isMember(user.qq)) {
            throw new ForbiddenException('您需要加入用户组才能连接专网');
        }
        if (await this.redis.get(`session:${user.email}`)) {
            throw new ConflictException('您已有一个有效的专网连接，请勿重复创建');
        }
        if (!this.endpointService.isOnline(data.region)) {
            throw new ServiceUnavailableException('目标区域当前不可用，请稍后再试');
        }
        try {
            const publicKey = createPublicKey({
                key: data.key,
                format: 'pem',
                type: 'pkcs1',
            });
            const password = randomBytes(32).toString('base64');
            const client = this.xrayService.getClient(HandlerServiceDefinition, data.region);
            await client.alterInbound({
                tag: 'default',
                operation: toTypedMessage(AddUserOperation, {
                    user: {
                        level: 0,
                        email: user.email,
                        account: toTypedMessage(Account, {
                            password: password,
                        }),
                    },
                }),
            });
            const config = this.xrayService.generateConfig(data.region, user.email, password);
            const aesKey = randomBytes(32);
            const iv = randomBytes(16);
            const cipher = createCipheriv('aes-256-gcm', aesKey, iv);
            const encrypted = Buffer.concat([
                cipher.update(JSON.stringify(config)),
                cipher.final(),
                cipher.getAuthTag(),
            ]).toString('base64');
            const encryptedAesKey = publicEncrypt(
                {
                    key: publicKey,
                    padding: constants.RSA_PKCS1_OAEP_PADDING,
                    oaepHash: 'sha1',
                },
                aesKey,
            ).toString('base64');
            const content = JSON.stringify({ email: user.email });
            await this.messageService.getChannel().publish('amq.direct', 'kirara_delay_queue', Buffer.from(content));
            await this.redis.set(`session:${user.email}`, data.region);
            return {
                key: encryptedAesKey,
                iv: iv.toString('base64'),
                data: encrypted,
            };
        } catch (err) {
            this.logger.error(
                `Failed to create session for user ${user.email} at region ${data.region}: ${err.message}`,
            );
            throw new InternalServerErrorException();
        }
    }

    async revokeSession(user: UserEntity) {
        const region = await this.redis.get(`session:${user.email}`);
        if (!region) {
            throw new ConflictException('您没有有效的专网连接');
        }
        await this.removeUser(region, user.email);
    }
}
