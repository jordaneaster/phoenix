import { supabase } from '../supabase/client';

class DatabaseService {
  /**
   * Fetch all records from a specific table
   * @param {string} tableName - The name of the table to query
   * @param {Object} options - Query options
   * @param {Array} options.columns - Specific columns to select (defaults to all)
   * @param {Object} options.filters - Filter conditions
   * @param {number} options.limit - Maximum number of records to return
   * @param {number} options.offset - Number of records to skip
   * @param {string} options.orderBy - Column to order by
   * @param {boolean} options.ascending - Order direction (true for ascending, false for descending)
   * @returns {Promise<Array>} - The query results
   */
  async fetchAll(tableName, options = {}) {
    const {
      columns = '*',
      filters = {},
      limit = null,
      offset = 0,
      orderBy = 'created_at',
      ascending = false
    } = options;
    
    let query = supabase
      .from(tableName)
      .select(columns);

    // Apply any filters
    Object.entries(filters).forEach(([key, value]) => {
      if (typeof value === 'object' && value !== null) {
        // Handle special operators like gt, lt, etc.
        Object.entries(value).forEach(([op, val]) => {
          query = query.filter(key, op, val);
        });
      } else {
        query = query.eq(key, value);
      }
    });
    
    // Apply ordering
    query = query.order(orderBy, { ascending });

    // Apply range if limit provided (supabase v2/PostgREST uses range instead of offset)
    if (Number.isInteger(limit) && limit > 0) {
      const start = offset || 0;
      const end = start + limit - 1;
      query = query.range(start, end);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error(`Error fetching from ${tableName}:`, error);
      throw error;
    }
    
    return data;
  }
  
  /**
   * Fetch a single record by ID
   * @param {string} tableName - The name of the table to query
   * @param {string|number} id - The ID of the record to fetch
   * @param {string|Array} columns - Columns to select
   * @returns {Promise<Object>} - The record
   */
  async fetchById(tableName, id, columns = '*') {
    const { data, error } = await supabase
      .from(tableName)
      .select(columns)
      .eq('id', id)
      .single();
      
    if (error) {
      console.error(`Error fetching ${tableName} with id ${id}:`, error);
      throw error;
    }
    
    return data;
  }
  
  /**
   * Insert a new record
   * @param {string} tableName - The name of the table
   * @param {Object|Array} records - The record(s) to insert
   * @returns {Promise<Object>} - The inserted record(s)
   */
  async insert(tableName, records) {
    const { data, error } = await supabase
      .from(tableName)
      .insert(records)
      .select();
      
    if (error) {
      console.error(`Error inserting into ${tableName}:`, error);
      throw error;
    }
    
    return data;
  }
  
  /**
   * Update an existing record
   * @param {string} tableName - The name of the table
   * @param {string|number} id - The ID of the record to update
   * @param {Object} updates - The fields to update
   * @returns {Promise<Object>} - The updated record
   */
  async update(tableName, id, updates) {
    const { data, error } = await supabase
      .from(tableName)
      .update(updates)
      .eq('id', id)
      .select();
      
    if (error) {
      console.error(`Error updating ${tableName} with id ${id}:`, error);
      throw error;
    }
    
    return data;
  }
  
  /**
   * Delete a record
   * @param {string} tableName - The name of the table
   * @param {string|number} id - The ID of the record to delete
   * @returns {Promise<Object>} - The deleted record
   */
  async delete(tableName, id) {
    const { data, error } = await supabase
      .from(tableName)
      .delete()
      .eq('id', id)
      .select();
      
    if (error) {
      console.error(`Error deleting from ${tableName} with id ${id}:`, error);
      throw error;
    }
    
    return data;
  }
  
  /**
   * Run a custom query using Supabase's query builder
   * @param {string} tableName - The name of the table
   * @param {Function} queryBuilder - A function that builds a custom query
   * @returns {Promise<Array>} - The query results
   */
  async customQuery(tableName, queryBuilder) {
    let query = supabase.from(tableName);
    query = queryBuilder(query);
    
    const { data, error } = await query;
    
    if (error) {
      console.error(`Error in custom query for ${tableName}:`, error);
      throw error;
    }
    
    return data;
  }
}

export default new DatabaseService();