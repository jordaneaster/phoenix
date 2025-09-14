import BaseRepository from './BaseRepository';

class WorksheetRepository extends BaseRepository {
  constructor() {
    super('worksheets');
  }
  
  /**
   * Get worksheets for a specific prospect
   * @param {string} prospectId - Prospect ID
   * @returns {Promise<Array>}
   */
  async getByProspect(prospectId) {
    return this.getAll({ 
      filters: { prospect_id: prospectId },
      orderBy: 'created_at'
    });
  }
  
  /**
   * Get worksheets created by a specific user
   * @param {string} userId - User ID
   * @returns {Promise<Array>}
   */
  async getByCreator(userId) {
    return this.getAll({ 
      filters: { created_by: userId },
      orderBy: 'created_at'
    });
  }
  
  /**
   * Get worksheets by status
   * @param {string} status - Worksheet status
   * @returns {Promise<Array>}
   */
  async getByStatus(status) {
    return this.getAll({ filters: { status } });
  }
  
  /**
   * Get worksheets with related prospect data
   * @param {Object} options - Query options
   * @returns {Promise<Array>}
   */
  async getAllWithProspects(options = {}) {
    const { filters = {}, limit = 100, offset = 0 } = options;
    
    return this.custom(query => {
      let q = query
        .select(`
          *,
          prospects (
            id, name, email, company
          )
        `)
        .order('created_at', { ascending: false });
        
      // Apply range if limit provided
      if (Number.isInteger(limit) && limit > 0) {
        const start = offset || 0;
        const end = start + limit - 1;
        q = q.range(start, end);
      }

      // Apply any filters
      Object.entries(filters).forEach(([key, value]) => {
        if (typeof value === 'object' && value !== null) {
          // Handle special operators like gt, lt, etc.
          Object.entries(value).forEach(([op, val]) => {
            q = q.filter(key, op, val);
          });
        } else {
          q = q.eq(key, value);
        }
      });
      
      return q;
    });
  }
}

export default new WorksheetRepository();