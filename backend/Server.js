const express = require('express');
const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');
const app = express();
const port = 5000;

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

// Serve Books data
app.get('/api/books', async (req, res) => {
  try {
    const books = await loadCSV(path.join(__dirname, 'data', 'Books.csv'));
    res.json(books);
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
const removeTags = (text) => text.replace(/<[^>]*>/g, '');

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

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
