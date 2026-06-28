/**
 * FileMenuList - Left-side file navigation list for the Files tab.
 *
 * @param {object}   props
 * @param {string[]} props.files         - Array of CSV file names
 * @param {string}   props.selectedFile  - Currently active file name
 * @param {Function} props.onSelect      - Called with a file name string
 */
import { useI18n } from '../../contexts/I18nContext';

export default function FileMenuList({ files, selectedFile, onSelect }) {
  const { t } = useI18n();

  return (
    <div className="flex flex-col gap-1.5 bg-[rgba(17,22,34,0.4)] border border-border p-3 rounded-md">
      <div className="text-[11px] font-semibold uppercase text-text-muted tracking-wider px-2.5 pb-2.5">
        {t('component_source_files')}
      </div>

      {files.map((file) => {
        const isActive = selectedFile === file;
        return (
          <button
            key={file}
            onClick={() => onSelect(file)}
            className={[
              'flex justify-between items-center px-3.5 py-2.5 rounded-sm text-left font-mono text-sm transition-all duration-200 cursor-pointer border-0',
              isActive
                ? 'bg-accent text-white font-semibold shadow-accent-sm'
                : 'bg-transparent text-text-secondary hover:bg-white/4 hover:text-text-primary',
            ].join(' ')}
          >
            <span>{file}</span>
          </button>
        );
      })}
    </div>
  );
}
