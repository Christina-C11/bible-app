const express = require('express');
const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');
const { version } = require('os');
const app = express();
const port = process.env.PORT || 5000;  // Use environment variable or default to 5000
const cors = require('cors');  // Import cors
// Enable CORS for all origins
app.use(cors());

// Utility function to load CSV data
const loadCSV = (filePath) => {
  const results = [];
  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (err) => reject(err));
  });
};

// Serve all Bible data (books, chapters, verses) for a selected version
app.get('/api/preload/:version', async (req, res) => {
  const { version } = req.params;
  
  try {
    const books = await loadCSV(path.join(__dirname, 'data', 'Books.csv'));

    const versionFileMap = {
      'CN': 'Bible_CN.csv',
      'NKJV': 'Bible_NKJV.csv',
      'KJV': 'Bible_KJV.csv'
    };

    if (!versionFileMap[version]) {
      return res.status(400).send('Invalid version');
    }

    const versesData = await loadCSV(path.join(__dirname, 'data', versionFileMap[version]));

    const response = books.map(book => {
      const chapters = versesData
        .filter(verse => verse.Book === book['Index'])
        .map(verse => ({
          chapter: parseInt(verse.Chapter, 10),
          verse: parseInt(verse.Verse, 10),
          text: verse.Scripture
        }));
      return {
        book: {...book},
        chapters: chapters.reduce((acc, curr) => {
          const chapterIndex = curr.chapter;
          if (!acc[chapterIndex]) acc[chapterIndex] = [];
          acc[chapterIndex].push(curr);
          return acc;
        }, {})
      };
    });

    res.json(response);
  } catch (err) {
    console.error("Error preloading data:", err);
    res.status(500).send('Error preloading data');
  }
});

// Serve Books data
app.get('/api/books', async (req, res) => {
  try {
    const books = await loadCSV(path.join(__dirname, 'data', 'Books.csv'));
    res.json(books)

  } catch (err) {
    console.error("Error loading books data:", err);
    res.status(500).send('Error loading books data');
  }
});

// Serve Chapter data based on selected book index
app.get('/api/chapters', async (req, res) => {
  const bookIndex = parseInt(req.query.bookIndex, 10);
  console.log("Received request for book index:", bookIndex); // Debugging

  try {
    const books = await loadCSV(path.join(__dirname, 'data', 'Books.csv'));
    const book = books[bookIndex]; // Get the book based on the index
    if (!book) {
      return res.status(404).send('Book not found');
    }

    const results = await loadCSV(path.join(__dirname, 'data', 'Bible_CN.csv'));
    console.log(results);
    const chapters = results
      .filter(data => data.Book === book['Index'])
      .map(data => parseInt(data.Chapter, 10)); // Convert chapters to numbers

    const uniqueChapters = [...new Set(chapters)]; // Ensure unique chapters
    uniqueChapters.sort((a, b) => a - b); // Sort chapters numerically

    console.log("Chapters found:", uniqueChapters); // Debugging
    res.json(uniqueChapters);
  } catch (err) {
    console.error("Error loading chapters:", err); // Debugging
    res.status(500).send('Error loading chapters data');
  }
});

// Utility function to remove tags
const removeTags = (text) => text ? text.replace(/<[^>]*>/g, '') : '';

// Serve Bible data for a selected book and chapter (all versions)
app.get('/api/verses', async (req, res) => {
  const { bookIndex, chapter } = req.query;
  try {
    const books = await loadCSV(path.join(__dirname, 'data', 'Books.csv'));
    const book = books[parseInt(bookIndex, 10)];
    if (!book) {
      return res.status(404).send('Book not found');
    }

    const cnData = await loadCSV(path.join(__dirname, 'data', 'Bible_CN.csv'));
    const nkjvData = await loadCSV(path.join(__dirname, 'data', 'Bible_NKJV.csv'));
    const kjvData = await loadCSV(path.join(__dirname, 'data', 'Bible_KJV.csv'));
    const verses = cnData
      .filter(data => data.Book === book['Index'] && parseInt(data.Chapter, 10) === parseInt(chapter, 10))
      .map(data => ({
        Chapter: data.Chapter,
        Verse: data.Verse,
        Scripture_CN: removeTags(data.Scripture),
        Scripture_NKJV: removeTags(nkjvData.find(v => v.Book === book['Index'] && parseInt(v.Chapter, 10) === parseInt(chapter, 10) && v.Verse === data.Verse)?.Scripture),
        Scripture_KJV: removeTags(kjvData.find(v => v.Book === book['Index'] && parseInt(v.Chapter, 10) === parseInt(chapter, 10) && v.Verse === data.Verse)?.Scripture),
      }));

    res.json(verses);
  } catch (err) {
    console.error("Error loading verse data:", err);
    res.status(500).send('Error loading verse data');
  }
});

// 🔍 Search API: /api/search?q=God
app.get('/api/search', async (req, res) => {
  const query = (req.query.q || '').trim().toLowerCase().split(/\s+/);
  const selectedVersions = ['CN', 'NKJV', 'KJV'].filter(v => req.query[v] === 'true');
  const versionFileMap = {
    CN: 'Bible_CN.csv',
    NKJV: 'Bible_NKJV.csv',
    KJV: 'Bible_KJV.csv',
  };

  try {
    // Load all versions (for display)
    const versionData = {};
    for (const v of ['CN', 'NKJV', 'KJV']) {
      versionData[v] = await loadCSV(path.join(__dirname, 'data', versionFileMap[v]));
    }

    const verseMap = new Map();
   
    // Search only selected versions
    for (const v of selectedVersions) {
      versionData[v].forEach(verse => {
        const text = removeTags(verse.Scripture || '').toLowerCase();
        const isFound = query.every(word => text.includes(word));
        if (isFound) {
          const key = `${verse.Book}_${verse.Chapter}_${verse.Verse}`;
          if (!verseMap.has(key)) {
            verseMap.set(key, {
              BookIndex: parseInt(verse.Book, 10),
              Chapter: parseInt(verse.Chapter, 10),
              Verse: parseInt(verse.Verse, 10),
              Scripture_CN: '',
              Scripture_NKJV: '',
              Scripture_KJV: '',
            });
          }
        }
      });
    }

    // Populate all version texts into matched verses
    for (const [key, record] of verseMap.entries()) {
      const [book, chapter, verse] = key.split('_');
      for (const v of ['CN', 'NKJV', 'KJV']) {
        const match = versionData[v].find(
          item => item.Book === book && item.Chapter === chapter && item.Verse === verse
        );
        if (match) {
          record[`Scripture_${v}`] = removeTags(match.Scripture);
        }
      }
    }

    const results = Array.from(verseMap.values());
    res.json({ totalResult: results.length, results });
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).send('Internal Server Error');
  }
});

// For local development only
if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
}

// Export for Vercel serverless
module.exports = app;