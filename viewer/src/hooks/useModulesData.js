import { useState, useEffect } from 'react';
import { useI18n } from '../contexts/I18nContext';
import { transformModulesData } from '../utils/matrixHelper';
import { getCachedDetail, setCachedDetail } from '../utils/cache';

/**
 * Custom hook to load and aggregate component details grouped by module.
 * Leverages in-memory caching to avoid double fetching files.
 */
export function useModulesData(selectedRun) {
  const { t } = useI18n();
  const [modulesData, setModulesData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!selectedRun || !selectedRun.files || selectedRun.files.length === 0) {
      setModulesData(null);
      return;
    }

    let isMounted = true;
    const loadAllDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const promises = selectedRun.files.map(async (file) => {
          const fileBase = file.replace(/\.[^/.]+$/, "");
          const jsonFileName = `${fileBase}.json`;
          
          // Check memory cache first
          const cached = getCachedDetail(selectedRun.categoryDir, selectedRun.timestamp, jsonFileName);
          if (cached) {
            return cached;
          }

          // Fetch if not cached
          const url = `${selectedRun.categoryDir}/${selectedRun.timestamp}/${jsonFileName}?t=${Date.now()}`;
          const res = await fetch(url);
          if (!res.ok) {
            throw new Error(t('fetch_failed') + ` (${jsonFileName})`);
          }
          const data = await res.json();
          
          // Store in memory cache
          setCachedDetail(selectedRun.categoryDir, selectedRun.timestamp, jsonFileName, data);
          return data;
        });

        const details = await Promise.all(promises);
        
        if (isMounted) {
          const aggregated = transformModulesData(details);
          setModulesData(aggregated);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Failed to load modules data');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadAllDetails();

    return () => {
      isMounted = false;
    };
  }, [selectedRun, t]);

  return { modulesData, loading, error };
}
