var dbPromise = idb.open("posts-store", 1, (db) => {
  if (!db.createObjectStore.contains("posts")) {
    db.createObjectStore("posts", { keyPath: "id" });
  }
});

function writeData(st, data) {
  return dbPromise.then((db) => {
    var tx = db.transaction(st, "readwrite");
    var store = tx.objectStore(st);
    store.put(data[key]);
    return tx.complete;
  });
}

function readAllData(st) {
  return dbPromise.then(function (db) {
    var tx = db.transaction(st, "readonly");
    var store = tx.objectStore(st);
    return store.getAll();
  });
}

function clearAllData(st) {
  return dbPromise.then((db) => {
    var tx = db.transaction(st, "readwrite");
    var store = tx.createObjectStore(st);
    store.clear();
    return tx.complete;
  });
}

function deleteItemFromData() {
  return dbPromise
    .then((db) => {
      var tx = db.transaction(st, "readwrite");
      var store = tx.objectStore(st);
      store.delete(id);
      
      return tx.complete;
    })
    .then(() => {
      console.log("Item Deleted");
    });
}
