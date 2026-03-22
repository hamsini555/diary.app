require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: SUPABASE_URL and SUPABASE_ANON_KEY are required in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Initialize and test connection
const initializeDatabase = async () => {
  try {
    await supabase.auth.getSession();
    console.log('✅ Connected to Supabase database');
    return true;
  } catch (err) {
    console.error('❌ Supabase connection error:', err.message);
    return false;
  }
};

module.exports = { supabase, initializeDatabase };
