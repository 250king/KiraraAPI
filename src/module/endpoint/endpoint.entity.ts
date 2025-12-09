import { z } from 'zod/v4';

export const endpointSchema = z.object({
    name: z.string(),
    region: z.string(),
});

export type EndpointEntity = z.infer<typeof endpointSchema>;
