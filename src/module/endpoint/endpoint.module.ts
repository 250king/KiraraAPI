import { Module } from '@nestjs/common';
import { EndpointController } from '@/module/endpoint/endpoint.controller';
import { EndpointService } from '@/module/endpoint/endpoint.service';
import { XrayService } from '@/module/xray/xray.service';

@Module({
    controllers: [EndpointController],
    providers: [EndpointService, XrayService],
})
export class EndpointModule {}
