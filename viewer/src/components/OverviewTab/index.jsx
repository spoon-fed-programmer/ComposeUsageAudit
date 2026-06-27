import { useState, useMemo } from 'react';
import FilterPanel from './FilterPanel';
import ComponentsTable from './ComponentsTable';

/**
 * OverviewTab - Flat component list with search and sort.
 *
 * @param {object}   props
 * @param {object[]} props.components     - Array of { file, name, count }
 * @param {Function} props.onNavigateFile - Called with file name to switch to Files tab
 */
export default function OverviewTab({ components, onNavigateFile }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortCol, setSortCol] = useState('file');
  const [sortDir, setSortDir] = useState('asc');

  const handleSort = (col) => {
    if (sortCol === col) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortCol(col);
      setSortDir('asc');
    }
  };

  const filtered = useMemo(() => {
    let result = components ?? [];

    // Search filter
    const q = searchQuery.toLowerCase().trim();
    if (q) {
      result = result.filter(
        (c) => c.name.toLowerCase().includes(q) || c.file.toLowerCase().includes(q)
      );
    }

    // Sort
    result = [...result].sort((a, b) => {
      let valA, valB;
      switch (sortCol) {
        case 'name':   valA = a.name.toLowerCase(); valB = b.name.toLowerCase(); break;
        case 'count':  valA = a.count; valB = b.count; break;
        case 'status': valA = a.count > 0 ? 1 : 0; valB = b.count > 0 ? 1 : 0; break;
        default:       valA = a.file.toLowerCase(); valB = b.file.toLowerCase(); break;
      }
      if (valA < valB) return sortDir === 'asc' ? -1 : 1;
      if (valA > valB) return sortDir === 'asc' ? 1 : -1;
      // Secondary sort by name
      if (sortCol !== 'name') {
        const na = a.name.toLowerCase(), nb = b.name.toLowerCase();
        if (na < nb) return -1;
        if (na > nb) return 1;
      }
      return 0;
    });

    return result;
  }, [components, searchQuery, filterStatus, sortCol, sortDir]);

  return (
    <div className="flex flex-col gap-6">
      <FilterPanel
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      <ComponentsTable
        components={filtered}
        sortCol={sortCol}
        sortDir={sortDir}
        onSort={handleSort}
        onNavigate={onNavigateFile}
      />
    </div>
  );
}
