import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { CompatServiceDefinition } from 'nice-grpc/lib/service-definitions';
import { createChannel, createClient } from 'nice-grpc';
import { Channel, ChannelCredentials } from '@grpc/grpc-js';

@Injectable()
export class XrayService implements OnModuleDestroy {
    private readonly channelMap = new Map<string, Channel>();

    onModuleDestroy() {
        for (const channel of this.channelMap.values()) {
            channel.close();
        }
    }

    getClient<T extends CompatServiceDefinition>(definition: T, region: string) {
        if (this.channelMap.has(region)) {
            return createClient(definition, this.channelMap.get(region)!);
        }
        const address = `${region}.api.kirafan.xyz:8080`;
        const channel = createChannel(address, ChannelCredentials.createInsecure());
        this.channelMap.set(region, channel);
        return createClient(definition, channel);
    }

    generateConfig(region: string, email: string, password: string) {
        return {
            remarks: email,
            inbounds: [
                {
                    listen: '127.0.0.1',
                    port: 10808,
                    protocol: 'socks',
                    settings: {
                        auth: 'noauth',
                        udp: true,
                        userLevel: 8,
                    },
                    sniffing: {
                        destOverride: ['http', 'tls', 'fakedns'],
                        enabled: true,
                        routeOnly: false,
                    },
                    tag: 'socks',
                },
            ],
            outbounds: [
                {
                    mux: {
                        concurrency: -1,
                        enabled: false,
                    },
                    protocol: 'trojan',
                    settings: {
                        servers: [
                            {
                                address: `${region}.tunnel.kirafan.xyz`,
                                level: 8,
                                ota: false,
                                password: password,
                                port: 443,
                            },
                        ],
                    },
                    streamSettings: {
                        network: 'tcp',
                        security: 'tls',
                        tcpSettings: {
                            header: {
                                type: 'none',
                            },
                        },
                        tlsSettings: {
                            allowInsecure: false,
                            fingerprint: 'randomized',
                            serverName: `${region}.tunnel.kirafan.xyz`,
                            show: false,
                        },
                    },
                    tag: 'proxy',
                },
                {
                    protocol: 'freedom',
                    settings: {
                        domainStrategy: 'UseIP',
                    },
                    tag: 'direct',
                },
            ],
            policy: {
                levels: {
                    '8': {
                        connIdle: 300,
                        downlinkOnly: 5,
                        handshake: 4,
                        uplinkOnly: 2,
                    },
                },
            },
            routing: {
                domainStrategy: 'IPIfNonMatch',
                rules: [
                    {
                        domain: ['domain:star-api.com'],
                        outboundTag: 'proxy',
                    },
                    {
                        ip: ['1.1.1.1'],
                        outboundTag: 'proxy',
                    },
                    {
                        outboundTag: 'direct',
                        port: '0-65535',
                    },
                ],
            },
            dns: {},
            log: {},
            stats: {},
        };
    }
}
