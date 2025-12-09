import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class ReleaseVo {
    constructor(partial: Partial<ReleaseVo>) {
        Object.assign(this, partial);
    }

    @Expose()
    version: string;

    @Expose()
    code: number;
}
