import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { event_type, user_id, user_email } = await request.json();
    
    const webhookUrl = process.env.N8N_WEBHOOK_URL || 'https://phxlkn.app.n8n.cloud/webhook-test/auth-event';
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event_type,
        user_id,
        user_email,
        timestamp: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      console.warn('n8n webhook returned non-200 status:', response.status);
      return NextResponse.json(
        { error: 'Webhook notification failed' },
        { status: response.status }
      );
    }

    console.log('Successfully notified n8n webhook:', event_type, user_email);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.warn('Failed to notify n8n webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
