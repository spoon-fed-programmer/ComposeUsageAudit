import { useState, useCallback } from 'react';

/**
 * Custom hook that fetches and parses component-specific details JSON.
 */
export function useFileCsv(selectedRun) {
  const [fileData, setFileData] = useState(null);
  const [fileLoading, setFileLoading] = useState(false);
  const [fileError, setFileError] = useState(null);

  const loadFileDetail = useCallback(async (fileName, timestamp) => {
    setFileLoading(true);
    setFileError(null);
    setFileData(null);

    try {
      if (!selectedRun || !selectedRun.categoryDir) {
        throw new Error('선택된 리포트 정보가 없습니다.');
      }

      // Convert Buttons.kt to Buttons.json
      const fileBase = fileName.replace(/\.[^/.]+$/, "");
      const jsonFileName = `${fileBase}.json`;

      const url = `${selectedRun.categoryDir}/${timestamp}/${jsonFileName}?t=${Date.now()}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`${jsonFileName} 데이터를 가져오지 못했습니다.`);

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
  }, [selectedRun]);

  return { fileData, fileLoading, fileError, loadFileDetail };
}
