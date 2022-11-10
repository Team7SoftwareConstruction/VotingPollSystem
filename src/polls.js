// Modified, Documented by Jesus Macias 

// Import Statements for Polls Js
import { doc, getDocs, onSnapshot, updateDoc } from "firebase/firestore";
import { logged_user } from "./auth";
import { accountsRef, db, displayModal, loadData, pollsRef } from "./database";
import Poll from "./poll";

// Keep track of Generated Polls
var generatedPolls = 0;

// Map of Active Polls
const pollList = new Map();

// Get the Confirmation Vote modal
var confirmVoteModal = document.getElementById("confirmVoteModal");

// Get the Form for Confirming a Vote
const confirmVoteForm = document.getElementById('confirmVoteForm');

// Checks that the Confirm Vote Poll Modal exists
if (confirmVoteModal != null) {
    // Modal Creation for Confirm Vote Modal
    var confirmVoteModal = new bootstrap.Modal(confirmVoteModal, {
        keyboard: false
    })
}

// Generate All Active Polls
generateActivePolls();


// This function is used to generate the polls based on Firebase Collection
function generateActivePolls() {
    // Keep track of the writes
    let writes = 1;
    
    // Used Database Function to load particular data such as ONLY Active Polls
    const q = loadData(pollsRef,'active', '==', true);

    // onSnapShot Listener to listen for changes to Documents in the Query
    onSnapshot(q, (querySnapshot) => {
        querySnapshot.docChanges().forEach(change => {
            // Let Console know of a Write
            //console.log("One Write - Total is now " + writes);

            // Three Categories to keep track of Added, Modified, and Deleted
            if (change.type === "added") {
                pollList.set(change.doc.id,{...change.doc.data(), id: change.doc.id})
                generatePollListing(change.doc.id, pollList.get(change.doc.id));
                //console.log("New Poll: ", change.doc.data());
            }

            if (change.type === "modified") {
                pollList.set(change.doc.id,{...change.doc.data(), id: change.doc.id})
                generatePollListing(change.doc.id, pollList.get(change.doc.id));
                //console.log("Modified Poll: ", change.doc.data());
            }

            if (change.type === "removed") {
                generatePollListing(change.doc.id, pollList.get(change.doc.id));
                pollList.delete(change.doc.id)
                //console.log("Removed Poll: ", change.doc.data());
            }

            // Increase the Total Writes by 1
            writes++;
        });

        // Log the Polls Map
        console.log(pollList);
        })
}
    
// This function is used to create a individual Poll Listing
function generatePollListing(id, pollItem) {
    let email = getCurrentUserEmail();
    let hasVoted = checkIfVoted(pollItem, email);

    // Get the Poll Listings Element from the Polls HTML Code
    const pollListing = document.getElementById('pollListing');

    // Set Current Poll to a new created Poll using Current User Email, Poll ID and Poll Information from Firebase
    let currPoll = new Poll(email, id, pollItem);

    // Increase the number of generated Polls.
    generatedPolls++;

    // Get the Voting Buttons of the Current Poll
    let selectBtns = currPoll.getElementsByTagName('button');

    // Go through all Selections of the Current Poll
    pollItem.selections.forEach((selection, idx) => {
        // If Current User isn't a Owner or Hasn't Voted add ability to Vote to Buttons.
        if (pollItem.owner != email && !hasVoted) {
            selectBtns[idx].addEventListener("click", function () { confirmVote(id, selection); });
        }

    })

    // If the Current Poll Element doesn't exist in the Polls HTML CODE add it to the Poll Listing Element
    if (document.getElementById(id) == null) 
        pollListing.append(currPoll);

    // If Generated Poll is 2 then Row limit has been met, create a divider to create new row and a spacer,
    if(generatedPolls == 2) {
        generatedPolls = 0;
        let divider = document.createElement("div");
        let spacer = document.createElement("br");
        divider.className = "w-100";
        pollListing.append(divider, spacer);
    }
}

// This function is used to check if the Current User has voted.
function checkIfVoted(pollItem, email) {
    let hasVoted = false;
    // Go through all the existing Voters
    pollItem.voters.forEach(voter => {
        // If the current Voter includes the Current User Email then hasVoted else continue to next voter.
        if(Object.values(voter).includes(email))
            hasVoted = true;  
   })

   // None of the voters matches the Current User Email so Current User hasn't voted
   return hasVoted;
 }

// This function is used to get the Current User Email 
function getCurrentUserEmail() {
    // If User is currently logged in, set email to Current User Email else Null
    if (logged_user)
        return logged_user.email;
    else
        return "null";
}

// This functions is used to confirm Vote of a Poll based on Poll ID and Selection chosen.
function confirmVote(id, selection){
    // Set Modal Text based on if Current User is signed in or not.
    if(logged_user == null) {
        document.getElementById('confirmText').innerText = "You may sign in or register from the Nav Bar";
        document.getElementById('choosenSelection').innerText = "Sign In To Vote";
        document.getElementById('confirmHeader').innerText = "Warning";
        document.getElementById('confirmText2').innerText = "";
        document.getElementById('publishVoteBtn').style = "display:none";
    } else {
        document.getElementById('choosenSelection').innerText = selection.selectionName;
    }
    const btn = document.getElementById('publishVoteBtn')
    btn.addEventListener("click", function () { addVoteToDatabase(id, selection); }, { once: true });
    displayModal(true, confirmVoteModal);
}

// This function is used to add the Vote to Account and Poll Documents in Firebase
async function addVoteToDatabase (id, selection) {
     //Add Vote to Poll Document
     await addVoteToPoll(selection.selectionName, id);

     // Add Vote to Account Document
     await addVoteToAccount(selection.selectionName, id);

     displayModal(false, confirmVoteModal);

     // Console Log Vote Confirmed
     console.log("Vote has been submitted");

}

// This function is change Account Document in Firebase in reference to the Vote that occured
function addVoteToAccount(selectionName, pollID) {
    return new Promise((resolve) => {
        
        // Console.log the Selection Name
        console.log(selectionName);

        // Variable for the Account Document ID
        var cid;

        // Use Database Function for particular query of documents equal to the Current User Email
        let q = loadData(accountsRef, 'email', "==", logged_user.email);
        getDocs(q)
        .then((snapshot) =>{
            // Get all Users in array
            let users = [];
            snapshot.docs.forEach((documents) => {
                users.push({...documents.data(), id: documents.id});
                cid = documents.id;
            });

            // If users is 0 then return -1 in error
            if (users.length == 0) {
                return -1;
            }

            // Return the one user which should be the Current User Document
            return users[0];
        })
        .then((user) => {
            // Get previous VoteOn array of Current User
            const votedOn = user.votedOn;

            // Make a new Vote based on Confirmed Vote
            var current_vote = {
                "selectionName": selectionName,
                "pollID": pollID
            }

            // Add confirmed vote to VoteOn Array
            votedOn.push(current_vote);
            
            // Update the Document in Firebase using the cid and newly updated VoteOn
            updateDoc(doc(db, 'accountTesting', cid), {
                votedOn: votedOn
            })
        })
        resolve();
    });
}


// This function is change Poll Document in Firebase in reference to the Vote that occured
function addVoteToPoll(selectionName, pollID) {
    console.log("ADDING VOTE TO POLL")
    return new Promise((resolve) => {
        // This isn't fully documented but follows the same flow but for Poll Documents as above function addVoteToAccount.
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
            var voters = poll.voters;
            var selections = poll.selections;
            var totalVotes = poll.totalVotes;
            var current_voter = {
                "selectionName": selectionName,
                "voterEmail": logged_user.email
            }
            selections.forEach(selection =>{
                if(selection.selectionName == selectionName) {
                    selection.votes = selection.votes + 1;
                }
            })
            voters.push(current_voter);

            updateDoc(doc(db, 'pollTesting', pid), {
                voters: voters,
                totalVotes: totalVotes + 1,
                selections: selections
            })
        })
        resolve();
    });
}

