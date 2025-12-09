import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class EndpointVo {
    constructor(partial: Partial<EndpointVo>) {
        Object.assign(this, partial);
    }

    @Expose()
    name: string;

    @Expose()
    region: string;
}
