import React from 'react';

function VerseDisplay({ verseObj }) {
  if ((['CN', 'NKJV', 'KJV'].every(v => verseObj.selectedVersions[v] === false)) || verseObj.verses.length === 0) {
    return <div><p>No verses available.</p></div>;
  }

  const verseText = verseObj.verses.map((verse) => {
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
    return lines.join('\n');
  }).join('\n \n');

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
      <pre style={{ fontFamily: 'inherit', fontSize: 'inherit', whiteSpace: 'pre-wrap', margin: 0, textAlign: 'left' }}>
        {verseText}
      </pre>
    </div>
  );
}

export default VerseDisplay;
