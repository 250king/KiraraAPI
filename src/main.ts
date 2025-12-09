import { NestFactory } from '@nestjs/core';
import { AppModule } from '@/app.module';
import { env } from '@/util/env';

const bootstrap = async () => {
    const app = await NestFactory.create(AppModule);
    await app.listen(env.PORT);
};

bootstrap().catch((err) => {
    console.error('Error during application bootstrap:', err);
});
