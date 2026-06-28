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

export const transformModulesData = (detailFilesData) => {
  const modulesMap = {};

  detailFilesData.forEach((fileDetail) => {
    const definingFile = fileDetail.file;
    const pkg = fileDetail.package;

    if (fileDetail.components) {
      fileDetail.components.forEach((comp) => {
        if (comp.classes) {
          comp.classes.forEach((ref) => {
            const mod = ref.module_name || '';
            
            if (!modulesMap[mod]) {
              modulesMap[mod] = {};
            }
            
            const compKey = `${definingFile}::${comp.name}`;
            if (!modulesMap[mod][compKey]) {
              modulesMap[mod][compKey] = {
                name: comp.name,
                defining_file: definingFile,
                package: pkg,
                total_count: 0,
                classes: []
              };
            }
            
            modulesMap[mod][compKey].total_count += ref.count;
            modulesMap[mod][compKey].classes.push({
              class_name: ref.class_name,
              source_set: ref.source_set,
              count: ref.count,
              lines: ref.lines
            });
          });
        }
      });
    }
  });

  const result = {};
  Object.keys(modulesMap).forEach((mod) => {
    const compsList = Object.values(modulesMap[mod]).sort((a, b) => {
      if (b.total_count !== a.total_count) return b.total_count - a.total_count;
      return a.name.localeCompare(b.name);
    });

    compsList.forEach((c) => {
      c.classes.sort((a, b) => a.class_name.localeCompare(b.class_name));
    });

    result[mod] = compsList;
  });

  return result;
};
