import { z } from 'zod/v4';

export const groupSchema = z.object({
    id: z.number(),
});

export const banUserSchema = z.object({
    id: z.number(),
});

export type GroupEntity = z.infer<typeof groupSchema>;

export type BanUserEntity = z.infer<typeof banUserSchema>;
