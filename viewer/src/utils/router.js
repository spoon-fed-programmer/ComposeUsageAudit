export const getIntervalName = (sourcePath) => {
  if (sourcePath.includes('summary_weekly')) return 'weekly';
  if (sourcePath.includes('summary_monthly')) return 'monthly';
  if (sourcePath.includes('summary_yearly')) return 'yearly';
  return 'daily';
};

export const parseHash = (hash) => {
  const path = hash.replace(/^#\/?/, '');
  if (!path) return null;

  const parts = path.split('/');
  const interval = parts[0] || 'daily';
  
  let sourcePath = 'reports/compose_common_component/summary_daily/index.json';
  if (interval === 'weekly') sourcePath = 'reports/compose_common_component/summary_weekly/index.json';
  else if (interval === 'monthly') sourcePath = 'reports/compose_common_component/summary_monthly/index.json';
  else if (interval === 'yearly') sourcePath = 'reports/compose_common_component/summary_yearly/index.json';

  const viewType = parts[1]; // "matrix" or "run"
  if (viewType === 'matrix') {
    return {
      sourcePath,
      viewAllHistory: true,
      selectedRunTimestamp: null,
      activeTab: 'overview',
      navigatedFile: null,
    };
  }

  if (viewType === 'run') {
    const timestamp = parts[2] || null;
    const tab = parts[3] || 'overview'; // "overview", "files", or "modules"
    const file = parts[4] ? decodeURIComponent(parts[4]) : null;
    return {
      sourcePath,
      viewAllHistory: false,
      selectedRunTimestamp: timestamp,
      activeTab: (tab === 'files' || tab === 'modules') ? tab : 'overview',
      navigatedFile: file,
    };
  }

  return null;
};

export const getHashFromState = (sourcePath, viewAllHistory, selectedRunTimestamp, activeTab, navigatedFile) => {
  let interval = getIntervalName(sourcePath);

  if (viewAllHistory) {
    return `#/${interval}/matrix`;
  }

  if (!selectedRunTimestamp) {
    return `#/${interval}/matrix`;
  }

  let hash = `#/${interval}/run/${selectedRunTimestamp}`;
  if (activeTab === 'files') {
    hash += '/files';
    if (navigatedFile) {
      hash += `/${encodeURIComponent(navigatedFile)}`;
    }
  } else if (activeTab === 'modules') {
    hash += '/modules';
  } else {
    hash += '/overview';
  }
  return hash;
};
