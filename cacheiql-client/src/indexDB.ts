//let dbInstance: IDBDatabase | null = null;

export const openDB = (
  dbName: string,
  storeName: string,
  version = 1
): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    //if (dbInstance) return resolve(dbInstance);
    const request = indexedDB.open(dbName, version);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(storeName)) {
        const store = db.createObjectStore(storeName);
        //store.createIndex('queryname', 'queryname', { unique: false });
      }
      // localStorage.setItem(dbName, storeName);
    };

    request.onsuccess = (event) => {
      resolve((event.target as IDBOpenDBRequest).result);
    };

    request.onerror = (event) => {
      reject((event.target as IDBOpenDBRequest).error);
    };
  });
};

// export const checkDB = (dbName: string) => {
//   if (localStorage.getItem(dbName)) {
//     //console.log('Database exists');
//     return true;
//   } else {
//     //console.log('Database does not exist');
//     return false;
//   }
// };

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
      // if (!localStorage.getItem(db.name)) {
      //   localStorage.setItem(db.name, storeName);
      // }
      resolve(); // Resolve the promise when the operation is successful
    };

    request.onerror = (event: Event) => {
      console.log(`there was an error adding data to ${storeName}`);
      reject((event.target as IDBRequest).error); // Reject the promise if there's an error
    };
  });
};

export const getItem = async (
  db: any,
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

export const deleteItem = async (
  db: any,
  storeName: string,
  key: string
): Promise<any> => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.delete(key);

    request.onsuccess = (event: Event) => {
      resolve((event.target as IDBRequest).result);
    };

    request.onerror = (event: Event) => {
      reject((event.target as IDBRequest).error);
    };
  });
};
