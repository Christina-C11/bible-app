import React from 'react';

function BookSection({ title, books, startIndex, endIndex, selectedLanguage, handleBookSelection, selectedBookIndex }) {
  return (
    <div className="mb-4 book-section">
      <h2>{title}</h2>
      <div className="row g-2"> {/* Use 'g-2' for tighter spacing */}
        {books.slice(startIndex, endIndex + 1).map((book, index) => (
          <div className="col-6 col-sm-4 col-md-3 col-lg-2 mb-2" key={index}>
            <button
              onClick={() => handleBookSelection(startIndex + index)}
              className={`btn btn-outline-primary w-100 text-center book-button ${selectedBookIndex === startIndex + index ? 'active' : ''}`}
            >
              {selectedLanguage === 'chinese' ? (
                <>
                  <div className="fs-6 book-abbreviation">
                    {book['Chinese Abbreviation']}
                  </div>
                  <div className="fs-7 text-muted book-fullname">
                    {book['Chinese Full Name']}
                  </div>
                </>
              ) : (
                <>
                  <div className="fs-6 book-abbreviation">
                    {book['English Abbreviation']}
                  </div>
                  <div className="fs-7 text-muted book-fullname">
                    {book['English Full Name']}
                  </div>
                </>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default BookSection;