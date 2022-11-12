import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./auth";
import { displayModal } from "./database";
import PollContainer from "./pollContainer";
import { signInToVoteMessage } from "./vote";

var pollContainer;

onAuthStateChanged(auth,(user)=>{
    /* USER IS LOGGED IN */
    if (user) {
      /* Logged_user becomes who is currently signed in */
      // Import Statements for Polls Js
      pollContainer = new PollContainer("indexPage", user.email);
      pollContainer.generatePolls();

    /* USER ISN'T LOGGED IN */
    } else {
        signInToVoteMessage();
        displayModal(true, confirmVoteModal)
      /* If Logged User isn't Null Display Logoff Message */

    }
  })