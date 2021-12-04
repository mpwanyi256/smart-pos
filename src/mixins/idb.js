// const INDEX_DB_NAME = 'smart_client_pos';
// const INDEXED_DB_VERSION = 1;
// const COLLECTION_NAME = 'smart_pos';

const INDEX_DB_NAME = 'smart_client_pos';
const INDEXED_DB_VERSION = 1;
const COLLECTION_NAME = 'smart_pos';

const idb = {

  db: null,

  async init() {
    this.db = await new Promise((resolve, reject) => {
      const request = window.indexedDB.open(INDEX_DB_NAME, INDEXED_DB_VERSION);

      request.onerror = (e) => {
        reject(new Error(`Error initializing indexed DB ${e}`));
      };

      request.onsuccess = (e) => {
        resolve(e.target.result);
      };

      // Incase the table structure changes
      // Increment the Db version number and re-run all createObjectStore(s)
      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        // Technically these are your tables (collections)
        // Add more tables here
        const objectStore = db.createObjectStore(COLLECTION_NAME, { autoIncrement: true, keyPath: 'data_key' });
        objectStore.createIndex('data_key', 'data_key', { unique: true });
      };
    });
  },

  collection(dataKeyPath, db = this.db) {
    return {
      add: (DATA) => new Promise((resolve, reject) => {
        if (!DATA || !dataKeyPath) reject(new Error('null data passed or invalid collection key'));
        const trans = db.transaction([COLLECTION_NAME], 'readwrite');

        const store = trans.objectStore(COLLECTION_NAME);

        // Encrypt data before Adding
        // const CYPHER = enc.encnrypt(DATA);
        // const PATH = enc.encnrypt(dataKeyPath);
        // console.log('Encrypted', CYPHER);
        const D = {
          ...DATA,
          data_key: dataKeyPath,
        };

        store.add(D);

        trans.oncomplete = () => {
          resolve(D);
        };

        trans.onerror = () => {
          reject(new Error('Sorry, data key already exists. Please run update instead'));
        };
      }),
      get: () => new Promise((resolve, reject) => {
        const trans = this.db.transaction([COLLECTION_NAME], 'readonly');
        const objectStore = trans.objectStore(COLLECTION_NAME);
        let document = null;
        const PATH = dataKeyPath; // enc.encnrypt(dataKeyPath);

        const index = objectStore.index('data_key');

        index.openCursor().onerror = (e) => {
          reject(new Error(e));
        };

        index.openCursor().onsuccess = (event) => {
          const cursor = event.target.result;
          if (cursor) {
            if (cursor.value.data_key.includes(PATH)) {
              document = cursor.value;
            }
            cursor.continue();
          }
        };

        trans.oncomplete = () => {
          if (document) {
            // const DECRYPT = enc.decrypt(document);
            resolve(document);
          } else {
            reject(new Error('Sorry, object not found'));
          }
        };
      }),
      docs: () => new Promise((resolve, reject) => {
        const trans = this.db.transaction([COLLECTION_NAME], 'readonly');

        const store = trans.objectStore(COLLECTION_NAME);
        const docs = [];

        store.openCursor().onsuccess = (e) => {
          const cursor = e.target.result;
          if (cursor) {
            // const DECRYPT = enc.decrypt(cursor.value);
            docs.push(cursor.value);
            cursor.continue();
          }
        };

        trans.onerror = (e) => {
          reject(new Error(e));
        };

        trans.oncomplete = () => {
          resolve(docs);
        };
      }),
      update: (DATA) => new Promise((resolve, reject) => {
        const transaction = db.transaction([COLLECTION_NAME], 'readwrite');
        const PATH = dataKeyPath; // enc.encnrypt(dataKeyPath);
        // Encrypt data before Updating
        const CYPHER = DATA; // enc.encnrypt(DATA);

        transaction.onerror = (e) => {
          reject(new Error(e));
        };
        const objectStore = transaction.objectStore(COLLECTION_NAME);

        objectStore.onerror = (e) => {
          reject(new Error(e));
        };

        objectStore.openCursor().onsuccess = (event) => {
          const cursor = event.target.result;
          if (cursor) {
            if (cursor.value.pk === PATH) {
              const request = cursor.update(CYPHER);
              request.onsuccess = () => {
                resolve(CYPHER);
              };

              request.onerror = (e) => {
                reject(new Error(e));
              };
            }
            cursor.continue();
          }
        };
      }),
      delete: () => new Promise((resolve, reject) => {
        if (!dataKeyPath) reject(new Error('please provide a collection key'));
        const transaction = this.db.transaction([COLLECTION_NAME], 'readwrite');
        const objectStore = transaction.objectStore(COLLECTION_NAME);
        const PATH = dataKeyPath; // enc.encnrypt(dataKeyPath);

        const objectStoreRequest = objectStore.delete(PATH);
        objectStoreRequest.onsuccess = () => {
          resolve('Sucess');
        };

        objectStoreRequest.onerror = (e) => {
          reject(new Error(e));
        };
      }),
    };
  },

  docs() {
    return new Promise((resolve, reject) => {
      const trans = this.db.transaction([COLLECTION_NAME], 'readonly');

      const store = trans.objectStore(COLLECTION_NAME);
      const docs = [];

      trans.oncomplete = () => {
        resolve(docs);
      };
      store.openCursor().onsuccess = (e) => {
        const results = e.target.result;
        if (results) {
          docs.push(results.value);
          results.continue();
        }
      };

      trans.onerror = (e) => {
        reject(new Error(e));
      };
    });
  },

  add(doc) {
    return new Promise((resolve, reject) => {
      const trans = this.db.transaction([COLLECTION_NAME], 'readwrite');
      trans.oncomplete = () => {
        resolve();
      };

      trans.onerror = (e) => {
        reject(new Error(e));
      };

      const store = trans.objectStore(COLLECTION_NAME);
      store.add(doc);
    });
  },

  get(key) {
    return new Promise((resolve, reject) => {
      const trans = this.db.transaction([COLLECTION_NAME], 'readonly');
      const objectStore = trans.objectStore(COLLECTION_NAME);

      const index = objectStore.index('data_key');

      index.openCursor().onerror = (e) => {
        reject(new Error(e));
      };

      index.openCursor().onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          if (cursor.value.data_key.includes(key)) {
            resolve(cursor.value);
          }
          cursor.continue();
        }
      };
    });
  },

  update(updatedDoc) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([COLLECTION_NAME], 'readwrite');

      transaction.onerror = (e) => {
        reject(new Error(e));
      };
      const objectStore = transaction.objectStore(COLLECTION_NAME);

      objectStore.onerror = (e) => {
        reject(new Error(e));
      };

      objectStore.openCursor().onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          if (cursor.value.data_key === updatedDoc.data_key) {
            const request = cursor.update({
              ...updatedDoc,
            });
            request.onsuccess = () => {
              resolve();
            };

            request.onerror = (e) => {
              reject(new Error(e));
            };
          }
          cursor.continue();
        }
      };
    });
  },

  delete(DataKey) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([COLLECTION_NAME], 'readwrite');
      const objectStore = transaction.objectStore(COLLECTION_NAME);

      const objectStoreRequest = objectStore.delete(DataKey);
      objectStoreRequest.onsuccess = () => {
        resolve();
      };

      objectStoreRequest.onerror = (e) => {
        reject(new Error(e));
      };
    });
  },

};

export default idb;
