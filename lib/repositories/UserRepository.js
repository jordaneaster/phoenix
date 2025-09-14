import BaseRepository from './BaseRepository';
import { supabase } from '../supabase/client';

class UserRepository extends BaseRepository {
  constructor() {
    super('users');
  }
  
  async getUserById(userId) {
    return this.executeStoredProcedure('get_user_by_id', { user_id: userId });
  }
  
  async getActiveUsers() {
    return this.executeStoredProcedure('get_active_users');
  }
  
  async getUserProfile(userId) {
    return this.executeQuery('users', this.supabase
      .from('users')
      .select('id, email, full_name, phone_number, role, department, status')
      .eq('id', userId)
      .maybeSingle()
    );
  }
  
  async getAllUsers() {
    return this.executeQuery('users', this.supabase
      .from('users')
      .select('*')
      .order('full_name', { ascending: true })
    );
  }
  
  async getUsersByRole(role) {
    return this.executeQuery('users', this.supabase
      .from('users')
      .select('*')
      .eq('role', role)
      .order('full_name', { ascending: true })
    );
  }
  
  async updateUserProfile(userId, updateData) {
    // Don't allow updating role through this method for security
    const safeData = { ...updateData };
    delete safeData.role;
    
    return this.executeQuery('users', this.supabase
      .from('users')
      .update(safeData)
      .eq('id', userId)
      .select()
    );
  }
  
  /**
   * Get the current authenticated user
   * @returns {Promise<Object>}
   */
  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('Error getting current user:', error);
      throw error;
    }
    
    if (!user) return null;
    
    // Fetch additional user data from your users table
    try {
      const userData = await this.getById(user.id);
      return { ...user, ...userData };
    } catch (err) {
      console.error('Error fetching user data:', err);
      return user; // Return just the auth user if profile fetch fails
    }
  }
  
  /**
   * Get user by email
   * @param {string} email - User's email
   * @returns {Promise<Object>}
   */
  async getByEmail(email) {
    return this.custom(query => query.select('*').eq('email', email).single());
  }
  
  /**
   * Get users by role
   * @param {string} role - User role
   * @returns {Promise<Array>}
   */
  async getByRole(role) {
    return this.getAll({ filters: { role } });
  }
}

export default new UserRepository();