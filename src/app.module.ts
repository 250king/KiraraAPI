import { ClassSerializerInterceptor, Global, Module, ValidationPipe } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { EndpointModule } from '@/module/endpoint/endpoint.module';
import { VersionModule } from '@/module/version/version.module';
import { DownloadModule } from '@/module/download/download.module';
import { SessionModule } from '@/module/session/session.module';
import { ArticleModule } from '@/module/article/article.module';
import { GroupModule } from '@/module/group/group.module';
import { AuthModule } from '@/module/auth/auth.module';
import { RedisModule } from '@songkeys/nestjs-redis';
import { ScheduleModule } from '@nestjs/schedule';
import { JwtAuthGuard } from '@/module/auth/jwt.guard';
import { env } from '@/util/env';

@Global()
@Module({
    providers: [
        { provide: APP_GUARD, useClass: JwtAuthGuard },
        { provide: APP_INTERCEPTOR, useClass: ClassSerializerInterceptor },
        {
            provide: APP_PIPE,
            useValue: new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }),
        },
    ],
    imports: [
        RedisModule.forRoot({
            config: {
                url: env.REDIS_URL,
            },
        }),
        ScheduleModule.forRoot(),
        ArticleModule,
        EndpointModule,
        DownloadModule,
        VersionModule,
        SessionModule,
        GroupModule,
        AuthModule,
    ],
})
export class AppModule {}
