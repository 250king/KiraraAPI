import { Module } from '@nestjs/common';
import { DownloadController } from '@/module/download/download.controller';
import { DownloadService } from '@/module/download/download.service';

@Module({
    controllers: [DownloadController],
    providers: [DownloadService],
})
export class DownloadModule {}
