import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z.string().optional(),
  PORT: z.string().optional(),
  FRONTEND_URL: z.string().url(),
  MONGODB_CONNECTION_STRING: z.string().min(1),
  SESSION_SECRET: z.string().min(1),
  JWT_SECRET_KEY: z.string().min(1),
  // Add other required env vars here
});

export function validateEnv(env: NodeJS.ProcessEnv) {
  const result = envSchema.safeParse(env);
  if (!result.success) {
    // eslint-disable-next-line no-console
    console.error('❌ Invalid environment variables:', result.error.issues);
    process.exit(1);
  }
  return result.data;
}
