import React, { useState, useEffect, useRef } from 'react';
import { Search, ExpandMore, Check, LocationOn } from '@mui/icons-material';
import { searchSchools, getSchoolsByRegion } from '../../data/ghanaianSchools';

interface SchoolAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
  region?: string; // Optional region filter
}

const SchoolAutocomplete: React.FC<SchoolAutocompleteProps> = ({
  value,
  onChange,
  placeholder = "Type to search for your school...",
  required = false,
  className = "",
  region
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(value);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [showRegionalSchools, setShowRegionalSchools] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Update search term when value changes externally
  useEffect(() => {
    setSearchTerm(value);
  }, [value]);

  // Search for schools when search term changes
  useEffect(() => {
    if (searchTerm.length >= 2) {
      const results = searchSchools(searchTerm);
      setSuggestions(results);
      setIsOpen(results.length > 0);
      setHighlightedIndex(-1);
    } else if (searchTerm.length === 0 && region && showRegionalSchools) {
      // Show regional schools when input is empty and region is selected
      const regionalSchools = getSchoolsByRegion(region);
      setSuggestions(regionalSchools.slice(0, 10));
      setIsOpen(regionalSchools.length > 0);
    } else {
      setSuggestions([]);
      setIsOpen(false);
    }
  }, [searchTerm, region, showRegionalSchools]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    onChange(newValue);
    setShowRegionalSchools(false);
  };

  // Handle suggestion selection
  const handleSuggestionClick = (school: string) => {
    setSearchTerm(school);
    onChange(school);
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true);
        if (region && searchTerm.length === 0) {
          setShowRegionalSchools(true);
        }
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
          handleSuggestionClick(suggestions[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setHighlightedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  // Handle focus
  const handleFocus = () => {
    if (searchTerm.length >= 2) {
      setIsOpen(suggestions.length > 0);
    } else if (region) {
      setShowRegionalSchools(true);
    }
  };

  // Handle blur
  const handleBlur = (e: React.FocusEvent) => {
    // Delay closing to allow for suggestion clicks
    setTimeout(() => {
      if (!dropdownRef.current?.contains(e.relatedTarget as Node)) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    }, 150);
  };

  // Show regional schools when dropdown arrow is clicked
  const handleDropdownToggle = () => {
    if (!isOpen && region) {
      setShowRegionalSchools(true);
      setIsOpen(true);
    } else {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          required={required}
          className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
          autoComplete="off"
        />
        
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
          <button
            type="button"
            onClick={handleDropdownToggle}
            className="text-gray-400 hover:text-gray-600 focus:outline-none"
            tabIndex={-1}
          >
            <ExpandMore className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto"
        >
          {/* Regional schools header */}
          {showRegionalSchools && region && (
            <div className="px-3 py-2 text-xs font-medium text-gray-500 bg-gray-50 border-b flex items-center">
              <LocationOn className="h-3 w-3 mr-1" />
              Schools in {region.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} Region
            </div>
          )}
          
          {suggestions.map((school, index) => (
            <div
              key={school}
              onClick={() => handleSuggestionClick(school)}
              className={`px-3 py-2 cursor-pointer text-sm transition-colors ${
                index === highlightedIndex
                  ? 'bg-green-50 text-green-700'
                  : 'text-gray-900 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="truncate">{school}</span>
                {value === school && (
                  <Check className="h-4 w-4 text-green-600 flex-shrink-0 ml-2" />
                )}
              </div>
            </div>
          ))}
          
          {/* Search hint */}
          {!showRegionalSchools && searchTerm.length >= 2 && (
            <div className="px-3 py-2 text-xs text-gray-500 bg-gray-50 border-t">
              {suggestions.length === 10 ? 'Showing top 10 results. Type more to narrow down.' : 
               suggestions.length === 0 ? 'No schools found. Try a different search term.' :
               `${suggestions.length} school${suggestions.length !== 1 ? 's' : ''} found.`}
            </div>
          )}
        </div>
      )}

      {/* Help text */}
      <div className="mt-1 text-xs text-gray-500">
        {searchTerm.length < 2 && !showRegionalSchools ? (
          <>Type at least 2 characters to search for schools{region && ', or click the dropdown to see regional schools'}</>
        ) : (
          <>Use arrow keys to navigate, Enter to select, Escape to close</>
        )}
      </div>
    </div>
  );
};

export default SchoolAutocomplete;