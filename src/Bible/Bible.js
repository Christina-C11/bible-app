import React, { useState, useEffect, useCallback } from 'react';
import './Bible.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import BookSection from './Book/BookSection';
import VersionSelector from './BibleVersion/VersionSelector';
import ChapterSelector from './Chapter/ChapterSelector';
import VerseDisplay from './Verse/VerseDisplay';

function Bible() {
  const [books, setBooks] = useState([]);
  const [preloadedData, setPreloadedData] = useState({});
  const [chapters, setChapters] = useState([]);
  const [verses, setVerses] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState('chinese');
  const [selectedBookIndex, setSelectedBookIndex] = useState('0');
  const [selectedChapter, setSelectedChapter] = useState('1');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedVersions, setSelectedVersions] = useState({
    CN: true,
    NKJV: true,
    KJV: false,
  });

  const [searchText, setSearchText] = useState('');
    let verseObj = {
    verses: verses,
    selectedVersions: selectedVersions,
    books: books,
    selectedBookIndex: selectedBookIndex
  };
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '';

  // Preload data for the selected Bible version
  useEffect(() => {
    const selectedVersion = Object.keys(selectedVersions).find(v => selectedVersions[v]);
    if (selectedVersion) {
      setLoading(true);
      fetch(`${API_BASE_URL}/api/preload/${selectedVersion}`)
        .then(response => response.json())
        .then(data => {
          setPreloadedData(data);
          setBooks(data.map(d => d.book)); // Assuming each entry has a `book` field
          setLoading(false);
        })
        .catch(error => {
          setError("Failed to preload Bible data.");
          console.error("Error preloading Bible data:", error);
          setLoading(false);
        });
    }
  }, [selectedVersions]);


  useEffect(() => {
    if (selectedBookIndex !== '') {
      setLoading(true);
      fetch(`${API_BASE_URL}/api/chapters?bookIndex=${selectedBookIndex}`)
        .then(response => response.json())
        .then(data => {
          setChapters(data.map(Number));
          setLoading(false);
        })
        .catch(error => {
          setError("Failed to load chapters.");
          setLoading(false);
        });
    } else {
      setChapters([]);
      setVerses([]);
    }
  }, [selectedBookIndex]);

  useEffect(() => {
    if (selectedChapter) {
      setLoading(true);
      fetch(`${API_BASE_URL}/api/verses?bookIndex=${selectedBookIndex}&chapter=${selectedChapter}`)
        .then(response => response.json())
        .then(data => {
          setVerses(data);
          setLoading(false);
        })
        .catch(error => {
          setError("Failed to load verses.");
          setLoading(false);
        });
    } else {
      setVerses([]);
    }
  }, [selectedChapter, selectedBookIndex]);

  const handleLanguageChange = useCallback((event) => {
    setSelectedLanguage(event.target.value);
    setSelectedBookIndex('');
    setSelectedChapter('');
  }, []);

  const handleBookSelection = useCallback((bookIndex) => {
    setSelectedBookIndex(bookIndex);
    setSelectedChapter('');
  }, []);

  const handleChapterSelection = useCallback((event) => {
    setSelectedChapter(Number(event.target.value));
  }, []);

  const handleVersionChange = useCallback((event) => {
    setSelectedVersions(prevState => ({
      ...prevState,
      [event.target.name]: event.target.checked,
    }));
  }, []);

  // Extract verses from the preloaded data
  const getVersesForBookAndChapter = (bookIndex, chapter) => {
    if (!preloadedData[bookIndex]) return [];
    return preloadedData[bookIndex].chapters[chapter] || [];
  };

  return (
    <div className="mx-5 my-4">
      <h1 className="mb-4">Bible App</h1>

      <div className="mb-4">
        <label htmlFor="language-select" className="form-label">Select Language:</label>
        <select 
          id="language-select" 
          value={selectedLanguage} 
          onChange={handleLanguageChange}
          className="form-select"
        >
          <option value="chinese">Chinese</option>
          <option value="english">English</option>
        </select>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p className="text-danger">{error}</p>}

      <div className="row">
        {/* Book Sections */}
        <div className="col-md-12 col-lg-4">
          <BookSection
            title={selectedLanguage === 'chinese' ? '旧约' : 'Old Testament'}
            books={books}
            startIndex={0}
            endIndex={38}
            selectedLanguage={selectedLanguage}
            handleBookSelection={handleBookSelection}
            selectedBookIndex={selectedBookIndex}
            abbrevClass={selectedLanguage === 'chinese' ? 'chinese-text' : 'english-text'}
            fullNameClass={selectedLanguage === 'chinese' ? 'chinese-text' : 'english-text'}
          />
          <BookSection
            title={selectedLanguage === 'chinese' ? '新约' : 'New Testament'}
            books={books}
            startIndex={39}
            endIndex={65}
            selectedLanguage={selectedLanguage}
            handleBookSelection={handleBookSelection}
            selectedBookIndex={selectedBookIndex}
            abbrevClass={selectedLanguage === 'chinese' ? 'chinese-text' : 'english-text'}
            fullNameClass={selectedLanguage === 'chinese' ? 'chinese-text' : 'english-text'}
          />
        </div>

        {/* Right Side: Version Selection, Chapter, and Verses */}
        <div className="col-md-12 col-lg-8">
          <VersionSelector 
            selectedVersions={selectedVersions}
            handleVersionChange={handleVersionChange}
          />

          <ChapterSelector 
            chapters={Object.keys(preloadedData[selectedBookIndex]?.chapters || [])}
            selectedChapter={selectedChapter}
            handleChapterSelection={handleChapterSelection}
          />

          <VerseDisplay 
            verseObj={verseObj}
          />
        </div>
      </div>
    </div>
  );
}

export default Bible;
