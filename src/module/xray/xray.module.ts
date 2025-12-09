import { Module } from '@nestjs/common';
import { XrayService } from '@/module/xray/xray.service';

@Module({
    providers: [XrayService],
})
export class XrayModule {}
