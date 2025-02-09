//this file initializes the indexDB database
export const db = {
  createDB: async function (): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      //indexedDB.deleteDatabase('cacheIt');
      const DBopenRequest = window.indexedDB.open('cacheIt', 4);

      //if there is an error opening the database it consoles an error
      DBopenRequest.onerror = (event) => {
        console.error('Error loading database');
      };

      //if it succeeds it sets db equal to the result object
      DBopenRequest.onsuccess = (event) => {
        const db = DBopenRequest.result;

        console.log('database initialized');
        resolve(db);
      };

      DBopenRequest.onupgradeneeded = (event: any) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('query')) {
          console.log('creating object store: query');
          db.createObjectStore('query', { autoIncrement: true });
        } else {
          console.log('object store already exists');
        }

        db.onerror = (event: any) => {
          console.error('error during database upgrade:', event.target.error);
          reject(event.target.error);
        };
      };
    });
  },
};

//this is how the database is opened, it gives it the name cacheIt and sets the version to 4
