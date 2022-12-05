import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./auth";
import { signInMessage } from "./errorMessage";
import PollContainer from "./pollContainer";

let pollContainer;

onAuthStateChanged(auth,(user)=>{
    /* USER IS LOGGED IN */
    if (user) {
      /* Logged_user becomes who is currently signed in */
      // Import Statements for Polls Js
      pollContainer = new PollContainer("indexPage", user.email);
      pollContainer.generatePolls();

    /* USER ISN'T LOGGED IN */
    } else {
      signInMessage();
      /* If Logged User isn't Null Display Logoff Message */

    }
  })