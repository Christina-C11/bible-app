import React from 'react';

function VersionSelector({ selectedVersions, handleVersionChange }) {
  return (
    <div className="mb-4 d-flex align-items-center">
      <span className="me-3">Bible Version:</span>
      <div className="form-check me-3">
        <input 
          type="checkbox" 
          className="form-check-input" 
          id="CN" 
          name="CN" 
          checked={selectedVersions.CN} 
          onChange={handleVersionChange} 
        />
        <label className="form-check-label" htmlFor="CN">和合本</label>
      </div>
      <div className="form-check me-3">
        <input 
          type="checkbox" 
          className="form-check-input" 
          id="NKJV" 
          name="NKJV" 
          checked={selectedVersions.NKJV} 
          onChange={handleVersionChange} 
        />
        <label className="form-check-label" htmlFor="NKJV">NKJV</label>
      </div>
      <div className="form-check">
        <input 
          type="checkbox" 
          className="form-check-input" 
          id="KJV" 
          name="KJV" 
          checked={selectedVersions.KJV} 
          onChange={handleVersionChange} 
        />
        <label className="form-check-label" htmlFor="KJV">KJV</label>
      </div>
    </div>
  );
}

export default VersionSelector;