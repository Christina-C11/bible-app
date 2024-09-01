import React, { useState, useEffect, useCallback } from 'react';
import './Bible.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import BookSection from './Book/BookSection';
import VersionSelector from './BibleVersion/VersionSelector';
import ChapterSelector from './Chapter/ChapterSelector';
import VerseDisplay from './Verse/VerseDisplay';

function Bible() {
  const [books, setBooks] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [verses, setVerses] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState('chinese');
  const [selectedBookIndex, setSelectedBookIndex] = useState('');
  const [selectedChapter, setSelectedChapter] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedVersions, setSelectedVersions] = useState({
    CN: true,
    NKJV: false,
    KJV: false,
  });

  useEffect(() => {
    setLoading(true);
    fetch('/api/books')
      .then(response => response.json())
      .then(data => {
        setBooks(data);
        setLoading(false);
      })
      .catch(error => {
        setError("Failed to load books.");
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (selectedBookIndex !== '') {
      setLoading(true);
      fetch(`/api/chapters?bookIndex=${selectedBookIndex}`)
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
      fetch(`/api/verses?bookIndex=${selectedBookIndex}&chapter=${selectedChapter}`)
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
    setVerses([]);
    setChapters([]);
    setError('');
  }, []);

  const handleBookSelection = useCallback((bookIndex) => {
    setSelectedBookIndex(bookIndex);
    setSelectedChapter('');
    setVerses([]);
    setChapters([]);
    setError('');
  }, []);

  const handleChapterSelection = useCallback((event) => {
    setSelectedChapter(Number(event.target.value));
    setVerses([]);
    setError('');
  }, []);

  const handleVersionChange = useCallback((event) => {
    setSelectedVersions(prevState => ({
      ...prevState,
      [event.target.name]: event.target.checked,
    }));
  }, []);

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
            chapters={chapters}
            selectedChapter={selectedChapter}
            handleChapterSelection={handleChapterSelection}
          />

          <VerseDisplay 
            verses={verses}
            selectedVersions={selectedVersions}
            books={books}
            selectedBookIndex={selectedBookIndex}
            abbrevClass={selectedLanguage === 'chinese' ? 'chinese-text' : 'english-text'}
            fullNameClass={selectedLanguage === 'chinese' ? 'chinese-text' : 'english-text'}
          />
        </div>
      </div>
    </div>
  );
}

export default Bible;
