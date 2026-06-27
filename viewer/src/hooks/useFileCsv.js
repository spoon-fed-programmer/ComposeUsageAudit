import { useState, useCallback } from 'react';

/**
 * Custom hook that extracts a file's component data from memory.
 * No network requests needed since all data is preloaded in selectedRun.
 */
export function useFileCsv(selectedRun) {
  const [fileData, setFileData] = useState(null);
  const [fileLoading, setFileLoading] = useState(false);
  const [fileError, setFileError] = useState(null);

  const loadFileDetail = useCallback(async (fileName, _timestamp) => {
    setFileLoading(true);
    setFileError(null);
    try {
      if (!selectedRun || !selectedRun.components) {
        setFileData(null);
        return;
      }
      // Filter components belonging to this file
      const fileComps = selectedRun.components.filter((c) => c.file === fileName);
      if (fileComps.length === 0) {
        throw new Error(`${fileName} 에 해당하는 컴포넌트를 찾지 못했습니다.`);
      }
      const pkgName = fileComps[0].package || '';
      
      const comps = fileComps.map((c) => ({
        name: c.name,
        count: c.count,
        classes: c.ref_classes || [],
      }));

      setFileData({
        pkgName,
        fileName,
        comps,
      });
    } catch (err) {
      setFileError(err.message);
    } finally {
      setFileLoading(false);
    }
  }, [selectedRun]);

  return { fileData, fileLoading, fileError, loadFileDetail };
}
