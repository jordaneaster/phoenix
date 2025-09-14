import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Navbar from './components/navigation/Navbar';

export default async function DashboardLayout({ children }) {
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });

  // Check for session - log cookie state for debugging
  const sessionResult = await supabase.auth.getSession();
  const session = sessionResult?.data?.session;

  // Log if cookies exist but session doesn't
  console.log('Layout: Auth cookies present:', cookieStore.has('sb-access-token') || cookieStore.has('supabase-auth-token'));
  console.log('Layout: Session exists:', !!session);

  let user = null;
  if (session?.user) {
    try {
      // Try to get user profile from profiles table
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profile) {
        user = profile;
      } else {
        // Fall back to users table
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();
          
        user = userData || { id: session.user.id, email: session.user.email };
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      user = { id: session.user.id, email: session.user.email };
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} notifications={[]} />
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
