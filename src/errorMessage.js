import { displayModal } from "./database";

// Get the Confirmation Vote modal
let errorMessageModal = document.getElementById("errorMessageModal");
if (errorMessageModal != null) {
    // Modal Creation for Confirm Vote Modal
    errorMessageModal = new bootstrap.Modal(errorMessageModal, {
        keyboard: false
    })
}

export function signInMessage() {
    document.getElementById('errorHeader').innerHTML = "<b style ='color:red;'>Warning</b>"
    document.getElementById('errorText').innerText = "Using the buttons on the top of the page, you may register or sign in.";
    document.getElementById('errorTitle').innerText = "Sign In To Use System";
    document.getElementById('errorText2').innerText = "";
    displayModal(true, errorMessageModal)
}

export function noPollsToVoteMessage() {
    document.getElementById('errorHeader').innerHTML = "<b style ='color:red;'>Attention</b>"
    document.getElementById('errorText').innerText = "Looks like there is no Active Polls, or you may have just voted on all Avaliable Active Polls.";
    document.getElementById('errorTitle').innerText = "No Active Polls";
    document.getElementById('errorText2').innerText = "You can check back later!";
    displayModal(true, errorMessageModal)
}

export function noVotedOnPollsMessage() {
    document.getElementById('errorHeader').innerHTML = "<b style ='color:red;'>Attention</b>"
    document.getElementById('errorText').innerText = "Looks like you haven't voted on any Polls";
    document.getElementById('errorTitle').innerText = "No Voted On Polls";
    document.getElementById('errorText2').innerHTML = "<b>Click View Active Polls to see any active polls!<b>";
    displayModal(true, errorMessageModal)
}

export function noUserCreatedPollsMessage() {
    document.getElementById('errorHeader').innerHTML = "<b style ='color:red;'>Attention</b>"
    document.getElementById('errorText').innerText = "Looks like you haven't created any Polls";
    document.getElementById('errorTitle').innerText = "No Polls Created";
    document.getElementById('errorText2').innerHTML = "<b>Click Create Poll to start creation!<b>";
    displayModal(true, errorMessageModal)
}

export function noPollsFinishedMessage() {
    document.getElementById('errorHeader').innerHTML = "<b style ='color:red;'>Attention</b>"
    document.getElementById('errorText').innerText = "Looks like there isn't any polls that reached their deadline";
    document.getElementById('errorTitle').innerText = "No Finished Polls";
    document.getElementById('errorText2').innerHTML = "<b>Check back later!<b>";
    displayModal(true, errorMessageModal)
}

