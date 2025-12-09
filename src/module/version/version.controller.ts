import { Controller, Get } from '@nestjs/common';
import { VersionService } from '@/module/version/version.service';
import { ReleaseVo } from '@/module/version/version.vo';
import { Public } from '@/module/common/public.decorator';

@Controller('/version')
export class VersionController {
    constructor(private readonly versionService: VersionService) {}

    @Get()
    @Public()
    getVersions(): ReleaseVo {
        return new ReleaseVo(this.versionService.getRelease());
    }
}
