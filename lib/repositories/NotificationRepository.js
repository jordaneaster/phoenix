import BaseRepository from './BaseRepository';

class NotificationRepository extends BaseRepository {
  constructor() {
    super('notifications');
  }
  
  /**
   * Get notifications for a specific user
   * @param {string} userId - User ID
   * @param {boolean} includeRead - Whether to include read notifications
   * @returns {Promise<Array>}
   */
  async getForUser(userId, includeRead = false) {
    const filters = { 
      user_id: userId,
      ...(includeRead ? {} : { read: false })
    };
    
    return this.getAll({ 
      filters,
      orderBy: 'created_at',
      ascending: false
    });
  }
  
  /**
   * Mark notifications as read
   * @param {string|Array} ids - Notification ID(s)
   * @returns {Promise<Object>}
   */
  async markAsRead(ids) {
    const idArray = Array.isArray(ids) ? ids : [ids];
    
    return this.custom(query => {
      return query
        .update({ read: true, read_at: new Date().toISOString() })
        .in('id', idArray)
        .select();
    });
  }
  
  /**
   * Get unread notification count for a user
   * @param {string} userId - User ID
   * @returns {Promise<number>}
   */
  async getUnreadCount(userId) {
    const result = await this.custom(query => {
      return query
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('read', false);
    });
    
    return result.count || 0;
  }
}

export default new NotificationRepository();