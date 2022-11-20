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


function createUserDoc() {
    return new Promise((addedUserDoc) => {
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
            addedUserDoc();
        })
        .catch((error)=>{
            if(document.getElementById('errorM') == null) {
                let errorM = document.createElement("div");
                errorM.innerHTML = '<div id="errorM" class="alert alert-warning alert-dismissible fade show text-center" role="alert">'
                + '<p>Email already associated to an Account</p><p>Try a different Email!</p>'
                + '<button type="button" class="close" data-dismiss="alert" aria-label="Close">'
                + '<span aria-hidden="true">&times;</span>'
                + '</button>'
                + '</div>';
                document.getElementById('errorMessage').append(errorM);
            }
                console.log(error);
                console.error();
        })
    });
}


// Gets Register Form and if it exist allows the code to execute
const registerForm = document.getElementById('signUpLive');
const phone = document.getElementById('phone');
if (registerForm != null) {
    //let alert = document.getElementById("validSignUpAlert")
    registerForm.addEventListener('submit',async (event)=>{
        event.preventDefault();
        await createUserDoc()
        
        displayModal(false, registerModal);
        setTimeout(function(){
            registerForm.reset();
        },5000);
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

            setTimeout(function(){
                loginForm.reset();
            },5000);
        })
        .catch((error)=>{
                let errorM2 = document.createElement("div");
                errorM2.innerHTML = '<div id="errorM2" class="alert alert-warning alert-dismissible fade show text-center" role="alert">'+error+'</p>'
                + '<button type="button" class="close" data-dismiss="alert" aria-label="Close">'
                + '<span aria-hidden="true">&times;</span>'
                + '</button>'
                + '</div>';
                document.getElementById('errorMessage2').append(errorM2);
            console.log(error);
        })
    });
}

const fName = document.getElementById('fName');
const lName = document.getElementById('lName');
if(fName, lName, phone != null) {
    fName.onchange = function() {
        console.log("No Spaces Allowed");
        fName.value = fName.value.replace(/\s/g, "");
        fName.value = fName.value.replace(/[0-9]/g, '');
    };

    lName.onchange = function() {
        console.log("No Spaces Allowed");
        lName.value = lName.value.replace(/\s/g, "");
        lName.value = lName.value.replace(/[0-9]/g, '');
    };

    phone.onkeyup = function() {
        if (phone.value.length > 12) {
            phone.value = phone.value.substring(0, 12);
        }
        phone.value = phone.value.replace(/[^\d-]/g, '')
    };

    phone.onkeydown = function(e) {
        if ((phone.value.length == 3 || phone.value.length == 7) && e.key !== "Backspace" && e.key!== "-" ) {
            phone.value = phone.value + '-';
        }
    };
}

