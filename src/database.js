console.log("Page is running Database Js v1.0");

import {
    getFirestore, collection, query, getDocs
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
  export { pollsRef, accountsRef}

  // Master Function to add Table Data based on Ref, Table Name, and Column Headers
  export function addTableData(collectionRef, tableName, colNames) {
    const q = query(collectionRef);
    getDocs(q)
    .then((snapshot)=>{
        let arrData = [];
        let i = 0;
        snapshot.docs.forEach((documents)=> {
        arrData.push({...documents.data(), id: documents.id});
        let table = document.getElementById(tableName);
        let row = table.insertRow(-1);

        colNames.forEach((item, index) => {
                let cell, text;
                if (documents.data()[item] == undefined) {
                    cell = row.insertCell(index);
                    text = document.createTextNode("UNDEFINED");
                    cell.appendChild(text);
                } else {
                    cell = row.insertCell(index);
                    text = document.createTextNode(documents.data()[item]);
                    cell.appendChild(text);
                }   
            });

        i++;
        });
        console.log(arrData);
    })
    .catch(err =>{
        console.error(err);
    });
  }
  
  // Master Function to displays the correct Modal based on value and Modal Ref
  export function displayModal(val, modalIn) {
    if (val == true) {
        modalIn.show()
    } else {
        modalIn.hide()
    }
  }
  

