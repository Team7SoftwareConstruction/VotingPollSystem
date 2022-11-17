// Modified, Documented by Jesus Macias 

import { onAuthStateChanged } from "firebase/auth";
import { auth, redirectHome } from "./auth";
import { checkPollDoc } from "./database";
import PollContainer from "./pollContainer";

const viewVotedOnPolls = document.getElementById('viewVotedOnPollsBtn')
const viewActivePolls = document.getElementById('viewActivePollsBtn')
const viewPublicPollsResults = document.getElementById('viewPublicPollsResultBtn')

var pollContainer;
let checkID;

onAuthStateChanged(auth,(user)=>{
    /* USER IS LOGGED IN */
    if (user) {
      /* Logged_user becomes who is currently signed in */
      // Import Statements for Polls Js
      pollContainer = new PollContainer("pollsPage", user.email);
      pollContainer.generatePolls();

    /* USER ISN'T LOGGED IN */
    } else {
      redirectHome();
      /* If Logged User isn't Null Display Logoff Message */

    }
});

checkID = setInterval(checkPollUpdates, 60000);

function checkPollUpdates() {
    console.log("Checking For Updates");
    pollContainer.pollList.forEach((value, key) => {
      // Check if any of the polls need to be changed to Over
      checkPollDoc(value['startDate'], value['startTime'], value['endDate'], value['endTime'], key);
    });
  }

if (viewActivePolls) {
    viewActivePolls.addEventListener('click', (event) =>  {
        console.log("View Active");
        pollContainer.showOwned = false;
        pollContainer.showVoted = false;
        pollContainer.showResults = false;
        pollContainer.votedOnBtn = false;
        pollContainer.showResultsOnBtn = false;
        pollContainer.activeOnBtn = true;
        resetPollListing();
    })
};


if (viewVotedOnPolls) {
    viewVotedOnPolls.addEventListener('click', (event) =>  {
        pollContainer.showOwned = false;
        pollContainer.showVoted = true;
        pollContainer.showResults = false;
        pollContainer.votedOnBtn = true;
        pollContainer.showResultsOnBtn = false;
        pollContainer.activeOnBtn = false;
        resetPollListing();
    });
}

if (viewPublicPollsResults) {
  viewPublicPollsResults.addEventListener('click', (event) =>  {
      pollContainer.showOwned = false;
      pollContainer.showVoted = false;
      pollContainer.showResults = true;
      pollContainer.votedOnBtn = false;
      pollContainer.showResultsOnBtn = true;
      pollContainer.activeOnBtn = false;
      resetPollListing();
      
  });
}

function resetPollListing() {
  pollContainer.generatedPolls = 0;
  document.getElementById('pollListing').remove();
  const newPollListing = document.createElement("div")
  newPollListing.className = "row";
  newPollListing.id = 'pollListing';
  const appendTo = document.getElementById('appendTo');
  appendTo.append(newPollListing);
  pollContainer.displayGeneratedList();
  pollContainer.displayNoPollMessages();
}
  
