import { createDBType } from './types';

//this file initializes the indexDB database
export function db() {
  let initialized = false;
  let db: any;
  let version: number = 4;
  let databaseName: string = 'cacheit';
  let objectStoreName: string = 'query';
  async function createDB({
    newDatabaseName,
    newVersion,
    newObjectStoreName,
  }: createDBType): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      if (initialized) {
        reject(new Error('Database has already been created'));
      }
      if (newObjectStoreName) {
        objectStoreName = newObjectStoreName;
      }
      if (newDatabaseName) {
        databaseName = newDatabaseName;
      }
      if (newVersion) {
        version = newVersion;
      }
      const DBopenRequest = window.indexedDB.open(databaseName, version);

      //if there is an error opening the database it consoles an error
      DBopenRequest.onerror = (event) => {
        console.error('Error loading database');
      };

      //if it succeeds it sets db equal to the result object
      DBopenRequest.onsuccess = (event) => {
        db = DBopenRequest.result;

        console.log(`database ${databaseName} initialized`);
        initialized = true;
        resolve(db);
      };

      DBopenRequest.onupgradeneeded = (event: any) => {
        db = event.target.result;
        if (!db.objectStoreNames.contains(objectStoreName)) {
          console.log(`creating object store: ${objectStoreName}`);
          db.createObjectStore(objectStoreName, { autoIncrement: true });
        } else {
          console.log(`object store ${objectStoreName} already exists`);
        }

        db.onerror = (event: any) => {
          console.error('error during database upgrade:', event.target.error);
          reject(event.target.error);
        };
      };
    });
  }

  function addItem(passedData: string | object) {
    if (!initialized || !db) {
      return 'database is uninitialized run createDB()';
    }
    const transaction = db.transaction(objectStoreName, 'readwrite');
    const store = transaction.objectStore(objectStoreName);
    const request = store.add({ data: passedData });

    request.oncomplete = () => {
      console.log('data was succesfully added to the object store');
    };

    request.onerror = (event: Event) => {
      console.error('Error adding data:', (event.target as IDBRequest).error);
    };
  }

  function deleteDatabase() {
    if (initialized) indexedDB.deleteDatabase(databaseName);
    else return 'there is no database to delete';
  }

  return { createDB, addItem, deleteDatabase };
}

//this is how the database is opened, it gives it the name cacheIt and sets the version to 4
