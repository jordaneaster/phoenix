import DatabaseService from '../services/DatabaseService';
import { supabase } from '../supabase/client';

class BaseRepository {
  constructor(tableName) {
    this.tableName = tableName;
    this.supabase = supabase;
  }
  
  /**
   * Get all records from the table
   * @param {Object} options - Query options
   * @returns {Promise<Array>}
   */
  async getAll(options = {}) {
    return DatabaseService.fetchAll(this.tableName, options);
  }
  
  /**
   * Get a record by ID
   * @param {string|number} id - Record ID
   * @param {string|Array} columns - Columns to select
   * @returns {Promise<Object>}
   */
  async getById(id, columns = '*') {
    return DatabaseService.fetchById(this.tableName, id, columns);
  }
  
  /**
   * Create a new record
   * @param {Object} data - The record data
   * @returns {Promise<Object>}
   */
  async create(data) {
    return DatabaseService.insert(this.tableName, data);
  }
  
  /**
   * Update a record
   * @param {string|number} id - Record ID
   * @param {Object} data - The fields to update
   * @returns {Promise<Object>}
   */
  async update(id, data) {
    return DatabaseService.update(this.tableName, id, data);
  }
  
  /**
   * Delete a record
   * @param {string|number} id - Record ID
   * @returns {Promise<Object>}
   */
  async delete(id) {
    return DatabaseService.delete(this.tableName, id);
  }
  
  /**
   * Run a custom query
   * @param {Function} queryBuilder - Function that builds the query
   * @returns {Promise<Array>}
   */
  async custom(queryBuilder) {
    return DatabaseService.customQuery(this.tableName, queryBuilder);
  }
  
  /**
   * Execute a stored procedure
   * @param {string} procedureName - Name of the stored procedure
   * @param {Object} params - Parameters for the stored procedure
   * @returns {Promise<Array>} - The results from the stored procedure
   */
  async executeStoredProcedure(procedureName, params = {}) {
    try {
      const { data, error } = await this.supabase.rpc(procedureName, params);
      
      if (error) {
        console.error(`Error executing ${procedureName}:`, error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error(`Error in executeStoredProcedure ${procedureName}:`, error);
      throw error;
    }
  }
  
  /**
   * Execute a query with error handling
   * @param {string} entity - Name of the entity being queried (for logging)
   * @param {Object} query - Supabase query object
   * @returns {Promise<Array|Object>} - The query results
   */
  async executeQuery(entity, query) {
    try {
      const { data, error } = await query;
      
      if (error) {
        console.error(`Error querying ${entity}:`, error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error(`Error in executeQuery for ${entity}:`, error);
      throw error;
    }
  }
}

export default BaseRepository;