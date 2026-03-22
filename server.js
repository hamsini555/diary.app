const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { supabase, initializeDatabase } = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(cors());
app.use(express.static(__dirname));

app.post('/api/save-entry', async (req, res) => {
  const { title, content, mood, datetime, password } = req.body;

  if (!title || !content || !mood || !password) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  if (!supabase) {
    return res.status(503).json({ error: 'Database not configured. Set SUPABASE_URL and SUPABASE_ANON_KEY environment variables.' });
  }

  try {
    const { data, error } = await supabase
      .from('entries')
      .insert([{ title, content, mood, datetime, password }])
      .select();

    if (error) {
      return res.status(500).json({ error: 'Database error: ' + error.message });
    }

    res.json({ success: true, id: data[0].id });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/get-entries', async (req, res) => {
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ error: 'Password required' });
  }

  if (password !== '1234') {
    return res.status(401).json({ error: 'Wrong password!' });
  }

  if (!supabase) {
    return res.status(503).json({ error: 'Database not configured. Set SUPABASE_URL and SUPABASE_ANON_KEY environment variables.' });
  }

  try {
    const { data, error } = await supabase
      .from('entries')
      .select('id, title, content, mood, datetime')
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: 'Database error: ' + error.message });
    }

    res.json({ success: true, entries: data || [] });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/delete-entry/:id', async (req, res) => {
  const { id } = req.params;
  const { password } = req.body;

  if (password !== '1234') {
    return res.status(401).json({ error: 'Wrong password!' });
  }

  if (!supabase) {
    return res.status(503).json({ error: 'Database not configured. Set SUPABASE_URL and SUPABASE_ANON_KEY environment variables.' });
  }

  try {
    const { error } = await supabase
      .from('entries')
      .delete()
      .eq('id', id);

    if (error) {
      return res.status(500).json({ error: 'Database error: ' + error.message });
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/update-entry/:id', async (req, res) => {
  const { id } = req.params;
  const { title, content, mood, password } = req.body;

  if (password !== '1234') {
    return res.status(401).json({ error: 'Wrong password!' });
  }

  if (!supabase) {
    return res.status(503).json({ error: 'Database not configured. Set SUPABASE_URL and SUPABASE_ANON_KEY environment variables.' });
  }

  try {
    const { error } = await supabase
      .from('entries')
      .update({ title, content, mood, datetime: new Date().toLocaleString() })
      .eq('id', id);

    if (error) {
      return res.status(500).json({ error: 'Database error: ' + error.message });
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
  initializeDatabase().then((connected) => {
    if (connected) {
      console.log('✅ Connected to Supabase database');
    } else {
      console.error('⚠️ Database connection failed, but server is running');
    }
  }).catch((err) => {
    console.error('Database error:', err);
  });
});
