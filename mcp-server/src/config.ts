import 'dotenv/config'
import * as z from 'zod/v4'

const EnvSchema = z.object({
    DB_HOST: z.string(),
    DB_PORT: z.coerce.number().default(5432),
    DB_NAME: z.string(),
    DB_USER: z.string(),
    DB_PASSWORD: z.string(),
    DB_SSL: z.coerce.boolean().default(false),
})

export const env = EnvSchema.parse(process.env)
