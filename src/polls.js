/* Modified, Documented by Jesus Macias */


import { addDoc } from "firebase/firestore";
import { logged_user, updateUserDoc } from "./auth";
import { addTableData, displayModal, pollsRef } from "./database";

const colNames = ['pollName', 'owner', 'startDate', 'startTime', 'selections', 'totalVotes', 'public', 'viewPercent', 'endDate', 'endTime'];

addTableData(pollsRef, 'pollsTable', colNames);

// Get the modal
export var createPollModal = document.getElementById("createPollModal");

// Get the button that opens the Poll Creation modal
export var createPollBtn = document.getElementById("createPollBtn");

// Get the Form for Creating a Poll
const createPollForm = document.getElementById('createPollForm');

// MAX Selections
const limit = 12;

// Next Added Selection Val
var i = 2;

// Elements for Form of Poll Creation
const startDate = document.getElementById('startDate');
const endDate = document.getElementById('endDate');
const startTime = document.getElementById('startTime');
const endTime = document.getElementById('endTime');

// Set the Default Mins to Current Day
defaultMin();

if (startDate != null) {
    // When the user changes the Start Date
    startDate.onchange = function() {
        if(startDate.value == "")
            defaultMin();
        else {
            console.log(startDate.value)
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
        setAtt('min', endTime, startTime.value)
        console.log("SAME")
    } else {
        setAtt('min', endTime, '00:00')
        console.log("DIFF")
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

function compareTimeFrame(startDateIn, startTimeIn) {
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); 
    var yyyy = today.getFullYear();
    var nn = String(today.getMinutes()).padStart(2, '0');
    var hh = String(today.getHours()).padStart(2, '0');
    var currtime = hh + ':' + nn;
    console.log(currtime);
    today = yyyy + '-' + mm + '-' + dd;

    console.log(startDateIn.value)
    console.log(today);

    if (startDateIn.value == today) {
        if(startTimeIn.value > currtime)
            return false;
        else
            return true;
    } else if (startDateIn.value > today) {
        return false;

    } else {
        return true;   
    }
}


function createPollDoc(data) {
    let activeIn = false;

    let selectionsList = [];
    for (const [key, value] of Object.entries(data)) {
        if(key.substring(0,3) == "sel") {
            var currentSelection = {
                'selectionName':value,
                'votes': 0
            }
            console.log(currentSelection);
            selectionsList.push(currentSelection);
        }  
    }

    activeIn = compareTimeFrame(createPollForm.startDate, createPollForm.startTime);
    

    addDoc(pollsRef, {
        pollName: createPollForm.pollName.value,
        endDate: createPollForm.endDate.value,
        endTime: createPollForm.endTime.value,
        startTime: createPollForm.startTime.value,
        startDate: createPollForm.startDate.value,
        owner: logged_user.email,
        public: createPollForm.viewStatus.value,
        viewPercent: createPollForm.viewPercent.value,
        totalVotes: 0,
        selections: selectionsList,
        active: activeIn
    })

    updateUserDoc(activeIn);
}

// Checks to see if the Create Poll Form exist, if so check for submission
if (createPollForm != null) {
    createPollForm.addEventListener('submit',(event) => {
        event.preventDefault();
        const data = Object.fromEntries(new FormData(createPollForm).entries());
        createPollDoc(data);
        console.log(data);
        createPollForm.reset();

        setTimeout(function(){
            location.reload();
        },500);
    });
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
