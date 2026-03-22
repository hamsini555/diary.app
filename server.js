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

app.post('/api/get-entriess', async (req, res) => {
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ error: 'Password required' });
  }

  if (password !== '1234') {
    return res.status(401).json({ error: 'Wrong password!' });
  }

  try {
    const { data, error } = await supabase
      .from('entries')
      .select('id, title, content, mood, datetime')
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: 'Database error: ' + error.message });
    }

    res.json({ success: true, entriess: data || [] });
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

// Initialize database and start server
initializeDatabase().then((connected) => {
  if (connected) {
    app.listen(PORT, () => {
      console.log(`🌷 Dairy App running on http://localhost:${PORT}`);
      console.log('Using Supabase database');
      console.log('Press Ctrl+C to stop');
    });
  } else {
    console.error('Failed to connect to database. Server not started.');
    process.exit(1);
  }
}).catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
