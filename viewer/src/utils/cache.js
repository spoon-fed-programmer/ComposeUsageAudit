/**
 * cache.js - Centralized in-memory cache for fetch results to avoid redundant API hits.
 */

const runDetailsCache = {};

export const getCachedDetail = (categoryDir, timestamp, jsonFileName) => {
  const key = `${categoryDir}/${timestamp}/${jsonFileName}`;
  return runDetailsCache[key] || null;
};

export const setCachedDetail = (categoryDir, timestamp, jsonFileName, data) => {
  const key = `${categoryDir}/${timestamp}/${jsonFileName}`;
  runDetailsCache[key] = data;
};
