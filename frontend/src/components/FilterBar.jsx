import React, { useState, useEffect } from 'react';
import { useMailContext } from '../context/MailContext';
import { Search, Filter, X } from 'lucide-react';

const FilterBar = () => {
  const { activeFilters, filterInbox } = useMailContext();
  const [isOpen, setIsOpen] = useState(false);
  
  const [keyword, setKeyword] = useState('');
  const [sender, setSender] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [unreadOnly, setUnreadOnly] = useState(false);

  // Sync from context (e.g., when AI applies filters)
  useEffect(() => {
    setKeyword(activeFilters.keyword || '');
    setSender(activeFilters.sender || '');
    setDateFrom(activeFilters.date_from || '');
    setDateTo(activeFilters.date_to || '');
    setUnreadOnly(activeFilters.unread_only || false);
  }, [activeFilters]);

  const handleApply = (e) => {
    e.preventDefault();
    filterInbox({ keyword, sender, dateFrom, dateTo, unreadOnly });
  };

  const handleClear = () => {
    setKeyword('');
    setSender('');
    setDateFrom('');
    setDateTo('');
    setUnreadOnly(false);
    filterInbox({ keyword: '', sender: '', dateFrom: '', dateTo: '', unreadOnly: false });
  };

  return (
    <div className="filter-bar-container">
      <form className="simple-search" onSubmit={handleApply}>
        <div className="search-input-wrapper">
          <Search className="search-icon w-4 h-4" />
          <input
            type="text"
            placeholder="Search emails..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
        </div>
        <button type="button" className="btn-icon" onClick={() => setIsOpen(!isOpen)} title="Advanced Filters">
          <Filter className="w-5 h-5" />
        </button>
      </form>

      {isOpen && (
        <div className="advanced-filters">
          <div className="filter-group">
            <label>Sender</label>
            <input type="text" placeholder="example@domain.com" value={sender} onChange={e => setSender(e.target.value)} />
          </div>
          <div className="filter-group">
            <label>Date From (YYYY/MM/DD)</label>
            <input type="text" placeholder="e.g. 2024/01/01" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
          </div>
          <div className="filter-group">
            <label>Date To (YYYY/MM/DD)</label>
            <input type="text" placeholder="e.g. 2024/12/31" value={dateTo} onChange={e => setDateTo(e.target.value)} />
          </div>
          <div className="filter-group checkbox-group">
            <label>
              <input type="checkbox" checked={unreadOnly} onChange={e => setUnreadOnly(e.target.checked)} />
              Unread only
            </label>
          </div>
          <div className="filter-actions">
            <button type="button" className="btn-secondary" onClick={handleClear}>Clear</button>
            <button type="button" className="btn-primary" onClick={handleApply}>Apply Filters</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterBar;
