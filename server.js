const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Data file path
const PROGRESS_FILE = path.join(__dirname, 'progress.json');

// Helper function to read progress data
async function readProgressData() {
  try {
    const data = await fs.readFile(PROGRESS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading progress data:', error);
    throw error;
  }
}

// Helper function to write progress data
async function writeProgressData(data) {
  try {
    await fs.writeFile(PROGRESS_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error('Error writing progress data:', error);
    throw error;
  }
}

// GET /progress - Returns full progress data
app.get('/progress', async (req, res) => {
  try {
    const data = await readProgressData();
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
    
    const data = await readProgressData();
    
    // Find and update the subtopic
    let updatedChapter = null;
    for (const chapter of data.book) {
      const subtopic = chapter.subtopics.find(s => s.id === subtopicId);
      if (subtopic) {
        subtopic[user] = status;
        updatedChapter = chapter;
        break;
      }
    }
    
    if (!updatedChapter) {
      return res.status(404).json({ error: 'Subtopic not found' });
    }
    
    // Save updated data
    await writeProgressData(data);
    
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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
