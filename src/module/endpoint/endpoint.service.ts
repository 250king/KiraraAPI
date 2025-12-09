import { Injectable, Logger } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { EndpointEntity, endpointSchema } from '@/module/endpoint/endpoint.entity';
import { XrayService } from '@/module/xray/xray.service';
import { StatsServiceDefinition } from '@/lib/app/stats/command/command';
import { readFileSync } from 'fs';
import { env } from '@/util/env';

@Injectable()
export class EndpointService {
    private readonly endpoints: EndpointEntity[];

    private readonly logger = new Logger(EndpointService.name);

    private ready: EndpointEntity[];

    constructor(private readonly xrayService: XrayService) {
        try {
            const data = JSON.parse(readFileSync(`${env.CONFIG_PATH}/endpoint.json`).toString());
            this.endpoints = endpointSchema.array().parse(data);
            this.ready = endpointSchema.array().parse(data);
            this.checkStatus().catch(() => {});
        } catch (e) {
            this.logger.error(`Cannot load endpoint configuration file: ${e.message}`);
            process.exit(1);
        }
    }

    @Interval(60 * 1000)
    async checkStatus() {
        for (const endpoint of this.endpoints) {
            try {
                const client = this.xrayService.getClient(StatsServiceDefinition, endpoint.region);
                await client.getSysStats({});
                if (!this.ready.find((e) => e.region === endpoint.region)) {
                    this.ready.push(endpoint);
                }
            } catch (e) {
                this.ready = this.ready.filter((e) => e.region !== endpoint.region);
                this.logger.error(`The endpoint ${endpoint.region} is unreachable: ${e.message}`);
            }
        }
    }

    getAll() {
        return this.ready;
    }

    isOnline(region: string) {
        return this.ready.some((e) => e.region === region);
    }
}
