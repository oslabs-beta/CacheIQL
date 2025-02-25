// Merges cached and newly fetched data
/**
 * Merges cached data with newly fetched data.
 * Ensures that cached fields are preserved and only missing fields are added.
 * 
 * @param cachedData - The cached GraphQL response.
 * @param newData - The newly fetched partial response.
 * @returns The final merged response.
 */
export function mergeCachedAndNewData(
  cachedData: Record<string, any>,
  newData: Record<string, any>
): Record<string, any> {
  if (!newData) return cachedData; // No new data, return cache

  const mergedData: Record<string, any> = { ...cachedData };

  Object.keys(newData).forEach((key) => {
    if (Array.isArray(newData[key]) && Array.isArray(cachedData[key])) {
      // If both are arrays, merge unique items
      mergedData[key] = [...new Set([...cachedData[key], ...newData[key]])];
    } else if (typeof newData[key] === "object" && typeof cachedData[key] === "object") {
      // If both are objects, merge deeply
      mergedData[key] = mergeCachedAndNewData(cachedData[key], newData[key]);
    } else {
      // Otherwise, prefer new data
      mergedData[key] = newData[key] ?? cachedData[key];
    }
  });

  return mergedData;
}
