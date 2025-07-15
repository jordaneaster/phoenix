import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export const supabase = createClientComponentClient();

// Function to notify n8n webhook about auth events via our API
export const notifyAuthEvent = async (eventType, userId, userEmail) => {
  try {
    const response = await fetch('/api/notify-n8n', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event_type: eventType,
        user_id: userId,
        user_email: userEmail,
      }),
    });

    if (!response.ok) {
      console.warn('API webhook notification failed:', response.status);
    } else {
      console.log('Successfully notified n8n webhook via API:', eventType, userEmail);
    }
  } catch (error) {
    console.warn('Failed to notify webhook via API:', error);
    // Don't throw error - auth should still work even if webhook fails
  }
};

// Function to set up auth listener only when needed (e.g., on login pages)
export const setupAuthListener = () => {
  let hasNotified = false;
  
  const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
    console.log('Auth state changed:', event, session?.user?.email);
    
    if (event === 'SIGNED_IN' && session?.user && !hasNotified) {
      hasNotified = true;
      // Notify n8n workflow about successful login via our API
      await notifyAuthEvent('login', session.user.id, session.user.email);
    } else if (event === 'SIGNED_OUT') {
      hasNotified = false;
      console.log('User signed out');
    }
  });
  
  return subscription;
};
