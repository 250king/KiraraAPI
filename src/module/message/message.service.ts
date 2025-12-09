import { Injectable, OnModuleDestroy } from '@nestjs/common';
import amqp, { ChannelWrapper, AmqpConnectionManager, Channel } from 'amqp-connection-manager';
import { env } from '@/util/env';

@Injectable()
export class MessageService implements OnModuleDestroy {
    private readonly client: AmqpConnectionManager;

    private readonly channel: ChannelWrapper;

    constructor() {
        this.client = amqp.connect([env.AMQP_URL]);
        this.channel = this.client.createChannel({
            setup: async (channel: Channel) => {
                return Promise.all([
                    channel.assertQueue('kirara_check_queue', { durable: true }),
                    channel.assertQueue('kirara_delay_queue', {
                        durable: true,
                        arguments: {
                            'x-dead-letter-exchange': 'amq.direct',
                            'x-dead-letter-routing-key': 'kirara_check_queue',
                            'x-message-ttl': 30 * 60 * 1000,
                        },
                    }),
                    channel.bindQueue('kirara_check_queue', 'amq.direct', 'kirara_check_queue'),
                    channel.bindQueue('kirara_delay_queue', 'amq.direct', 'kirara_delay_queue'),
                ]);
            },
        });
    }

    async onModuleDestroy() {
        await this.channel.close();
        await this.client.close();
    }

    getChannel(): ChannelWrapper {
        return this.channel;
    }
}
