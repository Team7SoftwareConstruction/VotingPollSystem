console.log("Page is running Auth Js v1.0");
// Written, Documented by Jesus Macias

import { 
  // Import References to Firebase Auth Exports
  signOut, getAuth, onAuthStateChanged,
} from "firebase/auth";
import { doc, getDoc, getDocs, updateDoc } from "firebase/firestore";
import { accountsRef, app, db, loadData } from "./database";
import { showModals } from "./loginForms";

// Get the Account Info Container 
const accountInfoContainer = document.getElementById('accountInfoContainer');

/* Export and declare Auth, using the init = InitializeApp(firebaseConfig); */
export const auth = getAuth(app);
const user = auth.currentUser;
if (user != null) {
  // The user object has basic properties such as display name, email, etc.
  const email = user.email;
  const uid = user.uid;
  console.log(uid)
}

/* Variables to define current user and role */
export var logged_user;
var logged_role;


/* Modified by Jesus Macias */
// Get the current state of who is signed in or out.
onAuthStateChanged(auth,(user)=>{
  /* USER IS LOGGED IN */
  if (user) {
    /* Logged_user becomes who is currently signed in */
    logged_user = user;
    
    /* Get Token and in return data such as role else return error */
    user.getIdTokenResult()
    .then((idTokenResult) => {
      /* Logged_Role becomes the role of who is currently signed in */
      logged_role = idTokenResult.claims.role;

      showCurrentUser(true);
      setCurrentUserInfo();

      /*
      if (logged_role == "customer" || logged_role == 'undefined') {
        redirectHome("customer");
      }
      */
      
      /* Display who is currently logged in message */
      console.log(logged_user.email + " Logged In | Current Role: " + logged_role);
      
      /* Change Views Based On Login */
  
    }).catch((error) => {
      /* Error Message */
      console.log(error);
    })
  /* USER ISN'T LOGGED IN */
  } else {
    /* If Logged User isn't Null Display Logoff Message */
    if (logged_user != null) {
      console.log(logged_user.email + " Logged Off");
    }

    showCurrentUser(false);

    /* Since user isn't logged on, reset logged_role and logged_user */
    logged_role = null;
    logged_user = null;

    /* Change Views Based On Login */

  }
})

// Function to Update Current Account Doc
export function updateUserDoc(activeIn) {
    var cid;
    let q = loadData(accountsRef, 'email', "==", logged_user.email);
    getDocs(q)
    .then((snapshot) =>{
        snapshot.docs.forEach((documents) => {
            cid = documents.id;
            console.log(cid);
            getDoc(doc(db,'accountTesting',cid)).then(docSnap=> {
                if(docSnap.exists()) {
                    var totalPollsOut = Number(docSnap.data()['totalPolls']) - 1;
                    var activePollsOut = Number(docSnap.data()['activePolls']);
                    var inactivePollsOut = Number(docSnap.data()['inactivePolls']);
                    if(activeIn)
                        activePollsOut = Number(docSnap.data()['activePolls']) + 1;
                    else 
                        inactivePollsOut = Number(docSnap.data()['inactivePolls']) + 1;

                    updateDoc(doc(db, 'accountTesting', cid), {
                        totalPolls: totalPollsOut,
                        activePolls: activePollsOut,
                        inactivePolls: inactivePollsOut
                    })
                }
            })
        })
    })  

}

// Function used to display the Current User on Home Page
export function showCurrentUser(val) {
    if (val == false) {
        showModals(true);
        accountInfoContainer.style.display = "none";
    } else {
        showModals(false);
        accountInfoContainer.style.display = "";
        let accountEmailLabel = document.getElementById('accountEmail');
        accountEmailLabel.innerText = logged_user.email;
    }
}

function setCurrentUserInfo() {
    let q = loadData(accountsRef, "email", "==", logged_user.email);
    getDocs(q).then((snapshot)=>{
        snapshot.docs.forEach((documents)=>{
            let activePollsBar = document.getElementById('accountActivePolls');
            let inactivePollsBar = document.getElementById('accountInactivePolls');
            let totalLeftBar = document.getElementById('accountTotalPollsLeft');

            let activePollsLabel = document.getElementById('activePollsLabel');
            let inactivePollLabel = document.getElementById('inactivePollsLabel');
            let totalLeftLabel = document.getElementById('totalPollsLeftLabel');

            activePollsBar.style = "width: " + documents.data()['activePolls'] + "%;";
            inactivePollsBar.style = "width: " + documents.data()['inactivePolls'] + "%;";
            totalLeftBar.style = "width: " + documents.data()['totalPolls'] + "%;";

            activePollsLabel.innerText = documents.data()['activePolls'] + " Active"
            inactivePollLabel.innerText = documents.data()['inactivePolls'] + " Inactive"
            totalLeftLabel.innerText = documents.data()['totalPolls'] + " Left"
        })
    })
  }