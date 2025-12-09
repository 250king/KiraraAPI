import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { readFileSync } from 'fs';
import { env } from '@/util/env';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        let key: Buffer;
        try {
            key = readFileSync(`${env.CONFIG_PATH}/public.pem`);
        } catch {
            Logger.error(`Failed to read public key from ${env.CONFIG_PATH}/public.pem`, JwtStrategy.name);
            process.exit(1);
        }
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: key,
        });
    }

    validate(payload: any) {
        if (!payload) {
            throw new UnauthorizedException();
        }
        return {
            id: payload.sub,
            name: payload.name,
            username: payload.username,
            avatar: payload.avatar,
            email: payload.email,
            qq: payload.qq,
            groups: payload.groups || [],
        };
    }
}
