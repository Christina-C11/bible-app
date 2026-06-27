import React, { useRef, useEffect } from 'react';

function VerseDisplay({ verseObj, isSearchMode, onVerseClick, highlightedVerse }) {
  const highlightRef = useRef(null);

  useEffect(() => {
    if (highlightRef.current) {
      highlightRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [highlightedVerse]);

  if ((['CN', 'NKJV', 'KJV'].every(v => verseObj.selectedVersions[v] === false)) || verseObj.verses.length === 0) {
    return <div><p>No verses available.</p></div>;
  }

  return (
    <div
      className="verse-content"
      style={{ textAlign: 'left' }}
      onCopy={(e) => {
        const selection = window.getSelection();
        if (!selection || selection.isCollapsed) return;
        e.clipboardData.setData('text/plain', selection.toString());
        e.preventDefault();
      }}
    >
      {verseObj.verses.map((verse, i) => {
        const bookIndex = verse.BookIndex ? verse.BookIndex - 1 : verseObj.selectedBookIndex;
        const bookCN = verseObj.books[bookIndex]?.['Chinese Abbreviation'];
        const bookEN = verseObj.books[bookIndex]?.['English Abbreviation'];
        const lines = [];
        if (verseObj.selectedVersions.CN) {
          lines.push(`【${bookCN} ${bookEN} ${verse.Chapter}:${verse.Verse}】 ${verse.Scripture_CN}`);
        }
        if (verseObj.selectedVersions.NKJV) {
          lines.push(`[NKJV] ${verse.Scripture_NKJV}`);
        }
        if (verseObj.selectedVersions.KJV) {
          lines.push(`[KJV] ${verse.Scripture_KJV}`);
        }

        const isHighlighted =
          highlightedVerse &&
          Number(highlightedVerse.bookIndex) === Number(verse.BookIndex ?? (Number(verseObj.selectedBookIndex) + 1)) &&
          Number(highlightedVerse.chapter) === Number(verse.Chapter) &&
          Number(highlightedVerse.verse) === Number(verse.Verse);

        return (
          <React.Fragment key={i}>
            <pre
              ref={isHighlighted ? highlightRef : null}
              onClick={isSearchMode ? () => onVerseClick(verse.BookIndex - 1, verse.Chapter, verse.Verse) : undefined}
              style={{
                fontFamily: 'inherit',
                fontSize: 'inherit',
                whiteSpace: 'pre-wrap',
                margin: 0,
                textAlign: 'left',
                padding: isSearchMode || isHighlighted ? '2px 6px' : '0',
                borderRadius: '4px',
                backgroundColor: isHighlighted ? '#fff3cd' : 'transparent',
                cursor: isSearchMode ? 'pointer' : 'default',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={isSearchMode ? (e) => { if (!isHighlighted) e.currentTarget.style.backgroundColor = '#f0f0f0'; } : undefined}
              onMouseLeave={isSearchMode ? (e) => { if (!isHighlighted) e.currentTarget.style.backgroundColor = 'transparent'; } : undefined}
            >
              {lines.join('\n')}
            </pre>
            {i < verseObj.verses.length - 1 && (
              <pre style={{ fontFamily: 'inherit', fontSize: 'inherit', whiteSpace: 'pre-wrap', margin: 0 }}>{' \n'}</pre>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

export default VerseDisplay;
