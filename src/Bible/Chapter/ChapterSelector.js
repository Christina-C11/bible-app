import React from 'react';
import Select from 'react-select';
import './ChapterSelector.css'; // Optional: If you have additional custom styles

function ChapterSelector({ chapters, selectedChapter, handleChapterSelection }) {
  // Convert chapters to options format required by react-select
  const options = [{ value: '', label: 'Select a chapter' }, ...chapters.map(chapter => ({ value: chapter, label: chapter.toString() }))];

  const customStyles = {
    container: (provided) => ({
      ...provided,
      width: '100%',
    }),
    control: (provided) => ({
      ...provided,
      fontSize: '16px',
      textAlign: 'left',
    }),
    menu: (provided) => ({
      ...provided,
      textAlign: 'left',
    }),
    option: (provided) => ({
      ...provided,
    }),
  };

  const filterOption = (option, inputValue) => {
    // Only consider the first 3 characters of the input value
    const searchValue = inputValue.slice(0, 3).toLowerCase();
    return option.label.toLowerCase().startsWith(searchValue);
  };

  const handleInputChange = (inputValue) => {
    // Limit the input to the first 3 characters
    return inputValue.slice(0, 3);
  };

  return (
    <div className="mb-4 d-flex align-items-center">
      <label className="me-3" htmlFor="chapter-select">Chapter:</label>
      <Select
        id="chapter-select"
        value={options.find(option => option.value === selectedChapter)}
        onChange={option => handleChapterSelection({ target: { value: option.value } })}
        options={options}
        placeholder="Select a chapter"
        isSearchable
        filterOption={filterOption} // Use the custom filterOption function
        onInputChange={handleInputChange} // Limit input to 3 characters
        styles={customStyles} // Apply custom styles
        classNamePrefix="react-select"
      />
    </div>
  );
}

export default ChapterSelector;
