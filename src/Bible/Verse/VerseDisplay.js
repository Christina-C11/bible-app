import React from 'react';

function VerseDisplay({ verseObj }) {
  return (
    <div>
      {(['CN', 'NKJV', 'KJV'].every(v => verseObj.selectedVersions[v] === false)) || verseObj.verses.length === 0 ? (
        <p>No verses available.</p>
      ) : (
        <div className="verse-content" style={{ textAlign: 'left' }}>
          {verseObj.verses.map((verse, index) => (
            <div key={index} className="verse-pair">
              {verseObj.selectedVersions.CN && (
                <div>{`【${verseObj.books[(verse.BookIndex)? verse.BookIndex-1:verseObj.selectedBookIndex]?.['Chinese Abbreviation']} 
                ${verseObj.books[(verse.BookIndex)? verse.BookIndex-1:verseObj.selectedBookIndex]?.['English Abbreviation']} 
                ${verse.Chapter}:${verse.Verse}】 ${verse.Scripture_CN}`}</div>
              )}
              {verseObj.selectedVersions.NKJV && (
                <div>[NKJV] {verse.Scripture_NKJV}</div>
              )}
              {verseObj.selectedVersions.KJV && (
                <div>[KJV] {verse.Scripture_KJV}</div>
              )}
              <br /> {/* Adding a line break after each verse pair */}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default VerseDisplay;
