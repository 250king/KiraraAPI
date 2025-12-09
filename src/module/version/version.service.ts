import { Injectable } from '@nestjs/common';
import { env } from '@/util/env';
import { ReleaseEntity } from '@/module/version/version.entity';

@Injectable()
export class VersionService {
    private readonly release: ReleaseEntity;

    constructor() {
        const major = Math.floor(env.LATEST_RELEASE / 10000);
        const minor = Math.floor((env.LATEST_RELEASE % 10000) / 100);
        const patch = env.LATEST_RELEASE % 100;
        this.release = {
            version: `${major}.${minor}.${patch}`,
            code: env.LATEST_RELEASE,
        };
    }

    getRelease() {
        return this.release;
    }
}
