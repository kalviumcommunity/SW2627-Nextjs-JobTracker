import { env } from '@/lib/env';

export async function GET() {
  // If DATABASE_URL is missing, throws error immediately
  console.log('Using database:', env.database.url.split('@')[1] || 'configured');
  return Response.json({
    message: 'Environment variables loaded successfully',
    appName: env.public.appName,
  });
}
