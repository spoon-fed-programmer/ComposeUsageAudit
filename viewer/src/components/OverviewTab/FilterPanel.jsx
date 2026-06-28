/**
 * FilterPanel - Search input and sort selectors.
 *
 * @param {object}   props
 * @param {string}   props.searchQuery
 * @param {Function} props.onSearchChange
 * @param {string}   props.sortValue
 * @param {Function} props.onSortChange
 */
import { useI18n } from '../../contexts/I18nContext';

export default function FilterPanel({ searchQuery, onSearchChange, sortValue, onSortChange }) {
  const { t } = useI18n();

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-[rgba(17,22,34,0.4)] border border-border px-4 py-4 rounded-md">
      {/* Search */}
      <div className="relative flex-1 max-w-md">
        <svg
          className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 fill-text-muted pointer-events-none"
          viewBox="0 0 24 24"
        >
          <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
        </svg>
        <input
          type="text"
          id="comp-search"
          placeholder={t('search_placeholder')}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full bg-bg/80 border border-border rounded-sm pl-10 pr-4 py-2.5 text-sm text-text-primary font-sans outline-none transition-all focus:border-accent focus:shadow-accent-sm"
        />
      </div>

      {/* Sort Select */}
      <div className="flex items-center gap-2 bg-panel border border-border px-3 py-1.5 rounded-md self-start sm:self-auto">
        <label htmlFor="comp-sort-select" className="text-xs text-text-secondary font-medium whitespace-nowrap">
          {t('sort_label')}:
        </label>
        <select
          id="comp-sort-select"
          value={sortValue}
          onChange={(e) => onSortChange(e.target.value)}
          className="bg-bg/80 text-text-primary border border-border px-3 py-1.5 rounded-sm text-xs font-sans cursor-pointer outline-none transition-colors hover:border-accent"
        >
          <option value="file_asc">{t('sort_file_asc')}</option>
          <option value="file_desc">{t('sort_file_desc')}</option>
          <option value="name_asc">{t('sort_name_asc')}</option>
          <option value="name_desc">{t('sort_name_desc')}</option>
          <option value="count_desc">{t('sort_count_desc')}</option>
          <option value="count_asc">{t('sort_count_asc')}</option>
        </select>
      </div>
    </div>
  );
}
