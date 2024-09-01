import React from 'react';

function VerseDisplay({ verses, selectedVersions, books, selectedBookIndex }) {
  return (
    <div>
      {verses.length === 0 ? (
        <p>No verses available.</p>
      ) : (
        <div className="verse-content" style={{ textAlign: 'left' }}>
          {verses.map((verse, index) => (
            <div key={index} className="verse-pair">
              {selectedVersions.CN && (
                <div>{`【${books[selectedBookIndex]?.['Chinese Abbreviation']} ${books[selectedBookIndex]?.['English Abbreviation']} ${verse.Chapter}:${verse.Verse}】 ${verse.Scripture_CN}`}</div>
              )}
              {selectedVersions.NKJV && (
                <div>[NKJV] {verse.Scripture_NKJV}</div>
              )}
              {selectedVersions.KJV && (
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
