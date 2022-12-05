console.log("Page is running Database Js v1.0");

import {
    getFirestore, collection, query, onSnapshot, where, doc, getDocs, runTransaction,
} from 'firebase/firestore';


// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { updateUserDoc } from './auth';


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
  const accountsRef = collection(db, "accountTesting");

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

//This function is used to return a query collection of specified Collection Name.
export function loadData(collectionRef, whereVal, whereCompare, whereCompareVal) {
    return query(collectionRef, where(whereVal, whereCompare, whereCompareVal));
}

export function getCurrTimeFrame() {
    let date = new Date();
    let time;
    let dd = String(date.getDate()).padStart(2, '0');
    let mm = String(date.getMonth() + 1).padStart(2, '0'); 
    let yyyy = date.getFullYear();
    let nn = String(date.getMinutes()).padStart(2, '0');
    let hh = String(date.getHours()).padStart(2, '0');
    time = hh + ':' + nn;
    date = yyyy + '-' + mm + '-' + dd;
    return { date, time };
}

export function checkVotingPollFinished(pollID) {
    let q = loadData(pollsRef, '__name__', "==", pollID);

        getDocs(q)
        .then((snapshot) =>{
            let polls = [];
            snapshot.docs.forEach((documents) => {
                polls.push({...documents.data(), id: documents.id});
            });

            if (polls.length == 0) {
                return -1;
            }
            return polls[0];
        })
        .then((poll) => {
            return checkIsOver(poll.endDate, poll.endTime)
        });
}

export function checkPollDoc(startDateIn, startTimeIn, endDateIn, endTimeIn, pollID) {
    let isActive;
    let isOver;
    return new Promise((resolve) => {
        let q = loadData(pollsRef, '__name__', "==", pollID);

        getDocs(q)
        .then((snapshot) =>{
            let polls = [];
            snapshot.docs.forEach((documents) => {
                polls.push({...documents.data(), id: documents.id});
            });

            if (polls.length == 0) {
                return -1;
            }
            return polls[0];
        })
        .then((poll) => {
            let pollIsOver = poll.showResults;
            let pollActive = poll.active;
            let pollSelections = poll.selections;
            let pollOwner = poll.owner;
            let pollWinner = [];
    
            if (startDateIn | startTimeIn | endDateIn | endTimeIn | pollID) 
                return console.log("Error: Checking Results -> Values contained Null");
                
            if (pollIsOver) {
                resolve();
                return;
            }
            
            isOver = checkIsOver(endDateIn, endTimeIn);
                
            isActive = checkIsActive(startDateIn, startTimeIn);

            if (isActive == pollActive && isOver == pollIsOver) {
                resolve();
                return;
            }
            if (isOver) {
                pollWinner = getWinner(pollSelections)
                updatePollDoc(pollID, 'showResults', pollWinner, pollOwner);
            }else if (isActive)
                updatePollDoc(pollID, 'active', [-1], pollOwner);    
        })
        .then((e) => {
            resolve();
        })
    });
}

function getWinner(pollSelections) {
    let currWinnerVotes = -1;
    let totalWinners = [];

    if (pollSelections == null)
        return -1;

    pollSelections.forEach((selection, idx) => {
        if(selection.votes > currWinnerVotes) 
            currWinnerVotes = selection.votes
    })
    totalWinners = checkForTie(pollSelections, currWinnerVotes);

    return totalWinners;
}

function checkForTie(pollSelections, currWinnerVotes){
    let totalWinners = []

    if (pollSelections == null)
        return -1;

    pollSelections.forEach((selection, idx) => {
        if(selection.votes == currWinnerVotes) 
            totalWinners.push(idx);
    })
    return totalWinners;
}

async function updatePollDoc(pollID, field, winner, pollOwner) {
    console.log("Performing Update On Document " + pollID)
    let showResultsOut;
    let activeOut;
    try {
        const pollRef = doc(db, 'pollTesting', pollID);
        await runTransaction(db, async (transaction) => {
            const pollDoc = await transaction.get(pollRef);
            if (!pollDoc.exists()) {
                throw "Document does not exist!";
            }

            switch (field) {
                case 'showResults':
                    showResultsOut = Boolean(true),
                    activeOut = Boolean(false)
                    break;
                case 'active':
                    showResultsOut = Boolean(false),
                    activeOut = Boolean(true)
                    break;
            }

            updateUserDoc(activeOut, 'modified', pollOwner);

            transaction.update(pollRef, {
                showResults: showResultsOut,
                active: activeOut,
                winner: winner
            });
        });
        console.log("Poll Winner Transaction successfully committed!");
    } catch (e) {
        console.log("Poll Winner Transaction failed: ", e);
    }
}


function checkIsOver(endDateIn, endTimeIn) {
    // Safety Check if values are null
    if (endDateIn | endTimeIn == null)
        return console.log("Error: Checking If Over -> Values contained Null");

    // Get Current Time Frame
    let currTimeFrame = getCurrTimeFrame();

    // If the End Date is the same as Current Date
    if (endDateIn == currTimeFrame.date) {
        // If the End Time has past from Current Time then Show Results else Don't showResults
        if (endTimeIn <= currTimeFrame.time) 
            return true
        else
            return false
    } 
    
    // Else If the End Date is past from Current Date then Show Results
    else if (endDateIn <= currTimeFrame.date)
        return true

    // Otherwise Don't Show Results
    return false;
}

export function checkIsActive(startDateIn, startTimeIn) {
    // Get Current Time Frame
    let currTimeFrame = getCurrTimeFrame();

    // If the Start Date is the same as Current Date
    if (startDateIn == currTimeFrame.date) {
        // If the Start Time is further away from Current Time then Isn't Active else Is Active
        if(startTimeIn > currTimeFrame.time)
            return false;
        else
            return true;
    }

    // Else If the Start Date is further away from the Current Date then Isn't Active
    else if (startDateIn > currTimeFrame.date) 
        return false;

    // Otherwise Is Active
    return true;   
}

