import React, { useState } from 'react';
import { Filters, User } from '../types';
import { EXPENSE_CATEGORIES } from '../constants';

interface ExpenseFiltersProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  availablePayers: User[];
}

const ExpenseFilters: React.FC<ExpenseFiltersProps> = ({ filters, onFiltersChange, availablePayers }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleCategoryChange = (category: string) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter(c => c !== category)
      : [...filters.categories, category];
    onFiltersChange({ ...filters, categories: newCategories });
  };

  const handlePayerChange = (payerId: string) => {
    const newPayers = filters.payers.includes(payerId)
      ? filters.payers.filter(p => p !== payerId)
      : [...filters.payers, payerId];
    onFiltersChange({ ...filters, payers: newPayers });
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({ ...filters, [e.target.name]: e.target.value });
  };

  const clearFilters = () => {
    onFiltersChange({
      categories: [],
      payers: [],
      startDate: '',
      endDate: '',
    });
  };

  const activeFilterCount = 
    (filters.categories.length > 0 ? 1 : 0) +
    (filters.payers.length > 0 ? 1 : 0) +
    (filters.startDate ? 1 : 0) +
    (filters.endDate ? 1 : 0);

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-8">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center text-lg font-semibold text-gray-700"
      >
        <span>Filters {activeFilterCount > 0 && <span className="bg-primary text-white text-xs font-bold rounded-full px-2 py-1 ml-2">{activeFilterCount}</span>}</span>
        <span className={`transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>▼</span>
      </button>
      {isOpen && (
        <div className="mt-4 pt-4 border-t">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Categories */}
            <div>
              <h4 className="font-semibold mb-2 text-gray-600">Category</h4>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {EXPENSE_CATEGORIES.map(category => (
                  <label key={category} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.categories.includes(category)}
                      onChange={() => handleCategoryChange(category)}
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                    <span>{category}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Payers */}
            <div>
              <h4 className="font-semibold mb-2 text-gray-600">Paid By</h4>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {availablePayers.map(user => (
                  <label key={user.id} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.payers.includes(user.id)}
                      onChange={() => handlePayerChange(user.id)}
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                    <span>{user.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Date Range */}
            <div>
              <h4 className="font-semibold mb-2 text-gray-600">Date Range</h4>
              <div className="space-y-2">
                 <div>
                    <label htmlFor="startDate" className="text-sm text-gray-500">From</label>
                    <input type="date" name="startDate" id="startDate" value={filters.startDate} onChange={handleDateChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 focus:outline-none focus:ring-primary focus:border-primary" />
                 </div>
                 <div>
                    <label htmlFor="endDate" className="text-sm text-gray-500">To</label>
                    <input type="date" name="endDate" id="endDate" value={filters.endDate} onChange={handleDateChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 focus:outline-none focus:ring-primary focus:border-primary" />
                 </div>
              </div>
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <button onClick={clearFilters} className="bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors">Clear Filters</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseFilters;
