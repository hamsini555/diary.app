require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

let supabase = null;

if (!supabaseUrl || !supabaseKey) {
  console.warn('⚠️ SUPABASE_URL or SUPABASE_ANON_KEY not found in environment');
  console.warn('📝 API endpoints will return errors until variables are set');
} else {
  supabase = createClient(supabaseUrl, supabaseKey);
}

// Initialize and test connection
const initializeDatabase = async () => {
  if (!supabase) {
    console.warn('⚠️ Skipping database initialization: credentials not configured');
    return false;
  }
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
