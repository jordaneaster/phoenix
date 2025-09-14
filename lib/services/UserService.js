import { BaseService } from './BaseService';
import { UserRepository } from '../repositories/UserRepository';

export class UserService extends BaseService {
  constructor() {
    super();
    this.userRepository = new UserRepository();
  }
  
  async getUserProfile(userId) {
    try {
      // Try using the stored procedure first
      const userProfile = await this.userRepository.getUserById(userId);
      
      if (userProfile && (Array.isArray(userProfile) ? userProfile.length > 0 : true)) {
        return Array.isArray(userProfile) ? userProfile[0] : userProfile;
      }
      
      // Fallback to direct query
      return await this.userRepository.getUserProfile(userId);
    } catch (error) {
      console.error('Error in getUserProfile service:', error);
      throw error;
    }
  }
  
  async getCurrentUserProfile() {
    const currentUser = await this.getCurrentUser();
    if (!currentUser) return null;
    
    return await this.getUserProfile(currentUser.id);
  }
  
  async getActiveUsers() {
    return this.userRepository.getActiveUsers();
  }
}