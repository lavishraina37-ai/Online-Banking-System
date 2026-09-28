import { auth, db } from "./firebase.js";

import {
    signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";


import {
    doc,
    updateDoc,
    getDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";



const form = document.getElementById("loginForm");



form.addEventListener("submit", async (e)=>{


    e.preventDefault();


    const email = document
        .getElementById("email")
        .value
        .trim();


    const password = document
        .getElementById("password")
        .value;



    // Validation

    if(!email || !password){

        alert("Please enter email and password");
        return;

    }



    try{


        // Firebase Login

        const userCredential =
            await signInWithEmailAndPassword(
                auth,
                email,
                password
            );


        const user = userCredential.user;



        // Check Firestore User Data

        const userRef =
            doc(db,"users",user.uid);


        const userSnap =
            await getDoc(userRef);



        if(!userSnap.exists()){

            alert("User profile not found");
            return;

        }



        // Update Last Login Time

        await updateDoc(
            userRef,
            {

                lastLogin: serverTimestamp()

            }
        );



        alert("Login Successful!");



        window.location.href =
            "dashboard.html";



    }

    catch(error){


        console.error(error);



        switch(error.code){


            case "auth/user-not-found":

                alert("No account found with this email");
                break;



            case "auth/wrong-password":

                alert("Incorrect password");
                break;



            case "auth/invalid-email":

                alert("Invalid email format");
                break;



            case "auth/invalid-credential":

                alert("Invalid email or password");
                break;



            default:

                alert(error.message);

        }


    }


});