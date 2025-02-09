export const openDB = (
  dbName: string,
  storeName: string,
  version = 1
): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, version);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName);
      }
    };

    request.onsuccess = (event) => {
      resolve((event.target as IDBOpenDBRequest).result);
    };

    request.onerror = (event) => {
      reject((event.target as IDBOpenDBRequest).error);
    };
  });
};

export const addItem = (
  db: any,
  storeName: string,
  key: string,
  data: any
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.put(data, key);
    request.onsuccess = () => {
      resolve(); // Resolve the promise when the operation is successful
    };

    request.onerror = (event: Event) => {
      reject((event.target as IDBRequest).error); // Reject the promise if there's an error
    };
  });
};

export const getItem = async (
  db: any,
  dbName: string,
  storeName: string,
  key: string
): Promise<any> => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.get(key);

    request.onsuccess = (event: Event) => {
      resolve((event.target as IDBRequest).result);
    };

    request.onerror = (event: Event) => {
      reject((event.target as IDBRequest).error);
    };
  });
};
