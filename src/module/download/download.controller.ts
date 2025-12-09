import { Controller, Get, Param, Res } from '@nestjs/common';
import { DownloadService } from '@/module/download/download.service';
import type { Response } from 'express';
import { Public } from '@/module/common/public.decorator';

@Controller('/download')
export class DownloadController {
    constructor(private readonly downloadService: DownloadService) {}

    @Get(':name')
    @Public()
    async getUrl(@Param('name') name: string, @Res() res: Response) {
        res.redirect(await this.downloadService.getUrl(name));
    }
}
