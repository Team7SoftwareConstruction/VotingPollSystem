// Checks that the Confirm Vote Poll Modal exists
// Import Statements for Polls Js
import { doc, getDocs, runTransaction, Transaction, updateDoc } from "firebase/firestore";
import { logged_user } from "./auth";
import { accountsRef, checkVotingPollFinished, db, displayModal, loadData, pollsRef } from "./database";


// Get the Confirmation Vote modal
export let confirmVoteModal = document.getElementById("confirmVoteModal");


if (confirmVoteModal != null) {
    // Modal Creation for Confirm Vote Modal
    confirmVoteModal = new bootstrap.Modal(confirmVoteModal, {
        keyboard: false
    })
}


// This functions is used to confirm Vote of a Poll based on Poll ID and Selection chosen.
export function confirmVote(id, selection, idx){
    console.log(idx);
    // Set Modal Text based on if Current User is signed in or not.
    if(logged_user == null) {
        signInToVoteMessage();
    } else {
        document.getElementById('choosenSelection').innerText = selection.selectionName;
    }
    const btn = document.getElementById('publishVoteBtn')
    btn.addEventListener("click", function () { addVoteToDatabase(id, idx); }, { once: true });
    displayModal(true, confirmVoteModal);
}

// This function is used to add the Vote to Account and Poll Documents in Firebase
export async function addVoteToDatabase (id, selectionIdx) {
    let isOver = checkVotingPollFinished(id);
    if (isOver) {
        console.log("Could not submit Vote since poll was finished");
        return;
    }
     //Add Vote to Poll Document
     addVoteToPoll(selectionIdx, id);

     // Add Vote to Account Document
     addVoteToAccount(selectionIdx, id);

     displayModal(false, confirmVoteModal);

     // Console Log Vote Confirmed
     console.log("Vote has been submitted");

}

// This function is change Account Document in Firebase in reference to the Vote that occured
export function addVoteToAccount(selectionIdx, pollID) {
    // Variable for the Account Document ID
    let cid;

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

        updateFirebaseUserVoteDoc(cid, selectionIdx, pollID);
    })
}

async function updateFirebaseUserVoteDoc(cid, selectionIdx, pollID) {
    try {
        const accountRef = doc(db, 'accountTesting', cid);
        await runTransaction(db, async (transaction) => {
            const accountDoc = await transaction.get(accountRef);
            if (!accountDoc.exists()) {
                throw "Document does not exist!";
            }

            // Get previous VoteOn array of Current User
            const votedOn = accountDoc.data().votedOn;

            // Make a new Vote based on Confirmed Vote
            let current_vote = {
                "selectionIdx": selectionIdx,
                "pollID": pollID
            }

            // Add confirmed vote to VoteOn Array
            votedOn.push(current_vote);

            transaction.update(accountRef, {
                votedOn: votedOn
            });
        })
        console.log("Vote Transaction successfully committed!");
    } catch (e) {
    console.log("Vote Transaction failed: ", e);
  }
}
       


// This function is change Poll Document in Firebase in reference to the Vote that occured
export function addVoteToPoll(selectionIdx, pollID) {
    let pid;
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
        updateFirebasePollVoteDoc(pid, selectionIdx);
    })
}

async function updateFirebasePollVoteDoc(pid, selectionIdx) {
    let voters;
    let selections;
    let totalVotes;
    let current_voter;
    try {
        const pollRef = doc(db, 'pollTesting', pid);
        await runTransaction(db, async (transaction) => {
            const pollDoc = await transaction.get(pollRef);
            if (!pollDoc.exists()) {
                throw "Document does not exist!";
            }

            voters = pollDoc.data().voters;
            selections = pollDoc.data().selections;
            totalVotes = pollDoc.data().totalVotes;
            current_voter = {
                "selectionIdx": selectionIdx,
                "voterEmail": logged_user.email
            }
            selections.forEach((selection, idx) =>{
                if(idx == selectionIdx) {
                    selection.votes = selection.votes + 1;
                }
            })
            voters.push(current_voter);
            transaction.update(pollRef, {
                voters: voters,
                totalVotes: totalVotes + 1,
                selections: selections   
            });
        })
        console.log("Vote Transaction successfully committed!");
    } catch (e) {
        console.log("Vote Transaction failed: ", e);
    }
}