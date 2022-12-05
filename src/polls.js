// Modified, Documented by Jesus Macias 

import { onAuthStateChanged } from "firebase/auth";
import { event } from "jquery";
import { auth, redirectHome } from "./auth";
import { checkPollDoc } from "./database";
import PollContainer from "./pollContainer";

const viewVotedOnPolls = document.getElementById('viewVotedOnPollsBtn')
const viewActivePolls = document.getElementById('viewActivePollsBtn')
const viewPublicPollsResults = document.getElementById('viewPublicPollsResultBtn')
const votedOnActiveStatus = document.getElementById('votedOnActiveStatus')
const votedOnActiveBtn = document.getElementById('votedOnActive')
const votedOnInactiveBtn = document.getElementById('votedOnInactive')

let pollContainer;
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
        pollContainer.activeOnBtn = true;
        pollContainer.votedOnBtn = false;
        pollContainer.showResultsOnBtn = false;
        pollContainer.showOwned = false;
        pollContainer.showActive = true;
        pollContainer.showVoted = false;
        pollContainer.showFinished = false;
        votedOnActiveStatus.style = 'display:none'
        pollContainer.resetPollListing();
    })
};


if (viewVotedOnPolls) {
    viewVotedOnPolls.addEventListener('click', (event) =>  {
      pollContainer.activeOnBtn = false;
        pollContainer.votedOnBtn = true;
        pollContainer.showResultsOnBtn = false;
        pollContainer.showOwned = false;
        pollContainer.showActive = true;
        pollContainer.showVoted = true;
        pollContainer.showFinished = false;
        votedOnActiveStatus.style = ''
        pollContainer.resetPollListing();
    });

    votedOnActiveBtn.addEventListener('click', (event) => {
      pollContainer.activeOnBtn = false;
      pollContainer.votedOnBtn = true;
      pollContainer.showResultsOnBtn = false;
      pollContainer.showOwned = false;
      pollContainer.showActive = true;
      pollContainer.showVoted = true;
      pollContainer.showFinished = false;
      votedOnActiveStatus.style = ''
      pollContainer.resetPollListing();
    });

    votedOnInactiveBtn.addEventListener('click', (event) => {
      pollContainer.activeOnBtn = false;
      pollContainer.votedOnBtn = true;
      pollContainer.showResultsOnBtn = false;
      pollContainer.showOwned = false;
      console.log("Inactive");
      pollContainer.showActive = false;
      pollContainer.showVoted = true;
      pollContainer.showFinished = true;
      votedOnActiveStatus.style = ''
      pollContainer.resetPollListing();
    });
}

if (viewPublicPollsResults) {
  viewPublicPollsResults.addEventListener('click', (event) =>  {
    pollContainer.activeOnBtn = false;
      pollContainer.votedOnBtn = false;
      pollContainer.showResultsOnBtn = true;
      pollContainer.showOwned = false;
      pollContainer.showActive = false;
      pollContainer.showVoted = false;
      pollContainer.showFinished = true;
      votedOnActiveStatus.style = 'display:none'
      pollContainer.resetPollListing();     
  });
}

  
