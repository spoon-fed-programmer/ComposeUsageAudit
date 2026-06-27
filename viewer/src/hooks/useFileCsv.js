import { useState, useCallback } from 'react';
import { parseCSV } from '../utils/csvParser';

/**
 * Custom hook that fetches and parses a per-file CSV report.
 *
 * @param {object|null} selectedRun - The currently selected run object
 * @returns {{
 *   fileData: {pkgName: string, fileName: string, comps: object[]} | null,
 *   fileLoading: boolean,
 *   fileError: string|null,
 *   loadFileDetail: (csvFileName: string, timestamp: string) => Promise<void>,
 * }}
 */
export function useFileCsv(selectedRun) {
  const [fileData, setFileData] = useState(null);
  const [fileLoading, setFileLoading] = useState(false);
  const [fileError, setFileError] = useState(null);

  const loadFileDetail = useCallback(async (csvFileName, timestamp) => {
    setFileLoading(true);
    setFileError(null);
    setFileData(null);

    try {
      const url = `reports/${timestamp}/${csvFileName}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`${csvFileName} 데이터를 가져오지 못했습니다.`);

      const csvText = await res.text();
      const parsed = parseCSV(csvText);

      let pkgName = '';
      let fileName = '';
      const comps = [];
      let currentComp = null;
      let parsingUsages = false;

      parsed.forEach((row) => {
        if (row[0] === 'Package') {
          pkgName = row[1] ?? '';
        } else if (row[0] === 'File') {
          fileName = row[1] ?? '';
        } else if (row[0] === 'Component') {
          if (currentComp) comps.push(currentComp);
          currentComp = { name: row[1], count: 0, classes: [] };
          parsingUsages = false;
        } else if (row[0] === 'Reference Count' && currentComp) {
          currentComp.count = parseInt(row[1], 10) || 0;
        } else if (row[0] === 'Referenced Class' && currentComp) {
          parsingUsages = true;
        } else if (parsingUsages && currentComp) {
          if (row[0] && row[0].trim() !== '') {
            currentComp.classes.push(row[0]);
          }
        }
      });

      if (currentComp) comps.push(currentComp);

      setFileData({ pkgName, fileName: fileName || csvFileName, comps });
    } catch (err) {
      setFileError(err.message);
    } finally {
      setFileLoading(false);
    }
  }, []);

  return { fileData, fileLoading, fileError, loadFileDetail };
}
