let db;
const request = indexedDB.open('money_movers', 1);

//createing the transaction object
request.onupgradeneeded = function(event) {
    const db = event.target.result;
    db.createObjectStore('transaction', { autoIncrement: true });
};

request.onsuccess = function(event) {
    db = event.target.result;
  
    // check if app is online 
    if (navigator.onLine) {
      uploadTransaction();
    }
};    

//if there is an error 
request.onerror = function(event) {
    console.log(event.target.errorCode);
};


function saveRecord(record) {
    const transaction = db.transaction(['newTransaction'], 'readwrite');
  
    const transObjectStore = transaction.objectStore('newTransaction');
  
    // add record to db
    transObjectStore.add(record);
};

function uploadTransaction() {
    
    const transaction = db.transaction(['newTransaction'], 'readwrite');
  
    
    const tranObjectStore = transaction.objectStore('newTransaction');
  
    // get all records
    const getAll = tranObjectStore.getAll();
  
    getAll.onsuccess = function() {
      //check to see data and sends it up 
      if (getAll.result.length > 0) {
        fetch('/api/transaction', {
          method: 'POST',
          body: JSON.stringify(getAll.result),
          headers: {
            Accept: 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
          }
        })
          .then(response => response.json())
          .then(serverResponse => {
            if (serverResponse.message) {
              throw new Error(serverResponse);
            }
  
            const transaction = db.transaction(['newTransaction'], 'readwrite');
            const tranObjectStore = transaction.objectStore('newTransaction');
            // clear all items in your store
            tranObjectStore.clear();
          })
          .catch(err => {
            // catches any err and console logs 
            console.log(err);
          });
      }
    };
}

window.addEventListener('online', uploadTransaction);