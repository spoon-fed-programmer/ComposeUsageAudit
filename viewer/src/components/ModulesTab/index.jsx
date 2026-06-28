import { useState, useEffect } from 'react';
import { useModulesData } from '../../hooks/useModulesData';
import ModuleMenuList from './ModuleMenuList';
import ModuleDetailPanel from './ModuleDetailPanel';
import { useI18n } from '../../contexts/I18nContext';

export default function ModulesTab({ selectedRun, prevTimestamp }) {
  const { t } = useI18n();
  const { modulesData, loading, error } = useModulesData(selectedRun, prevTimestamp);
  const [selectedModule, setSelectedModule] = useState(null);

  // Extract list of modules from data keys, only including those with >= 1 reference count components
  const modulesList = modulesData ? Object.keys(modulesData).filter((mod) => {
    const comps = modulesData[mod] || [];
    return comps.some((c) => c.total_count >= 1);
  }).sort((a, b) => {
    if (a === '') return -1;
    if (b === '') return 1;
    return (a || '').localeCompare(b || '');
  }) : [];

  // Default select first module when data is loaded
  useEffect(() => {
    if (modulesList.length > 0 && selectedModule === null) {
      // Find default selected module, prioritize 'app' or fallback to first
      const defaultMod = modulesList.includes('app') ? 'app' : modulesList[0];
      setSelectedModule(defaultMod);
    }
  }, [modulesList, selectedModule]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="spinner" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-panel border border-border rounded-lg p-10 flex flex-col items-center justify-center text-danger font-semibold gap-2 font-sans">
        <span>⚠️ {t('load_file_error')}</span>
        <span className="text-xs text-text-secondary font-normal">{error}</span>
      </div>
    );
  }

  if (!modulesData || modulesList.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-text-muted font-sans bg-panel border border-border rounded-lg">
        {t('no_module_details')}
      </div>
    );
  }

  const selectedData = selectedModule !== null
    ? (modulesData[selectedModule] || []).filter((c) => c.total_count >= 1)
    : [];

  return (
    <div className="grid gap-7" style={{ gridTemplateColumns: '240px 1fr', alignItems: 'flex-start' }}>
      <ModuleMenuList
        modules={modulesList}
        selectedModule={selectedModule}
        onSelect={setSelectedModule}
        modulesData={modulesData}
      />
      <ModuleDetailPanel
        selectedModule={selectedModule}
        componentsData={selectedData}
      />
    </div>
  );
}
