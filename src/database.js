console.log("Page is running Database Js v1.0");

import {
    getFirestore, collection, query, onSnapshot, where,
} from 'firebase/firestore';


// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";


// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyBiuqM_mRfq1gAHd-TSlgKCTnRRbcC0zE4",
    authDomain: "votingpoll-b30e4.firebaseapp.com",
    projectId: "votingpoll-b30e4",
    storageBucket: "votingpoll-b30e4.appspot.com",
    messagingSenderId: "337510569002",
    appId: "1:337510569002:web:3eb136c2f95c39adb85f53",
    measurementId: "G-3TM9YFTDML"
  };
  
  // Initialize Firebase
  const app = initializeApp(firebaseConfig);

  // Get Database
  const db = getFirestore();

  // References to collections
  const pollsRef = collection(db, "pollTesting");
  const accountsRef = collection(db, "accountTesting")

  // Export References to use outside of this JavaScript File
  export { pollsRef, accountsRef, app, db}

  // Master Function to add Table Data based on Ref, Table Name, and Column Headers
  export function createCollectionArray(collectionRef, tableName, colNames) {
    const q = query(collectionRef);
    const unsub = onSnapshot(q, (querySnapshot) => {
        const collectionArray = [];
        querySnapshot.docChanges().forEach(change => {
            if (change.type === "added") {
                console.log("New Poll: ", change.doc.data());
            }
            if (change.type === "modified") {
                console.log("Modified city: ", change.doc.data());
            }
            if (change.type === "removed") {
                console.log("Removed city: ", change.doc.data());
            }
            let i = 0;
            collectionArray.push({...change.doc.data(), id: change.doc.id});
            let table = document.getElementById(tableName);
            let row = table.insertRow(-1);

            colNames.forEach((item, index) => {
                let cell, text;
                if (change.doc.data()[item] == undefined) {
                    cell = row.insertCell(index);
                    text = document.createTextNode("UNDEFINED");
                    cell.appendChild(text);
                } else {
                    cell = row.insertCell(index);
                    if (item == 'votedOn')
                        text = document.createTextNode(JSON.stringify(change.doc.data()['votedOn']));
                    else 
                        text = document.createTextNode(change.doc.data()[item]);
                    cell.appendChild(text);
                }   
            });
            i++;
            console.log(collectionArray);
        });
    })
  }
  
  // Master Function to displays the correct Modal based on value and Modal Ref
  export function displayModal(val, modalIn) {
    if (val == true) {
        modalIn.show()
    } else {
        modalIn.hide()
    }
  }

  /*  Written and Modified By Jesus
    This function is used to return a query collection of specified Collection Name for example "collectionArrs_v2".
    A query is done using the specified db and collection name using,
    where("Destination", "==", "ORD") => where(whereVal, whereCompare, whereCompareVal)
    
    To explain the process, this documentation was written,
    whereVal -> The Value in which you want to see if every document in the collection has for example:
    whereVal = "Destination", this is saying you want the particular Destination of each Document.
    whereCompare -> The value in which you want to get the comparison for example:
    whereCompare = "==", this is saying you want the particular whereVal to == something, 
    
    whereCompareVal -> The value that specifies what the whereVal will be compared to using whereCompare Value
    whereCompareVal = "ORD", this is saying you want all documents of the particular whereVal to whereCompare to ORD.
    Example using the values below, going through the specified collection the only documents getting a snapshot are
    the ones where the field of Destination is equal to ORD
*/
export function loadData(collectionRef, whereVal, whereCompare, whereCompareVal) {
    return query(collectionRef, where(whereVal, whereCompare, whereCompareVal));
}
  

