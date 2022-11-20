import { onAuthStateChanged } from "firebase/auth";
import { addDoc } from "firebase/firestore";
import { auth, logged_user, redirectHome, updateUserDoc } from "./auth";
import { checkIsActive, checkPollDoc, displayModal, pollsRef } from "./database";
import PollContainer from "./pollContainer";

// Get the Poll Creation modal
export var createPollModal = document.getElementById("createPollModal");

// Get the button that opens the Poll Creation modal
export var createPollBtn = document.getElementById("createPollBtn");

// Get the Form for Creating a Poll
const createPollForm = document.getElementById('createPollForm');

// MAX Selections
const limit = 5;

// Next Added Selection Val
var i = 2;

let checkID;

// Elements for Form of Poll Creation
const startDate = document.getElementById('startDate');
const endDate = document.getElementById('endDate');
const startTime = document.getElementById('startTime');
const endTime = document.getElementById('endTime');
var pollContainer


onAuthStateChanged(auth,(user)=>{
    /* USER IS LOGGED IN */
    if (user) {
      /* Logged_user becomes who is currently signed in */
      // Import Statements for Polls Js
      pollContainer = new PollContainer("myPollsPage", user.email);
      pollContainer.generatePolls();

    /* USER ISN'T LOGGED IN */
    } else {
        redirectHome();
      /* If Logged User isn't Null Display Logoff Message */

    }
  })

checkID = setInterval(checkPollUpdates, 10000);

function checkPollUpdates() {
    console.log("Checking For Updates");
    pollContainer.pollList.forEach((value, key) => {
      // Check if any of the polls need to be changed to Over
      checkPollDoc(value['startDate'], value['startTime'], value['endDate'], value['endTime'], key);
    });
  }
  

// Set the Default Mins to Current Day
defaultMin();

if (startDate != null) {
    // When the user changes the Start Date
    startDate.onchange = function() {
        if(startDate.value == "")
            defaultMin();
        else {
            setAtt('min', endDate, startDate.value)
            changedFrameVals();
        }
    }
}

if (endDate != null) {
    // When the user changes the Start Date
    endDate.onchange = function() {
        setAtt('max', startDate, endDate.value)
        changedFrameVals();
    }
}

if (startTime != null) {
    // When the user changes the Start Date
    startTime.onchange = function() {
        changedFrameVals();
    }
}

if (endTime != null) {
    // When the user changes the Start Date
    endTime.onchange = function() {
        changedFrameVals();    
    }
}

function changedFrameVals() {
    if(startDate.value == endDate.value) {
        console.log(startTime.value);
        let arr;
        let hour;
        let minTime;
        arr = startTime.value.split(":");
        hour = Number(arr[0]) + 1;
        console.log(arr[0][0])
        minTime = hour + ":" + arr[1];
        console.log(minTime);
        setAtt('min', endTime, minTime)
    } else {
        setAtt('min', endTime, '00:00')
    }
    
}

function setAtt(att, timeFrame, attVal) {
    timeFrame.setAttribute(att, attVal)
}


function defaultMin() {
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); 
    var yyyy = today.getFullYear();
    today = yyyy + '-' + mm + '-' + dd;
    document.getElementById('startDate').setAttribute('min', today);
    document.getElementById('endDate').setAttribute('min', today);
}


function createPollDoc(data) {
    return new Promise((resolve) => {
        let activeIn = false;

        let selectionsList = [];
        for (const [key, value] of Object.entries(data)) {
            if(key.substring(0,3) == "sel") {
                var currentSelection = {
                    'selectionName':value,
                    'votes': 0
                }
                selectionsList.push(currentSelection);
            }  
        }

        activeIn = checkIsActive(createPollForm.startDate.value, createPollForm.startTime.value);
        let isPublic = createPollForm.viewStatus.value == "true";
        let showPercent = createPollForm.viewPercent.value == "true";

        addDoc(pollsRef, {
            pollName: createPollForm.pollName.value,
            endDate: createPollForm.endDate.value,
            endTime: createPollForm.endTime.value,
            startTime: createPollForm.startTime.value,
            startDate: createPollForm.startDate.value,
            owner: logged_user.email,
            public: isPublic,
            viewPercent: showPercent,
            totalVotes: 0,
            selections: selectionsList,
            voters: [],
            winner: [-1],
            active: activeIn,
            showResults: false
        })

        updateUserDoc(activeIn, 'added', logged_user.email);
        resolve();
    });
}

// Checks to see if the Create Poll Form exist, if so check for submission
if (createPollForm != null) {
    createPollForm.addEventListener('submit',(event) => {
        event.preventDefault();
        const data = Object.fromEntries(new FormData(createPollForm).entries());
        executeCreatePoll(data)
        .then((e) => {
            displayModal(false, createPollModal);
            setTimeout(() => {
                createPollForm.reset()
              }, 500)
            
        })
    });
}

async function executeCreatePoll(data) {
    await createPollDoc(data);
    
}

// Checks that the Create Poll Modal exists
if (createPollModal != null) {
    // Modal Creation for Poll Creation
    var createPollModal = new bootstrap.Modal(createPollModal, {
        keyboard: false
    })

    // When the user clicks on the button, open the Create Poll modal
    createPollBtn.onclick = function() {
        displayModal(true, createPollModal);
    }
}

// Reference Code to use JQuery to add Selections and Remove
$("#rowAdder").click(function () {
    if(i < limit) {
        let newRowAdd = '<div id="row"> <div class="input-group m-3">' +
        '<div class="input-group-prepend">' +
        '<button class="btn btn-danger" id="DeleteRow" type="button">' +
        '<i class="bi bi-trash"></i> Delete</button> </div>' +
        '<input required type="text" id="sel' + i + '" name="sel' + i + '"> </div> </div>';
        i++;

        $('#newinput').append(newRowAdd);
        console.log(i);
    } else {
        console.log("Limit of Selections Reached");
    }
    
});

$("body").on("click", "#DeleteRow", function () {
    $(this).parents("#row").remove();
})

