import { z } from 'zod/v4';

export const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'production', 'test']),
    CONFIG_PATH: z.string().default('/etc/kirara'),
    PORT: z.coerce.number().default(3000),
    LATEST_RELEASE: z.coerce.number(),
    CLIENT_ID: z.string(),
    CLIENT_SECRET: z.string(),
    TENANT_ID: z.string(),
    FOLDER_ID: z.string(),
    NAPCAT_KEY: z.string(),
    NAPCAT_URL: z.url(),
    REDIS_URL: z.url(),
    AMQP_URL: z.url(),
});

export const env = envSchema.parse(process.env);
