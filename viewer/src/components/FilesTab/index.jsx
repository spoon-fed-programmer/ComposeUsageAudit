import { useState, useEffect } from 'react';
import { useFileCsv } from '../../hooks/useFileCsv';
import FileMenuList from './FileMenuList';
import FileDetailPanel from './FileDetailPanel';

/**
 * FilesTab - Two-panel layout: file menu list + file detail.
 *
 * @param {object}   props
 * @param {object}   props.selectedRun      - Current run object
 * @param {string|null} props.initialFile   - Pre-selected file (from overview navigation)
 */
import { useI18n } from '../../contexts/I18nContext';

export default function FilesTab({ selectedRun, prevTimestamp, initialFile }) {
  const { t } = useI18n();
  const files = selectedRun?.files ?? [];
  const [selectedFile, setSelectedFile] = useState(initialFile ?? files[0] ?? null);
  const { fileData, fileLoading, fileError, loadFileDetail } = useFileCsv(selectedRun);

  // Load detail whenever selectedFile changes
  useEffect(() => {
    if (selectedFile && selectedRun?.timestamp) {
      loadFileDetail(selectedFile, selectedRun.timestamp, prevTimestamp);
    }
  }, [selectedFile, selectedRun?.timestamp, prevTimestamp, loadFileDetail]);

  // If navigated here with a new initialFile, update selection
  useEffect(() => {
    if (initialFile && initialFile !== selectedFile) {
      setSelectedFile(initialFile);
    }
  }, [initialFile]);

  if (files.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-text-muted">
        {t('no_file_details')}
      </div>
    );
  }

  return (
    <div className="grid gap-7" style={{ gridTemplateColumns: '240px 1fr', alignItems: 'flex-start' }}>
      <FileMenuList
        files={files}
        selectedFile={selectedFile}
        onSelect={setSelectedFile}
      />
      <FileDetailPanel
        fileData={fileData}
        loading={fileLoading}
        error={fileError}
      />
    </div>
  );
}
