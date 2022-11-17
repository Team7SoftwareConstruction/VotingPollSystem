console.log("Page is running Auth Js v1.0");
// Written, Documented by Jesus Macias

import { 
  // Import References to Firebase Auth Exports
  signOut, getAuth, onAuthStateChanged,
} from "firebase/auth";
import { doc, getDoc, getDocs, onSnapshot, runTransaction, writeBatch } from "firebase/firestore";
import { accountsRef, app, db, loadData } from "./database";
import { showModals } from "./loginForms";

// Get the Account Info Container 
const accountInfoContainer = document.getElementById('accountInfoContainer');

// Variables to define current user and role 
export var logged_user;
var logged_role;

// Export and declare Auth, using the init = InitializeApp(firebaseConfig); 
export const auth = getAuth(app);

export var cid;

// Modified by Jesus Macias 
// Get the current state of who is signed in or out.
onAuthStateChanged(auth,(user)=>{
  // USER IS LOGGED IN 
  if (user) {

    // Logged_user becomes who is currently signed in 
    logged_user = user;
    
    // Get Token and in return data such as role else return error 
    user.getIdTokenResult()
    .then((idTokenResult) => {
      // Logged_Role becomes the role of who is currently signed in 
      logged_role = idTokenResult.claims.role;

      showCurrentUser(true);
      /*
  
      if (logged_role == "user" || logged_role == 'undefined') {
        redirectHome("user");
      }
      */

      // Display who is currently logged in message 
      console.log(logged_user.email + " Logged In | Current Role: " + logged_role);
      
      // Change Views Based On Login 
  
    }).catch((error) => {
      // Error Message 
      console.log(error);
    })
  // USER ISN'T LOGGED IN 
  } else {
    // If Logged User isn't Null Display Logoff Message 
    if (logged_user != null) {
      console.log(logged_user.email + " Logged Off");
    }

    showCurrentUser(false);

    // Since user isn't logged on, reset logged_role and logged_user 
    logged_role = null;
    logged_user = null;

    // Change Views Based On Login 

  }
})

/* Written by Jesus Macias */
export function redirectHome(type) {
  // This means viewing from website
  let localhost = 0;
  // Get the location path name 
  let loc = window.location.pathname

  // If on LocalHost then
  if(loc.substring(0, 5) == "/dist") {
    // Remove extra path
    loc = window.location.pathname.substring(5)
    // local host is being viewed
    localhost = 1;
  }

  // If local host then redirect using correct path else use host path
  if(localhost) {
    window.location.href = window.location.origin + '/dist/index.html'
  } else {
    window.location.href = window.location.origin + '/index.html'
  }
}

// Function to set the redirect link for Dashboard based on Current User
function setDashLink(role) {
  if (role == 'admin')
    document.getElementById('dashboardLink').href = "./adminDash.html";
  else
    document.getElementById('dashboardLink').href = "./userDash.html";
}

// Function used to display the Current User on Home Page
export function showCurrentUser(val) {
  if (val == false) {
    accountInfoContainer.style.display = "none";
    showModals(true);
  } else {
    accountInfoContainer.style.display = "";
    showModals(false);
    setCurrentUserInfo();
  }
}

/* This Function is used to get the Account Document using the Current User Email,
   Upon getting the Document, the Nav Bar is setup for the Current Account in the sense,
   Of Total Polls Left, Inactive Polls, and Active Polls.
*/
function setCurrentUserInfo() {
  setDashLink('user');
  let accountEmailLabel = document.getElementById('accountEmail');
  accountEmailLabel.innerText = logged_user.email;

  let q = loadData(accountsRef, "email", "==", logged_user.email);
  onSnapshot(q, (querySnapshot) => {
    querySnapshot.docChanges().forEach(change => {
      let activePollsBar = document.getElementById('accountActivePolls');
      let inactivePollsBar = document.getElementById('accountInactivePolls');
      let totalLeftBar = document.getElementById('accountTotalPollsLeft');

      let activePollsLabel = document.getElementById('activePollsLabel');
      let inactivePollLabel = document.getElementById('inactivePollsLabel');
      let totalLeftLabel = document.getElementById('totalPollsLeftLabel');

      activePollsBar.style = "width: " + change.doc.data()['activePolls'] + "%;";
      inactivePollsBar.style = "width: " + change.doc.data()['inactivePolls'] + "%;";
      totalLeftBar.style = "width: " + change.doc.data()['totalPolls'] + "%;";

      activePollsLabel.innerText = change.doc.data()['activePolls'] + " Active"
      inactivePollLabel.innerText = change.doc.data()['inactivePolls'] + " Inactive"
      totalLeftLabel.innerText = change.doc.data()['totalPolls'] + " Left"
    })
  })
}

  // Function to Update Current Account Doc used when Poll is Created.
export function updateUserDoc(activeIn, changeLabel, owner) {
    let cid;
    let q = loadData(accountsRef, 'email', "==", owner);
    getDocs(q)
    .then((snapshot) =>{
      snapshot.docs.forEach((documents) => {
        cid = documents.id;
        console.log(cid);
        updateFirebaseUserDoc(cid, activeIn, changeLabel);
      })
    });
}

async function updateFirebaseUserDoc (cid, activeIn, changeLabel) {
  let totalPollsOut;
  let activePollsOut;
  let inactivePollsOut;
  try {
    const accountRef = doc(db, 'accountTesting', cid);
    await runTransaction(db, async (transaction) => {
      const accountDoc = await transaction.get(accountRef);
      if (!accountDoc.exists()) {
        throw "Document does not exist!";
      }

      if (changeLabel == 'added') {
        totalPollsOut = Number(accountDoc.data()['totalPolls']) - 1;
        if(activeIn) {
          activePollsOut = Number(accountDoc.data()['activePolls']) + 1;
          inactivePollsOut = Number(accountDoc.data()['inactivePolls']);
        }else { 
          activePollsOut = Number(accountDoc.data()['activePolls']);
          inactivePollsOut = Number(accountDoc.data()['inactivePolls']) + 1;
        }
      } else if (changeLabel == 'modified') {
        totalPollsOut = Number(accountDoc.data()['totalPolls']);
        if(activeIn) {
          activePollsOut = Number(accountDoc.data()['activePolls']) + 1;
          inactivePollsOut = Number(accountDoc.data()['inactivePolls']) - 1;
        } else {
          activePollsOut = Number(accountDoc.data()['activePolls']) - 1;
          inactivePollsOut = Number(accountDoc.data()['inactivePolls']) + 1;
        } 
      } else {
        console.log("Changed Label not Specified");
        return;
      }
  
      transaction.update(accountRef, {
        totalPolls: totalPollsOut,
        activePolls: activePollsOut,
        inactivePolls: inactivePollsOut
      });
    });
    console.log("Account Doc Transaction successfully committed!");
  } catch (e) {
    console.log("Account Doc Transaction failed: ", e);
  }
}