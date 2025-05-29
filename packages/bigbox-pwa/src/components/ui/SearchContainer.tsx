import React from 'react';
import { IoSearch } from 'react-icons/io5';

interface SearchContainerProps {
  onClick?: () => void;
  className?: string;
}

export const SearchContainer: React.FC<SearchContainerProps> = ({ 
  onClick, 
  className 
}) => {
  return (
    <div className={`search-container ${className || ''}`}>
      <div className="search-bar-home" onClick={onClick}>
        <IoSearch className="search-icon" />
        <span>Search</span>
      </div>
    </div>
  );
};

export default SearchContainer;
