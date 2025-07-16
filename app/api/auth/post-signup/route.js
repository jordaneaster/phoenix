import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  try {
    const { userId, email, metadata } = await request.json();

    // Notify n8n workflow about new signup (server-side only)
    if (process.env.N8N_WEBHOOK_URL && process.env.N8N_AUTH_SECRET) {
      try {
        await fetch(process.env.N8N_WEBHOOK_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.N8N_AUTH_SECRET}`
          },
          body: JSON.stringify({
            event: 'signup',
            userId,
            email,
            timestamp: new Date().toISOString()
          })
        });
      } catch (webhookError) {
        console.warn('Failed to notify n8n webhook:', webhookError);
      }
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('Post-signup error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
