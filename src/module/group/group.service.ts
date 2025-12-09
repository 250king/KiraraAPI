import { Injectable, Logger } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { env } from '@/util/env';
import { readFileSync } from 'fs';
import { banUserSchema, GroupEntity, groupSchema } from '@/module/group/group.entity';
import axios from 'axios';

@Injectable()
export class GroupService {
    private readonly groups: GroupEntity[];

    private readonly ban: number[];

    private readonly logger = new Logger(GroupService.name);

    private readonly client = axios.create({
        baseURL: env.NAPCAT_URL,
        headers: {
            Authorization: `Bearer ${env.NAPCAT_KEY}`,
        },
    });

    private users: number[];

    constructor() {
        try {
            const group = JSON.parse(readFileSync(`${env.CONFIG_PATH}/group.json`).toString());
            const ban = JSON.parse(readFileSync(`${env.CONFIG_PATH}/ban.json`).toString());
            this.groups = groupSchema.array().parse(group);
            this.ban = banUserSchema
                .array()
                .parse(ban)
                .map((b) => b.id);
            this.fetchUsers().catch(() => {});
        } catch (e) {
            this.logger.error(`Cannot load group configuration file: ${e.message}`);
            process.exit(1);
        }
    }

    @Interval(30 * 60 * 1000)
    async fetchUsers() {
        for (const group of this.groups) {
            const res = await this.client.post('/get_group_member_list', {
                group_id: group.id,
            });
            const members = res.data.data;
            this.users = [
                ...new Set(
                    [...(this.users ?? []), ...members.map((m: { user_id: number }) => m.user_id)].filter(
                        (id: number) => !this.ban.includes(id),
                    ),
                ),
            ];
        }
    }

    isMember(userId: number): boolean {
        return this.users?.includes(userId) ?? false;
    }
}
