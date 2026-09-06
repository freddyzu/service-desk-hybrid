import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url("Debe ser una URL válida"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, "La clave anónima es requerida"),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  RESEND_API_KEY: z.string().optional(), // opcional para que no crashee si no se provee localmente
  EMAIL_FROM: z.string().default("Service Desk <onboarding@resend.dev>"),
});

export const env = envSchema.parse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  EMAIL_FROM: process.env.EMAIL_FROM,
});
