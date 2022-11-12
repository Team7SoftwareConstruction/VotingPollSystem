// Modified, Documented by Jesus Macias 

import { onAuthStateChanged } from "firebase/auth";
import { auth, redirectHome } from "./auth";
import { signInToVoteMessage } from "./database";
import PollContainer from "./pollContainer";

const viewVotedOnPolls = document.getElementById('viewVotedOnPollsBtn')
const viewActivePolls = document.getElementById('viewActivePollsBtn')

var pollContainer;

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
  })

if (viewActivePolls) {
    viewActivePolls.addEventListener('click', (event) =>  {
        console.log("View Active");
        pollContainer.showOwned = false;
        pollContainer.showVoted = false;
        pollContainer.multipleZero = 0;
        pollContainer.votedOnBtn = false;
        pollContainer.generatedPolls = 0;
        document.getElementById('pollListing').remove();
        const newPollListing = document.createElement("div")
        newPollListing.className = "row";
        newPollListing.id = 'pollListing';
        const appendTo = document.getElementById('appendTo');
        appendTo.append(newPollListing);
        pollContainer.generatePolls();
    })
};


if (viewVotedOnPolls) {
    viewVotedOnPolls.addEventListener('click', (event) =>  {
        pollContainer.showOwned = false;
        pollContainer.showVoted = true;
        pollContainer.multipleZero = 0;
        pollContainer.votedOnBtn = true;
        pollContainer.generatedPolls = 0;
        document.getElementById('pollListing').remove();
        const newPollListing = document.createElement("div")
        newPollListing.className = "row";
        newPollListing.id = 'pollListing';
        const appendTo = document.getElementById('appendTo');
        appendTo.append(newPollListing);
        pollContainer.generatePolls();
    });
}
  
