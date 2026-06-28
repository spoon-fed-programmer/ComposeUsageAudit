import { useState, useCallback } from 'react';
import { useI18n } from '../contexts/I18nContext';
import { getCachedDetail, setCachedDetail } from '../utils/cache';

/**
 * Custom hook that fetches and parses component-specific details JSON.
 */
export function useFileCsv(selectedRun) {
  const { t } = useI18n();
  const [fileData, setFileData] = useState(null);
  const [fileLoading, setFileLoading] = useState(false);
  const [fileError, setFileError] = useState(null);

  const loadFileDetail = useCallback(async (fileName, timestamp, prevTimestamp) => {
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

      // Helper function to fetch single detail (with cache fallback)
      const fetchDetail = async (ts) => {
        if (!ts) return null;
        const cached = getCachedDetail(selectedRun.categoryDir, ts, jsonFileName);
        if (cached) return cached;

        try {
          const url = `${selectedRun.categoryDir}/${ts}/${jsonFileName}?t=${Date.now()}`;
          const res = await fetch(url);
          if (!res.ok) return null;
          const data = await res.json();
          setCachedDetail(selectedRun.categoryDir, ts, jsonFileName, data);
          return data;
        } catch {
          return null;
        }
      };

      // Fetch current and previous details in parallel
      const [currentDetail, prevDetail] = await Promise.all([
        fetchDetail(timestamp),
        fetchDetail(prevTimestamp),
      ]);

      if (!currentDetail) {
        throw new Error(t('fetch_failed') + ` (${jsonFileName})`);
      }

      // Process components and tag new classes
      const processedComps = (currentDetail.components || []).map((comp) => {
        // Find matching component in previous run
        const prevComp = prevDetail 
          ? (prevDetail.components || []).find((c) => c.name === comp.name)
          : null;

        const prevClassesSet = new Set();
        if (prevComp && Array.isArray(prevComp.classes)) {
          prevComp.classes.forEach((c) => {
            const name = c && typeof c === 'object' ? c.class_name : c;
            if (name) prevClassesSet.add(name);
          });
        }

        // Tag classes and sort (new ones first)
        const processedClasses = (comp.classes || []).map((cls) => {
          const isObj = cls && typeof cls === 'object';
          const classNameStr = isObj ? cls.class_name : cls;
          
          // It's new if it was not in prevClassesSet AND prevTimestamp exists
          const isNew = prevTimestamp ? !prevClassesSet.has(classNameStr) : false;

          if (isObj) {
            return { ...cls, isNew };
          }
          return { class_name: cls, isNew };
        });

        // Sort: new classes first (isNew === true comes first)
        processedClasses.sort((a, b) => {
          if (a.isNew && !b.isNew) return -1;
          if (!a.isNew && b.isNew) return 1;
          return 0;
        });

        return {
          ...comp,
          classes: processedClasses,
        };
      });

      setFileData({
        pkgName: currentDetail.package || '',
        fileName: currentDetail.file || fileName,
        comps: processedComps,
      });

    } catch (err) {
      setFileError(err.message);
    } finally {
      setFileLoading(false);
    }
  }, [selectedRun, t]);

  return { fileData, fileLoading, fileError, loadFileDetail };
}
