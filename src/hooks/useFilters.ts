import { useState, useMemo, useCallback } from 'react';

/**
 * useFilters - Custom hook for managing filter state
 * Provides search term and category/status/location/role filters
 */
interface UseFiltersProps {
  initialCategory?: 'All' | 'Primera' | 'Segunda' | 'Tercera';
  initialStatus?: 'All' | 'Active' | 'Inactive';
  initialLocation?: 'Llanogrande' | 'Medellín';
  initialRole?: 'Golf' | 'Tennis' | 'Hybrid';
}

export const useFilters = (props: UseFiltersProps = {}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState(props.initialCategory || 'All');
  const [status, setStatus] = useState(props.initialStatus || 'All');
  const [location, setLocation] = useState(props.initialLocation);
  const [role, setRole] = useState(props.initialRole);

  const hasActiveFilters = searchTerm !== '' || category !== 'All' || status !== 'All' || location !== undefined || role !== undefined;

  const clearAllFilters = useCallback(() => {
    setSearchTerm('');
    setCategory('All');
    setStatus('All');
    setLocation(undefined);
    setRole(undefined);
  }, []);

  const filters = useMemo(() => ({
    searchTerm,
    category,
    activeStatus: status,
    location,
    role,
  }), [searchTerm, category, status, location, role]);

  const setFilter = useCallback((key: string, value: any) => {
    switch (key) {
      case 'searchTerm':
        setSearchTerm(value);
        break;
      case 'category':
        setCategory(value);
        break;
      case 'status':
        setStatus(value);
        break;
      case 'location':
        setLocation(value);
        break;
      case 'role':
        setRole(value);
        break;
    }
  }, []);

  return {
    // Filters state
    filters,
    hasActiveFilters,

    // Actions
    setSearchTerm,
    setCategory,
    setStatus,
    setLocation,
    setRole,
    setFilter,
    clearAllFilters,
  };
};
