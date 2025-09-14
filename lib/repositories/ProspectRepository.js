import BaseRepository from './BaseRepository';

class ProspectRepository extends BaseRepository {
  constructor() {
    super('prospects');
  }
  
  /**
   * Get prospects assigned to a specific user
   * @param {string} userId - User ID
   * @returns {Promise<Array>}
   */
  async getByAssignedUser(userId) {
    return this.getAll({ 
      filters: { assigned_user_id: userId },
      orderBy: 'updated_at'
    });
  }
  
  /**
   * Get prospects by status
   * @param {string} status - Prospect status
   * @returns {Promise<Array>}
   */
  async getByStatus(status) {
    return this.getAll({ filters: { status } });
  }
  
  /**
   * Get prospects that require follow-up
   * @param {string} userId - Optional user ID to filter by
   * @returns {Promise<Array>}
   */
  async getFollowUps(userId = null) {
    const filters = { 
      needs_followup: true,
      ...(userId ? { assigned_user_id: userId } : {})
    };
    
    return this.getAll({ 
      filters,
      orderBy: 'followup_date'
    });
  }
  
  /**
   * Search prospects by name, email or company
   * @param {string} searchTerm - Search term
   * @returns {Promise<Array>}
   */
  async search(searchTerm) {
    return this.custom(query => {
      const term = `%${searchTerm}%`;
      return query
        .select('*')
        .or(`name.ilike.${term},email.ilike.${term},company.ilike.${term}`);
    });
  }
}

export default new ProspectRepository();