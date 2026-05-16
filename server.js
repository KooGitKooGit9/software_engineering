const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Log all requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey || supabaseUrl === 'your_supabase_project_url') {
  console.warn('Warning: Supabase credentials are not properly configured in .env');
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function saveFrequentWrongWord({ word, category, level }) {
  const { count, error: countError } = await supabase
    .from('wrong_history')
    .select('*', { count: 'exact', head: true })
    .eq('word', word);

  if (countError) throw countError;
  if ((count || 0) < 3) return null;

  const frequentWrongWord = {
    word,
    category,
    level,
    wrong_count: count
  };

  const { data: existingRows, error: selectError } = await supabase
    .from('frequent_wrong_words')
    .select('id')
    .eq('word', word)
    .limit(1);

  if (selectError) throw selectError;

  const existingId = existingRows && existingRows[0] && existingRows[0].id;
  const request = existingId
    ? supabase.from('frequent_wrong_words').update(frequentWrongWord).eq('id', existingId)
    : supabase.from('frequent_wrong_words').insert([frequentWrongWord]);

  const { data, error } = await request.select();
  if (error) throw error;

  return data && data[0];
}

// API Endpoints
app.post('/api/save-word', async (req, res) => {
  const { word, is_correct, category, level } = req.body;
  
  if (!word) {
    return res.status(400).json({ error: 'Word is required' });
  }

  // Determine which table to use
  const targetTable = is_correct ? 'correct_history' : 'wrong_history';

  try {
    const { data, error } = await supabase
      .from(targetTable)
      .insert([
        { 
          word, 
          category, 
          level 
        }
      ])
      .select();

    if (error) throw error;

    const frequentWrongWord = is_correct
      ? null
      : await saveFrequentWrongWord({ word, category, level });

    res.status(201).json({
      message: `Word saved to ${targetTable} successfully`,
      data: data[0],
      frequentWrongWord
    });
  } catch (err) {
    console.error(`Error saving word to ${targetTable}:`, err);
    res.status(500).json({ error: 'Failed to save word' });
  }
});

// Stats endpoint
app.get('/api/stats', async (req, res) => {
  try {
    // Get count from correct_history
    const { count: correctCount, error: errorC } = await supabase
      .from('correct_history')
      .select('*', { count: 'exact', head: true });

    if (errorC) throw errorC;

    // Get count from wrong_history
    const { count: wrongCount, error: errorW } = await supabase
      .from('wrong_history')
      .select('*', { count: 'exact', head: true });

    if (errorW) throw errorW;

    res.json({
      correctCount: correctCount || 0,
      wrongCount: wrongCount || 0
    });
  } catch (err) {
    console.error('Error fetching stats from Supabase:', err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Fetch words endpoint (filters out already mastered words)
app.get('/api/words', async (req, res) => {
  const { category, level } = req.query;
  
  try {
    // 1. Get all words the user has already answered correctly
    const { data: masteredData, error: masteredError } = await supabase
      .from('correct_history')
      .select('word');

    if (masteredError) throw masteredError;
    const masteredWords = new Set(masteredData.map(w => w.word));

    // 2. Fetch the word pool
    let query = supabase.from('words').select('*');
    
    if (category) {
      query = query.eq('category', category);
    }
    
    if (level && level !== '전체') {
      query = query.eq('level', level);
    }

    const { data: allWords, error: wordsError } = await query;
    if (wordsError) throw wordsError;

    // 3. Filter: exclude words that exist in correct_history
    const filteredWords = allWords.filter(w => !masteredWords.has(w.word));

    const mappedData = filteredWords.map(w => ({
      cat: w.category,
      level: w.level,
      word: w.word,
      mean: w.meaning,
      pron: w.pronunciation,
      ex: w.example,
      exKor: w.example_kor
    }));

    res.json(mappedData);
  } catch (err) {
    console.error('Error fetching filtered words:', err);
    res.status(500).json({ error: 'Failed to fetch words' });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
