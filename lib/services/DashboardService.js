import { BaseService } from './BaseService';
import { UserRepository } from '../repositories/UserRepository';
import { ProspectRepository } from '../repositories/ProspectRepository';
import { FollowUpRepository } from '../repositories/FollowUpRepository';
import { WorksheetRepository } from '../repositories/WorksheetRepository';
import { NotificationRepository } from '../repositories/NotificationRepository';

export class DashboardService extends BaseService {
  constructor() {
    super();
    this.userRepository = new UserRepository();
    this.prospectRepository = new ProspectRepository();
    this.followUpRepository = new FollowUpRepository();
    this.worksheetRepository = new WorksheetRepository();
    this.notificationRepository = new NotificationRepository();
  }
  
  async getDashboardData(userId) {
    try {
      // Get counts in parallel using Promise.allSettled
      const results = await Promise.allSettled([
        this._getUserProfile(userId),
        this._getLeadsCount(userId),
        this._getFollowUpsCount(userId),
        this._getWorksheetsCount(userId),
        this._getProspectsCount(userId),
        this._getNotificationsCount(userId),
        this._getTrainingCount(userId)
      ]);
      
      const [
        profileResult,
        leadsCountResult,
        followUpsCountResult,
        worksheetsCountResult,
        prospectsCountResult,
        notificationsCountResult,
        trainingCountResult
      ] = results;
      
      return {
        profile: profileResult.status === 'fulfilled' ? profileResult.value : null,
        leadsCount: leadsCountResult.status === 'fulfilled' ? leadsCountResult.value : 0,
        followUpsCount: followUpsCountResult.status === 'fulfilled' ? followUpsCountResult.value : 0,
        worksheetsCount: worksheetsCountResult.status === 'fulfilled' ? worksheetsCountResult.value : 0,
        prospectsCount: prospectsCountResult.status === 'fulfilled' ? prospectsCountResult.value : 0,
        notificationsCount: notificationsCountResult.status === 'fulfilled' ? notificationsCountResult.value : 0,
        trainingCount: trainingCountResult.status === 'fulfilled' ? trainingCountResult.value : 0
      };
    } catch (error) {
      console.error('Error in getDashboardData:', error);
      throw error;
    }
  }
  
  // Helper methods for getting individual data pieces
  async _getUserProfile(userId) {
    try {
      const userProfile = await this.userRepository.getUserById(userId);
      return Array.isArray(userProfile) && userProfile.length > 0 
        ? userProfile[0] 
        : userProfile;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      // Try direct query as fallback
      try {
        return await this.userRepository.getUserProfile(userId);
      } catch (fallbackError) {
        console.error('Error in profile fallback:', fallbackError);
        return null;
      }
    }
  }
  
  async _getLeadsCount(userId) {
    try {
      const { count } = await this.supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .eq('assigned_to', userId);
      
      return count !== null ? count : 0;
    } catch (error) {
      console.error('Error fetching leads count:', error);
      return 0;
    }
  }
  
  async _getFollowUpsCount(userId) {
    try {
      // First try using stored procedure
      const followUps = await this.followUpRepository.getUserFollowUps(userId);
      if (Array.isArray(followUps)) {
        return followUps.length;
      }
      
      // Fallback to direct count
      const { count } = await this.supabase
        .from('follow_ups')
        .select('*', { count: 'exact', head: true })
        .eq('assigned_to', userId)
        .eq('status', 'pending');
      
      return count !== null ? count : 0;
    } catch (error) {
      console.error('Error fetching follow-ups count:', error);
      return 0;
    }
  }
  
  async _getWorksheetsCount(userId) {
    try {
      // First try using stored procedure
      const worksheets = await this.worksheetRepository.getUserWorksheets(userId);
      if (Array.isArray(worksheets)) {
        return worksheets.length;
      }
      
      // Fallback to direct count
      const { count } = await this.supabase
        .from('worksheets')
        .select('*', { count: 'exact', head: true })
        .eq('created_by', userId);
      
      return count !== null ? count : 0;
    } catch (error) {
      console.error('Error fetching worksheets count:', error);
      return 0;
    }
  }
  
  async _getProspectsCount(userId) {
    try {
      // First try using stored procedure
      const prospects = await this.prospectRepository.getUserProspects(userId);
      if (Array.isArray(prospects)) {
        return prospects.length;
      }
      
      // Fallback to direct count
      const { count } = await this.supabase
        .from('prospects')
        .select('*', { count: 'exact', head: true })
        .eq('assigned_to', userId);
      
      return count !== null ? count : 0;
    } catch (error) {
      console.error('Error fetching prospects count:', error);
      return 0;
    }
  }
  
  async _getNotificationsCount(userId) {
    try {
      // Try using the dedicated count method first
      const unreadCount = await this.notificationRepository.getUnreadNotificationsCount(userId);
      if (typeof unreadCount === 'number') {
        return unreadCount;
      }
      
      // Fallback to getting all notifications and counting
      const notifications = await this.notificationRepository.getUserNotifications(userId);
      if (Array.isArray(notifications)) {
        return notifications.filter(n => !n.read).length;
      }
      
      return 0;
    } catch (error) {
      console.error('Error fetching notifications count:', error);
      return 0;
    }
  }
  
  async _getTrainingCount(userId) {
    try {
      const { count } = await this.supabase
        .from('training_content')
        .select('*', { count: 'exact', head: true })
        .not('id', 'in', (
          this.supabase
            .from('training_progress')
            .select('training_id')
            .eq('user_id', userId)
        ));
      
      return count !== null ? count : 0;
    } catch (error) {
      console.error('Error fetching training count:', error);
      return 0;
    }
  }
}