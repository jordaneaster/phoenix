// Seed script to populate the database with test data
// Run with: node scripts/seed-data.js
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

// Generate a random UUID
const uuid = () => {
  try {
    // Try to use the uuid package if available
    return require('uuid').v4();
  } catch (error) {
    // Fall back to a simple implementation if uuid package is not installed
    console.warn('uuid package not found, using fallback UUID generator');
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
};

// Common utility to help with seeding
async function seedTable(tableName, records, options = {}) {
  console.log(`Seeding ${tableName}...`);
  try {
    // Clear the table first if required
    if (options.clearFirst) {
      console.log(`  Clearing existing records from ${tableName}...`);
      const { error: clearError } = await supabase.from(tableName).delete().neq('id', '00000000-0000-0000-0000-000000000000');
      if (clearError) throw clearError;
    }

    if (records.length === 0) {
      console.log(`  No records to insert for ${tableName}`);
      return [];
    }

    // Insert the records
    const { data, error } = await supabase.from(tableName).insert(records).select();
    if (error) throw error;
    console.log(`  Inserted ${data.length} records into ${tableName}`);
    return data;
  } catch (error) {
    console.error(`Error seeding ${tableName}:`, error);
    return [];
  }
}

// Clear dependent tables in the correct order to avoid FK constraint violations
async function clearDependentTables() {
  const tablesInOrder = [
    'buyer_orders',
    'deal_packs',
    'follow_ups',
    'training_progress',
    'training_content',
    'worksheets',
    'prospects',
    'leads',
    'notifications'
  ];

  for (const table of tablesInOrder) {
    try {
      console.log(`Clearing existing records from ${table}...`);
      const { error } = await supabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000');
      if (error) {
        console.warn(`Warning clearing ${table}:`, error.message || error);
      }
    } catch (error) {
      console.warn(`Exception while clearing ${table}:`, error.message || error);
    }
  }
}

// Main seeding function
async function seedDatabase() {
  console.log('Starting database seeding...');
  
  try {
    // Clear dependent tables first to avoid FK constraint errors when clearing users
    await clearDependentTables();

    // Create users first as they are referenced by other tables
    const userIds = await seedUsers();
    
    if (!userIds || userIds.length === 0) {
      console.error('Failed to create users. Aborting seeding process.');
      return;
    }
    
    console.log(`Created ${userIds.length} users successfully.`);
    
    // Create rest of the data with user references - sequentially to avoid potential conflicts
    console.log('Seeding prospects...');
    const prospects = await seedProspects(userIds);
    console.log(`Created ${prospects?.length || 0} prospects.`);
    
    console.log('Seeding leads...');
    const leads = await seedLeads(userIds);
    console.log(`Created ${leads?.length || 0} leads.`);
    
    console.log('Seeding training content...');
    const training = await seedTraining();
    console.log(`Created ${training?.length || 0} training items.`);
    
    console.log('Seeding worksheets...');
    const worksheets = await seedWorksheets(userIds);
    console.log(`Created ${worksheets?.length || 0} worksheets.`);
    
    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error during database seeding:', error);
    console.error('Database seeding failed.');
  }
}

// Seed users table
async function seedUsers() {
  const users = [
    {
      id: uuid(),
      email: 'manager@example.com',
      full_name: 'Alex Manager',
      phone_number: '555-123-4567',
      role: 'manager',
      department: 'management',
      status: 'active'
    },
    {
      id: uuid(),
      email: 'sales1@example.com',
      full_name: 'Chris Sales',
      phone_number: '555-234-5678',
      role: 'sales',
      department: 'sales',
      status: 'active'
    },
    {
      id: uuid(),
      email: 'sales2@example.com',
      full_name: 'Taylor Rep',
      phone_number: '555-345-6789',
      role: 'sales',
      department: 'sales',
      status: 'active'
    },
    {
      id: uuid(),
      email: 'admin@example.com',
      full_name: 'Jordan Admin',
      phone_number: '555-456-7890',
      role: 'admin',
      department: 'management',
      status: 'active'
    }
  ];
  
  const createdUsers = await seedTable('users', users, { clearFirst: true });
  return createdUsers.map(user => user.id);
}

// Seed prospects table
async function seedProspects(userIds) {
  if (!userIds.length) return [];

  const prospects = [];
  const statuses = ['active', 'hot', 'cold', 'won', 'lost'];
  const sources = ['website', 'referral', 'walk-in', 'phone', 'email'];
  
  for (let i = 0; i < 20; i++) {
    const assignedToIndex = Math.floor(Math.random() * userIds.length);
    prospects.push({
      id: uuid(),
      name: `Prospect ${i+1}`,
      email: `prospect${i+1}@example.com`,
      phone: `555-${String(100 + i).padStart(3, '0')}-${String(1000 + i).padStart(4, '0')}`,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      source: sources[Math.floor(Math.random() * sources.length)],
      notes: `Notes for prospect ${i+1}`,
      // assigned_to references auth.users in schema; set to null to avoid FK errors
      assigned_to: null
      // no assigned_to_user_id column in prospects table - removed
    });
  }
  
  const createdProspects = await seedTable('prospects', prospects, { clearFirst: true });
  
  // Create follow-ups for some prospects
  const followUps = [];
  for (const prospect of createdProspects.slice(0, 10)) {
    const daysToAdd = Math.floor(Math.random() * 10) - 5; // -5 to +5 days
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + daysToAdd);
    
    followUps.push({
      id: uuid(),
      prospect_name: prospect.name,
      notes: `Follow up with ${prospect.name} about their interest`,
      due_date: dueDate.toISOString().split('T')[0],
      status: 'pending',
      // assigned_to references auth.users - set null
      assigned_to: null,
      // set assigned_to_user_id to a valid public.users id
      assigned_to_user_id: userIds[Math.floor(Math.random() * userIds.length)]
    });
  }
  
  await seedTable('follow_ups', followUps, { clearFirst: true });
  return createdProspects;
}

// Seed leads table
async function seedLeads(userIds) {
  if (!userIds.length) return [];

  const leads = [];
  const statuses = ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost'];
  const priorities = ['low', 'medium', 'high'];
  
  for (let i = 0; i < 25; i++) {
    const assignedToIndex = Math.floor(Math.random() * userIds.length);
    leads.push({
      id: uuid(),
      first_name: `FirstName${i+1}`,
      last_name: `LastName${i+1}`,
      email: `lead${i+1}@example.com`,
      phone: `555-${String(200 + i).padStart(3, '0')}-${String(2000 + i).padStart(4, '0')}`,
      company: `Company ${i+1}`,
      title: `Title ${i+1}`,
      source: 'manual',
      status: statuses[Math.floor(Math.random() * statuses.length)],
      priority: priorities[Math.floor(Math.random() * priorities.length)],
      value: Math.floor(Math.random() * 100000) + 10000,
      notes: `Notes for lead ${i+1}`,
      assigned_to: userIds[assignedToIndex],
      last_contact_date: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
      next_follow_up: new Date(Date.now() + Math.floor(Math.random() * 15) * 24 * 60 * 60 * 1000).toISOString()
    });
  }
  
  return await seedTable('leads', leads, { clearFirst: true });
}

// Seed training content
async function seedTraining() {
  const trainingContent = [
    {
      id: uuid(),
      title: 'Sales Process Overview',
      description: 'Learn the fundamentals of our sales process',
      content_type: 'video',
      content_url: 'https://example.com/training/sales-process',
      status: 'active'
    },
    {
      id: uuid(),
      title: 'Product Knowledge: Sedan Line',
      description: 'Detailed features of our sedan product line',
      content_type: 'video',
      content_url: 'https://example.com/training/sedan-features',
      status: 'active'
    },
    {
      id: uuid(),
      title: 'Handling Objections',
      description: 'Techniques for addressing common customer objections',
      content_type: 'video',
      content_url: 'https://example.com/training/objections',
      status: 'active'
    },
    {
      id: uuid(),
      title: 'CRM Usage Guide',
      description: 'How to effectively use Phoenix CRM',
      content_type: 'document',
      content_url: 'https://example.com/training/crm-guide',
      status: 'active'
    },
    {
      id: uuid(),
      title: 'Finance Options for Customers',
      description: 'Understanding the financing options we offer customers',
      content_type: 'document',
      content_url: 'https://example.com/training/finance-options',
      status: 'active'
    }
  ];
  
  return await seedTable('training_content', trainingContent, { clearFirst: true });
}

// Seed worksheets
async function seedWorksheets(userIds) {
  if (!userIds.length) return [];

  const worksheets = [];
  const types = ['buyer_order', 'deal_pack'];
  const statuses = ['draft', 'active', 'pending_approval', 'approved', 'completed'];
  
  for (let i = 0; i < 15; i++) {
    const userIndex = Math.floor(Math.random() * userIds.length);
    worksheets.push({
      id: uuid(),
      title: `Worksheet ${i+1}`,
      type: types[Math.floor(Math.random() * types.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      // user_id references public.users
      user_id: userIds[userIndex],
      // created_by references auth.users in schema; set to null to avoid FK errors
      created_by: null
    });
  }
  
  const createdWorksheets = await seedTable('worksheets', worksheets, { clearFirst: true });

  // Create some buyer orders attached to worksheets
  const buyerOrders = [];
  for (const worksheet of createdWorksheets.filter(w => w.type === 'buyer_order')) {
    buyerOrders.push({
      id: uuid(),
      worksheet_id: worksheet.id,
      vehicle_info: JSON.stringify({
        make: ['Honda', 'Toyota', 'Ford', 'Chevrolet'][Math.floor(Math.random() * 4)],
        model: ['Accord', 'Camry', 'F-150', 'Silverado'][Math.floor(Math.random() * 4)],
        year: 2020 + Math.floor(Math.random() * 4),
        color: ['Black', 'White', 'Silver', 'Blue'][Math.floor(Math.random() * 4)],
        vin: `VIN${Math.random().toString(36).substring(2, 10).toUpperCase()}`
      }),
      pricing_info: JSON.stringify({
        msrp: Math.floor(Math.random() * 20000) + 20000,
        selling_price: Math.floor(Math.random() * 15000) + 20000,
        taxes: Math.floor(Math.random() * 2000) + 1000,
        fees: Math.floor(Math.random() * 1000) + 500
      }),
      financing_info: JSON.stringify({
        term: [36, 48, 60, 72][Math.floor(Math.random() * 4)],
        rate: (Math.random() * 5 + 2).toFixed(2),
        monthly_payment: Math.floor(Math.random() * 300) + 300
      }),
      trade_in_info: JSON.stringify({
        value: Math.floor(Math.random() * 10000) + 5000,
        make: ['Honda', 'Toyota', 'Ford', 'Chevrolet'][Math.floor(Math.random() * 4)],
        model: ['Civic', 'Corolla', 'Focus', 'Malibu'][Math.floor(Math.random() * 4)],
        year: 2010 + Math.floor(Math.random() * 10)
      })
    });
  }
  
  await seedTable('buyer_orders', buyerOrders, { clearFirst: true });
  
  // Create some deal packs attached to worksheets
  const dealPacks = [];
  for (const worksheet of createdWorksheets.filter(w => w.type === 'deal_pack')) {
    dealPacks.push({
      id: uuid(),
      worksheet_id: worksheet.id,
      package_details: JSON.stringify({
        base_vehicle: {
          make: ['Honda', 'Toyota', 'Ford', 'Chevrolet'][Math.floor(Math.random() * 4)],
          model: ['Accord', 'Camry', 'F-150', 'Silverado'][Math.floor(Math.random() * 4)],
          year: 2020 + Math.floor(Math.random() * 4),
        },
        add_ons: [
          { name: 'Extended Warranty', price: Math.floor(Math.random() * 1000) + 1000 },
          { name: 'Paint Protection', price: Math.floor(Math.random() * 500) + 500 },
          { name: 'Interior Protection', price: Math.floor(Math.random() * 300) + 300 }
        ],
        total_price: Math.floor(Math.random() * 25000) + 25000
      }),
      terms_conditions: 'Standard terms and conditions apply.',
      approval_status: ['pending', 'approved', 'rejected'][Math.floor(Math.random() * 3)],
      // approved_by references auth.users - set null to avoid FK errors in seed
      approved_by: null,
      approved_at: null
    });
  }
  
  await seedTable('deal_packs', dealPacks, { clearFirst: true });
  
  return createdWorksheets;
}

// Run the seeding process
seedDatabase()
  .catch(error => {
    console.error('Seeding error:', error);
    process.exit(1);
  });