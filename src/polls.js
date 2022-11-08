// Modified, Documented by Jesus Macias 

// Import Statements for Polls Js
import { doc, getDocs, onSnapshot, updateDoc } from "firebase/firestore";
import { cid, logged_user } from "./auth";
import { accountsRef, db, displayModal, loadData, pollsRef } from "./database";
import Poll, { pollCreator } from "./poll";

var generatedPolls = 0;

// Map of Active Polls
const pollList = new Map();

// Get the Confirmation modal
var confirmVoteModal = document.getElementById("confirmVoteModal");

// Get the Form for Creating a Poll
const confirmVoteForm = document.getElementById('confirmVoteForm');


// Checks that the Create Poll Modal exists
if (confirmVoteModal != null) {
    // Modal Creation for Poll Creation
    var confirmVoteModal = new bootstrap.Modal(confirmVoteModal, {
        keyboard: false
    })
}



// Generate All Active Polls
generateActivePolls();


// Master Function to add Table Data based on Ref, Table Name, and Column Headers
function generateActivePolls() {
    let writes = 1;
    const q = loadData(pollsRef,'active', '==', true);
    onSnapshot(q, (querySnapshot) => {
        querySnapshot.docChanges().forEach(change => {
            console.log("One Write - Total is now " + writes);
            if (change.type === "added") {
                pollList.set(change.doc.id,{...change.doc.data(), id: change.doc.id})
                generatePollListing(change.doc.id, pollList.get(change.doc.id));
                console.log("New Poll: ", change.doc.data());
            }
            if (change.type === "modified") {
                pollList.set(change.doc.id,{...change.doc.data(), id: change.doc.id})
                generatePollListing(change.doc.id, pollList.get(change.doc.id));
                console.log("Modified Poll: ", change.doc.data());
            }
            if (change.type === "removed") {
                generatePollListing(change.doc.id, pollList.get(change.doc.id));
                pollList.delete(change.doc.id)
                console.log("Removed Poll: ", change.doc.data());
            }
            writes++;
        });
            console.log("New and Improved");
            console.log(pollList);
        })
  }

  function generatePollListing(id, pollItem) {
    let email;
    let hasVoted = false;
    if (logged_user)
        email = logged_user.email;
    else
        email = "null";
    const pollListing = document.getElementById('pollListing');
    pollItem.voters.forEach((voter => {
        if(Object.values(voter).includes(email))
        hasVoted = true;
    }))
    
    let currPoll = new Poll(email, id, pollItem);
    generatedPolls++;
    let selectBtns = currPoll.getElementsByTagName('button');
    pollItem.selections.forEach((selection, idx) => {
        if (pollItem.owner != email && !hasVoted) {
            selectBtns[idx].addEventListener("click", function () { confirmVote(id, selection); });
        }

    })
    
    if (document.getElementById(id) == null) 
        pollListing.append(currPoll);

    if(generatedPolls == 2) {
        generatedPolls = 0;
        let divider = document.createElement("div");
        let spacer = document.createElement("br");
        divider.className = "w-100";
        pollListing.append(divider, spacer);
    }
  }

  function confirmVote(id, selection){
    if(logged_user == null) {
        document.getElementById('confirmText').innerText = "You may sign in or register from the Nav Bar";
        document.getElementById('choosenSelection').innerText = "Sign In To Vote";
        document.getElementById('confirmHeader').innerText = "Warning";
        document.getElementById('confirmText2').innerText = "";
        document.getElementById('publishVoteBtn').style = "display:none";
    } else {
        document.getElementById('choosenSelection').innerText = selection.selectionName;
    }
    // Checks to see if the Create Poll Form exist, if so check for submission
    if (confirmVoteForm != null) {
        confirmVoteForm.addEventListener('submit',(event) => {
            event.preventDefault();
            confirmVoteForm.reset();
            addVoteToPoll(selection.selectionName, id);
            addVoteToAccount(selection.selectionName, id);
            console.log("Submitted");
            setTimeout(function(){
                location.reload();
            },400);
        });
    }
    displayModal(true, confirmVoteModal);
  }

  function addVoteToAccount(selectionName, pollID) {
    console.log(selectionName);
    var cid;
    let q = loadData(accountsRef, 'email', "==", logged_user.email);
    getDocs(q)
    .then((snapshot) =>{
        let users = [];
        snapshot.docs.forEach((documents) => {
            users.push({...documents.data(), id: documents.id});
            cid = documents.id;
        });

        if (users.length == 0) {
            return -1;
        }
        return users[0];
    })
    .then((user) => {
        const votedOn = user.votedOn;
        var current_vote = {
            "selectionName": selectionName,
            "pollID": pollID
        }
        votedOn.push(current_vote);

        updateDoc(doc(db, 'accountTesting', cid), {
            votedOn: votedOn
        })
    })
}


function addVoteToPoll(selectionName, pollID) {
    console.log(pollID);
    var pid;
    let q = loadData(pollsRef, '__name__', "==", pollID);
    
    getDocs(q)
    .then((snapshot) =>{
        let polls = [];
        snapshot.docs.forEach((documents) => {
            polls.push({...documents.data(), id: documents.id});
            pid = documents.id;
        });

        if (polls.length == 0) {
            return -1;
        }
        return polls[0];
    })
    .then((poll) => {
        const voters = poll.voters;
        const selections = poll.selections;
        const totalVotes = poll.totalVotes;
        var current_voter = {
            "selectionName": selectionName,
            "voterEmail": logged_user.email
        }
        selections.forEach(selection =>{
            if(selection.selectionName == selectionName) {
                selection.votes = selection.votes + 1;
            }
        })
        console.log(current_voter)
        voters.push(current_voter);

        updateDoc(doc(db, 'pollTesting', pid), {
            voters: voters,
            totalVotes: totalVotes + 1,
            selections: selections
        })
    })
}

