// Test script to verify repositories and services are working correctly
// Run with: node scripts/test-repositories.js
const { createClient } = require('@supabase/supabase-js');

try {
  require('dotenv').config();
  console.log('Loaded environment variables from .env file');
} catch (error) {
  console.error('Error loading dotenv. Make sure to install it with: npm install dotenv');
  console.error('Continuing with process.env variables that might be available...');
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY; // Add this to your .env file

// Validate environment variables
if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Missing Supabase environment variables.');
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_KEY are set in .env file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Base Repository class for testing
class BaseRepository {
  constructor() {
    this.supabase = supabase;
  }
  
  async executeStoredProcedure(procedureName, params = {}) {
    try {
      console.log(`Executing stored procedure: ${procedureName} with params:`, params);
      const { data, error } = await this.supabase.rpc(procedureName, params);
      
      if (error) {
        console.error(`Error executing stored procedure ${procedureName}:`, error);
        
        // If the stored procedure doesn't exist, log a special message
        if (error.code === '42883') { // PostgreSQL code for undefined function
          console.error(`Stored procedure ${procedureName} does not exist or is not accessible.`);
        }
        
        throw error;
      }
      
      console.log(`Successfully executed ${procedureName}, returned:`, 
                  Array.isArray(data) ? `${data.length} records` : 'single value');
      return data;
    } catch (error) {
      console.error(`Exception in ${procedureName}:`, error);
      throw error;
    }
  }
  
  async executeQuery(tableName, query) {
    try {
      console.log(`Executing query on table: ${tableName}`);
      const result = await query;
      
      if (result.error) {
        console.error(`Error executing query on ${tableName}:`, result.error);
        throw result.error;
      }
      
      console.log(`Successfully executed query on ${tableName}, returned:`,
                  result.data ? `${Array.isArray(result.data) ? result.data.length : 1} records` : '0 records');
      return result.data;
    } catch (error) {
      console.error(`Exception in query on ${tableName}:`, error);
      throw error;
    }
  }
}

// User Repository for testing
class UserRepository extends BaseRepository {
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
}

// Prospect Repository for testing
class ProspectRepository extends BaseRepository {
  async getUserProspects(userId) {
    return this.executeStoredProcedure('get_user_prospects', { user_id: userId });
  }
  
  async addProspect(name, email, phone, status, source, notes, assignedTo) {
    return this.executeStoredProcedure('add_prospect', { 
      p_name: name,
      p_email: email,
      p_phone: phone,
      p_status: status,
      p_source: source,
      p_notes: notes,
      p_assigned_to: assignedTo
    });
  }
}

// Run tests
async function runTests() {
  console.log('Starting repository tests...');
  const results = {
    passed: 0,
    failed: 0,
    tests: []
  };

  function recordTest(name, success, data = null, error = null) {
    if (success) {
      results.passed++;
      console.log(`✅ PASSED: ${name}`);
    } else {
      results.failed++;
      console.log(`❌ FAILED: ${name}`);
      if (error) console.error(error);
    }
    
    results.tests.push({
      name,
      success,
      data,
      error: error ? error.message : null
    });
  }
  
  try {
    // Test User Repository
    console.log('\n=== Testing User Repository ===');
    const userRepo = new UserRepository();
    
    // First, get a test user ID
    console.log('Getting active users...');
    try {
      const activeUsers = await userRepo.getActiveUsers();
      
      if (!activeUsers || activeUsers.length === 0) {
        throw new Error('No active users found. Make sure to run seed-data.js first.');
      }
      
      recordTest('getActiveUsers', true, { count: activeUsers.length });
      
      const testUserId = activeUsers[0].id;
      console.log(`Using test user ID: ${testUserId}`);
      
      // Test get user by ID
      console.log('\nTesting getUserById...');
      try {
        const userById = await userRepo.getUserById(testUserId);
        recordTest('getUserById', !!userById, userById);
      } catch (error) {
        recordTest('getUserById', false, null, error);
      }
      
      // Test get user profile
      console.log('\nTesting getUserProfile...');
      try {
        const userProfile = await userRepo.getUserProfile(testUserId);
        recordTest('getUserProfile', !!userProfile, userProfile);
      } catch (error) {
        recordTest('getUserProfile', false, null, error);
      }
      
      // Test Prospect Repository
      console.log('\n=== Testing Prospect Repository ===');
      const prospectRepo = new ProspectRepository();
      
      // Test get user prospects
      console.log('\nTesting getUserProspects...');
      try {
        const prospects = await prospectRepo.getUserProspects(testUserId);
        recordTest('getUserProspects', true, { 
          count: Array.isArray(prospects) ? prospects.length : 0
        });
      } catch (error) {
        recordTest('getUserProspects', false, null, error);
      }
      
      // Test add prospect
      console.log('\nTesting addProspect...');
      try {
        const newProspectId = await prospectRepo.addProspect(
          'Test Prospect',
          'test@example.com',
          '555-123-4567',
          'active',
          'test',
          'Created during repository test',
          testUserId
        );
        recordTest('addProspect', !!newProspectId, { id: newProspectId });
      } catch (error) {
        recordTest('addProspect', false, null, error);
      }
      
    } catch (error) {
      recordTest('getActiveUsers', false, null, error);
    }
    
  } catch (error) {
    console.error('Fatal error during repository tests:', error);
  }
  
  // Print summary
  console.log('\n=== Test Summary ===');
  console.log(`Total Tests: ${results.passed + results.failed}`);
  console.log(`Passed: ${results.passed}`);
  console.log(`Failed: ${results.failed}`);
  
  return results;
}

runTests()
  .catch(console.error)
  .finally(() => {
    process.exit();
  });