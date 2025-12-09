import { Module } from '@nestjs/common';
import { VersionController } from '@/module/version/version.controller';
import { VersionService } from '@/module/version/version.service';

@Module({
    controllers: [VersionController],
    providers: [VersionService],
})
export class VersionModule {}
