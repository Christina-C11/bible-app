import React from 'react';

function SearchSelector({ searchText, setSearchText }) {
  return (
    <div className="mb-4 d-flex align-items-center">
      <span className="me-3">Search:</span>
      <input
        type="text"
        className="form-control"
        placeholder="Search..."
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
      />
    </div>
  );
}

export default SearchSelector;