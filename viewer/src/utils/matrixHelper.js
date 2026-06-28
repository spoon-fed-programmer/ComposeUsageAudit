/**
 * matrixHelper.js - Data manipulation helpers for AllHistoryMatrix
 */

export const getUniqueComponents = (matrixData) => {
  const compMap = {};
  matrixData.forEach((run) => {
    if (run.components) {
      run.components.forEach((c) => {
        const key = `${c.file}::${c.name}`;
        if (!compMap[key]) {
          compMap[key] = { file: c.file, name: c.name };
        }
      });
    }
  });

  return Object.values(compMap).sort((a, b) => {
    if (a.file !== b.file) return a.file.localeCompare(b.file);
    return a.name.localeCompare(b.name);
  });
};

export const getUniqueFiles = (uniqueComponents) => {
  const files = uniqueComponents.map((c) => c.file);
  return [...new Set(files)].sort();
};

export const getComponentsByFile = (uniqueComponents) => {
  const groups = {};
  uniqueComponents.forEach((c) => {
    if (!groups[c.file]) {
      groups[c.file] = [];
    }
    groups[c.file].push(c);
  });
  return groups;
};

export const getUniqueModules = (reportRuns) => {
  const modulesSet = new Set();
  reportRuns.forEach((run) => {
    if (run.modules) {
      Object.keys(run.modules).forEach((mod) => {
        modulesSet.add(mod);
      });
    }
  });
  return [...modulesSet].sort((a, b) => {
    if (a === '') return -1;
    if (b === '') return 1;
    return a.localeCompare(b);
  });
};
