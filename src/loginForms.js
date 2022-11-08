import { addDoc } from "firebase/firestore";
import { signOut,  createUserWithEmailAndPassword, signInWithEmailAndPassword, getAuth} from "firebase/auth";
import { accountsRef, displayModal } from "./database";
import { auth } from "./auth";

/* Modified, Documented by Jesus Macias */

// Get the Login Modal
export var loginModal = document.getElementById("loginModal");

// Get the Register Modal
export var registerModal = document.getElementById('registerModal');

// Get the button that opens the Login Modal
export var loginBtn = document.getElementById("loginBtn");

// Get the button that opens the Register Modal
export var registerBtn = document.getElementById("registerBtn");

// Get the Change User Btn
export var changeUserBtn = document.getElementById('changeUserBtn');

// Code for logging out
const signOutForm = document.getElementById('signOutLive');
if (signOutForm != null) {
  signOutForm.addEventListener('submit',(event)=>{
    event.preventDefault();
    signOut(auth)
    
    .then(() => {
        console.log('Sign out event');
        location.reload();

    })
    .catch((error)=>{
        console.log(error);
    })
  })
}

// Checks that the Login and Register Modals exist
if (loginModal != null) {
    // Modal Creation for Login System
    var loginModal = new bootstrap.Modal(loginModal, {
        keyboard: false
    })

    // Modal Creation for Register Sytem
    var registerModal = new bootstrap.Modal(registerModal, {
        keyboard: false
    })


    // When the user clicks on the button, open the Register modal
    registerBtn.onclick = function() {
        displayModal(true, registerModal);
    }

    // When the user clicks on the button, open the Login modal
    loginBtn.onclick = function() {
        displayModal(true, loginModal);
    }

    // When the user clicks on the button, open the Login modal
    changeUserBtn.onclick = function() {
        displayModal(true, loginModal);
    }

    
    
}

// Function used to display on/off the Login/Register Modal
export function showModals(val) {
    let view;
    if (val == false) {
        displayModal(false, loginModal);
        displayModal(false, registerModal);
        view = "none";
    } else {
        view = "block";
    }
    loginBtn.style.display = view;
    registerBtn.style.display = view;
}


// Gets Register Form and if it exist allows the code to execute
const registerForm = document.getElementById('signUpLive');
if (registerForm != null) {
    //let alert = document.getElementById("validSignUpAlert")
    registerForm.addEventListener('submit',(event)=>{
        event.preventDefault();

        // Gets Email and Password and create Account Firebase Auth
        const email = registerForm.email.value.toLowerCase();
        const pass = registerForm.signUpPassword.value;
        createUserWithEmailAndPassword(auth, email,pass)

        // User Record to Database
        .then((userCred) => {
            // User UID
            const user = userCred.user;

            // Add Document of User to Collection using AccountsRef
            addDoc(accountsRef,{
                activePolls: 0,
                inactivePolls: 0,
                totalPolls: 100,
                firstName: registerForm.fName.value,
                lastName: registerForm.lName.value,
                email: email,
                phone: registerForm.phone.value,
                votedOn: []
            })
            console.log(email + " was sucessfully created!")
            displayModal(false, registerModal);

            // Get Token and Change View
            registerForm.reset();

            setTimeout(function(){
                location.reload();
            },500);
        })
        .catch((error)=>{
            console.log(error);
            console.error();
        })
    });
}


// Gets Login Form and if it exist allows the code to execute
const loginForm = document.getElementById('loginLive');
if(loginForm != null) {
    loginForm.addEventListener('submit',(event)=>{
        event.preventDefault();
        const email = loginForm.email.value;
        const pass = loginForm.signInPassword.value;
        signInWithEmailAndPassword(auth, email,pass)
        .then((userCred) => {
            const uid = userCred.user.uid
            console.log(userCred.user.email + " Signed In");
            displayModal(false, loginModal);
    
            // Get Token and Change View
            loginForm.reset();

            setTimeout(function(){
                location.reload();
            },1000);
        })
        .catch((error)=>{
            console.log(error);
        })
    });
}
