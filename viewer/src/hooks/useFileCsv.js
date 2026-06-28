import { useState, useCallback } from 'react';
import { useI18n } from '../contexts/I18nContext';

/**
 * Custom hook that fetches and parses component-specific details JSON.
 */
export function useFileCsv(selectedRun) {
  const { t } = useI18n();
  const [fileData, setFileData] = useState(null);
  const [fileLoading, setFileLoading] = useState(false);
  const [fileError, setFileError] = useState(null);

  const loadFileDetail = useCallback(async (fileName, timestamp) => {
    setFileLoading(true);
    setFileError(null);
    setFileData(null);

    try {
      if (!selectedRun || !selectedRun.categoryDir) {
        throw new Error(t('no_file_details'));
      }

      // Convert Buttons.kt to Buttons.json
      const fileBase = fileName.replace(/\.[^/.]+$/, "");
      const jsonFileName = `${fileBase}.json`;

      const url = `${selectedRun.categoryDir}/${timestamp}/${jsonFileName}?t=${Date.now()}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(t('fetch_failed') + ` (${jsonFileName})`);

      const data = await res.json();

      setFileData({
        pkgName: data.package || '',
        fileName: data.file || fileName,
        comps: data.components || [],
      });
    } catch (err) {
      setFileError(err.message);
    } finally {
      setFileLoading(false);
    }
  }, [selectedRun, t]);

  return { fileData, fileLoading, fileError, loadFileDetail };
}
