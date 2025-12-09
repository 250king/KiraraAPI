import { IsNotEmpty, IsString } from 'class-validator';

export class SessionDto {
    @IsString()
    @IsNotEmpty()
    region: string;

    @IsString()
    @IsNotEmpty()
    key: string;
}
