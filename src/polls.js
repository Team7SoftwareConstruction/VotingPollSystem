/* Modified, Documented by Jesus Macias */

import { displayModal } from "./database";

// Get the modal
export var createPollModal = document.getElementById("createPollModal");

// Get the button that opens the modal
export var createPollBtn = document.getElementById("createPollBtn");

// Checks that the Login and Register Modals exist
if (createPollModal != null) {
    // Modal Creation for Booking System
    var createPollModal = new bootstrap.Modal(createPollModal, {
        keyboard: false
    })

    // When the user clicks on the button, open the Register modal
    createPollBtn.onclick = function() {
        displayModal(true, createPollModal);
    }
}

