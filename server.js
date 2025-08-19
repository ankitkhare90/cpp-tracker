const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Initialize database tables
async function initializeDatabase() {
  try {
    const client = await pool.connect();
    
    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) UNIQUE NOT NULL
      )
    `);
    
    // Create chapters table
    await client.query(`
      CREATE TABLE IF NOT EXISTS chapters (
        id SERIAL PRIMARY KEY,
        chapter_title VARCHAR(200) NOT NULL,
        chapter_order INTEGER NOT NULL
      )
    `);
    
    // Create subtopics table
    await client.query(`
      CREATE TABLE IF NOT EXISTS subtopics (
        id VARCHAR(20) PRIMARY KEY,
        chapter_id INTEGER REFERENCES chapters(id),
        title VARCHAR(300) NOT NULL,
        subtopic_order INTEGER NOT NULL
      )
    `);
    
    // Create progress table
    await client.query(`
      CREATE TABLE IF NOT EXISTS progress (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        subtopic_id VARCHAR(20) REFERENCES subtopics(id),
        completed BOOLEAN DEFAULT FALSE,
        UNIQUE(user_id, subtopic_id)
      )
    `);
    
    // Insert default users if they don't exist
    await client.query(`
      INSERT INTO users (name) VALUES ('Khare'), ('Roy')
      ON CONFLICT (name) DO NOTHING
    `);
    
    // Insert chapters and subtopics from progress.json if they don't exist
    const fs = require('fs').promises;
    try {
      const progressData = JSON.parse(await fs.readFile('progress.json', 'utf8'));
      
      for (let i = 0; i < progressData.book.length; i++) {
        const chapter = progressData.book[i];
        
        // Insert chapter
        const chapterResult = await client.query(`
          INSERT INTO chapters (chapter_title, chapter_order) 
          VALUES ($1, $2) 
          ON CONFLICT DO NOTHING 
          RETURNING id
        `, [chapter.chapter, i + 1]);
        
        if (chapterResult.rows.length > 0) {
          const chapterId = chapterResult.rows[0].id;
          
          // Insert subtopics
          for (let j = 0; j < chapter.subtopics.length; j++) {
            const subtopic = chapter.subtopics[j];
            await client.query(`
              INSERT INTO subtopics (id, chapter_id, title, subtopic_order) 
              VALUES ($1, $2, $3, $4) 
              ON CONFLICT (id) DO NOTHING
            `, [subtopic.id, chapterId, subtopic.title, j + 1]);
          }
        }
      }
    } catch (error) {
      console.log('No progress.json found, skipping initial data import');
    }
    
    client.release();
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

// Helper function to get progress data
async function getProgressData() {
  try {
    const client = await pool.connect();
    
    // Get all data
    const usersResult = await client.query('SELECT * FROM users ORDER BY name');
    const chaptersResult = await client.query(`
      SELECT c.*, 
             json_agg(
               json_build_object(
                 'id', s.id,
                 'title', s.title,
                 'Khare', COALESCE(kh.progress, false),
                 'Roy', COALESCE(ro.progress, false)
               ) ORDER BY s.subtopic_order
             ) as subtopics
      FROM chapters c
      LEFT JOIN subtopics s ON c.id = s.chapter_id
      LEFT JOIN (
        SELECT subtopic_id, completed as progress 
        FROM progress p 
        JOIN users u ON p.user_id = u.id 
        WHERE u.name = 'Khare'
      ) kh ON s.id = kh.subtopic_id
      LEFT JOIN (
        SELECT subtopic_id, completed as progress 
        FROM progress p 
        JOIN users u ON p.user_id = u.id 
        WHERE u.name = 'Roy'
      ) ro ON s.id = ro.subtopic_id
      GROUP BY c.id
      ORDER BY c.chapter_order
    `);
    
    client.release();
    
    return {
      users: usersResult.rows.map(row => row.name),
      book: chaptersResult.rows.map(row => ({
        chapter: row.chapter_title,
        subtopics: row.subtopics
      }))
    };
  } catch (error) {
    console.error('Error getting progress data:', error);
    throw error;
  }
}

// Helper function to update progress
async function updateProgress(userName, subtopicId, status) {
  try {
    const client = await pool.connect();
    
    // Get user ID
    const userResult = await client.query('SELECT id FROM users WHERE name = $1', [userName]);
    if (userResult.rows.length === 0) {
      throw new Error('User not found');
    }
    const userId = userResult.rows[0].id;
    
    // Update or insert progress
    await client.query(`
      INSERT INTO progress (user_id, subtopic_id, completed) 
      VALUES ($1, $2, $3) 
      ON CONFLICT (user_id, subtopic_id) 
      DO UPDATE SET completed = $3
    `, [userId, subtopicId, status]);
    
    client.release();
  } catch (error) {
    console.error('Error updating progress:', error);
    throw error;
  }
}

// GET /progress - Returns full progress data
app.get('/progress', async (req, res) => {
  try {
    const data = await getProgressData();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read progress data' });
  }
});

// POST /progress/update - Updates a specific subtopic for a user
app.post('/progress/update', async (req, res) => {
  try {
    const { user, subtopicId, status } = req.body;
    
    // Validate input
    if (!user || !subtopicId || typeof status !== 'boolean') {
      return res.status(400).json({ error: 'Invalid input parameters' });
    }
    
    // Update progress in database
    await updateProgress(user, subtopicId, status);
    
    // Get updated chapter data
    const data = await getProgressData();
    const updatedChapter = data.book.find(chapter => 
      chapter.subtopics.some(subtopic => subtopic.id === subtopicId)
    );
    
    if (!updatedChapter) {
      return res.status(404).json({ error: 'Subtopic not found' });
    }
    
    // Return the updated chapter
    res.json(updatedChapter);
  } catch (error) {
    console.error('Error updating progress:', error);
    res.status(500).json({ error: 'Failed to update progress' });
  }
});

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  
  // Initialize database on startup
  await initializeDatabase();
});
