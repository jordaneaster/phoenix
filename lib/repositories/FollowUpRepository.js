import BaseRepository from './BaseRepository';

class FollowUpRepository extends BaseRepository {
  constructor() {
    super('follow_ups');
  }
  
  /**
   * Get follow-ups for a specific prospect
   * @param {string} prospectId - Prospect ID
   * @returns {Promise<Array>}
   */
  async getByProspect(prospectId) {
    return this.getAll({ 
      filters: { prospect_id: prospectId },
      orderBy: 'due_date'
    });
  }
  
  /**
   * Get follow-ups assigned to a specific user
   * @param {string} userId - User ID
   * @param {boolean} includeCompleted - Whether to include completed follow-ups
   * @returns {Promise<Array>}
   */
  async getByAssignee(userId, includeCompleted = false) {
    const filters = { 
      assigned_user_id: userId,
      ...(includeCompleted ? {} : { completed: false })
    };
    
    return this.getAll({ 
      filters,
      orderBy: 'due_date'
    });
  }
  
  /**
   * Get follow-ups due today
   * @param {string} userId - Optional user ID to filter by
   * @returns {Promise<Array>}
   */
  async getDueToday(userId = null) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todayStr = today.toISOString();
    const tomorrowStr = tomorrow.toISOString();
    
    const filters = {
      due_date: { gte: todayStr, lt: tomorrowStr },
      completed: false,
      ...(userId ? { assigned_user_id: userId } : {})
    };
    
    return this.getAll({ 
      filters,
      orderBy: 'due_date'
    });
  }
  
  /**
   * Get overdue follow-ups
   * @param {string} userId - Optional user ID to filter by
   * @returns {Promise<Array>}
   */
  async getOverdue(userId = null) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString();
    
    const filters = {
      due_date: { lt: todayStr },
      completed: false,
      ...(userId ? { assigned_user_id: userId } : {})
    };
    
    return this.getAll({ 
      filters,
      orderBy: 'due_date'
    });
  }
  
  /**
   * Mark follow-ups as completed
   * @param {string|Array} ids - Follow-up ID(s)
   * @returns {Promise<Object>}
   */
  async markAsCompleted(ids, notes = '') {
    const idArray = Array.isArray(ids) ? ids : [ids];
    
    return this.custom(query => {
      return query
        .update({ 
          completed: true, 
          completion_date: new Date().toISOString(),
          completion_notes: notes || null
        })
        .in('id', idArray)
        .select();
    });
  }
}

export default new FollowUpRepository();