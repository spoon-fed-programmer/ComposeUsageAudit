import { useState, useEffect } from 'react';
import { useI18n } from '../contexts/I18nContext';
import { transformModulesData } from '../utils/matrixHelper';
import { getCachedDetail, setCachedDetail } from '../utils/cache';

/**
 * Custom hook to load and aggregate component details grouped by module.
 * Leverages in-memory caching to avoid double fetching files.
 */
export function useModulesData(selectedRun, prevTimestamp) {
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
        // Helper to load files details for a specific run timestamp
        const loadRunDetails = async (ts, files) => {
          if (!ts || !files) return [];
          const promises = files.map(async (file) => {
            const fileBase = file.replace(/\.[^/.]+$/, "");
            const jsonFileName = `${fileBase}.json`;
            
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
          });
          const results = await Promise.all(promises);
          return results.filter(Boolean);
        };

        // Load current and previous details in parallel
        const [currentDetails, prevDetails] = await Promise.all([
          loadRunDetails(selectedRun.timestamp, selectedRun.files),
          prevTimestamp ? loadRunDetails(prevTimestamp, selectedRun.files) : Promise.resolve([]),
        ]);

        if (isMounted) {
          const currentAggregated = transformModulesData(currentDetails);
          const prevAggregated = prevTimestamp ? transformModulesData(prevDetails) : {};

          // Compare current aggregated modules with prev aggregated modules to tag isNew
          const processedAggregated = {};
          
          Object.keys(currentAggregated).forEach((moduleName) => {
            const currentComps = currentAggregated[moduleName] || [];
            const prevComps = prevAggregated[moduleName] || [];

            processedAggregated[moduleName] = currentComps.map((comp) => {
              const prevComp = prevComps.find((c) => c.name === comp.name);
              const prevClassesSet = new Set();
              
              if (prevComp && Array.isArray(prevComp.classes)) {
                prevComp.classes.forEach((c) => {
                  if (c && c.class_name) prevClassesSet.add(c.class_name);
                });
              }

              const processedClasses = (comp.classes || []).map((cls) => {
                const isNew = prevTimestamp ? !prevClassesSet.has(cls.class_name) : false;
                return {
                  ...cls,
                  isNew,
                };
              });

              // Sort: new classes first
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
          });

          setModulesData(processedAggregated);
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
  }, [selectedRun, prevTimestamp, t]);

  return { modulesData, loading, error };
}
