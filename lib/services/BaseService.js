import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export class BaseService {
  constructor() {
    this.supabase = createClientComponentClient();
  }
  
  async getCurrentUser() {
    try {
      const { data: { session }, error } = await this.supabase.auth.getSession();
      
      if (error) {
        console.error('Error getting session:', error);
        return null;
      }
      
      return session?.user || null;
    } catch (error) {
      console.error('Exception getting current user:', error);
      return null;
    }
  }
}