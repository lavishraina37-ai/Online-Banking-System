import { auth, db } from "./firebase.js";

import {
  createUserWithEmailAndPassword,
  updateProfile
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";

import {
  doc,
  setDoc,
  serverTimestamp,
  getDoc
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";


const form = document.getElementById("registerForm");


form.addEventListener("submit", async (e) => {

  e.preventDefault();


  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const password = document.getElementById("password").value;


  // Validation

  if (!name || !email || !phone || !password) {

    alert("Please fill all fields");
    return;

  }


  if (!/^[0-9]{10}$/.test(phone)) {

    alert("Enter valid 10 digit phone number");
    return;

  }


  if(password.length < 6){

    alert("Password must contain minimum 6 characters");
    return;

  }



  try {


    // Create Firebase Authentication User

    const userCredential = 
      await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );


    const user = userCredential.user;



    // Update Firebase Profile

    await updateProfile(user,{

      displayName:name

    });



    // Generate Banking Details

    const accountNumber =
      "AC" +
      Math.floor(
        1000000000 + Math.random()*9000000000
      );


    const customerId =
      "CUST" + Date.now();



    const ifscCode =
      "SBIN0001234";


    const branch =
      "Main Branch";


    const profileImage =
      "https://cdn-icons-png.flaticon.com/512/149/149071.png";



    // Save User Data in Firestore


    await setDoc(
      doc(db,"users",user.uid),
      {


        uid:user.uid,


        personalDetails:{


          name:name,

          email:email,

          phone:phone,


        },


        bankDetails:{


          accountNumber:accountNumber,

          customerId:customerId,

          ifscCode:ifscCode,

          branch:branch,

          accountType:"Savings"


        },


        accountInfo:{


          balance:10000,

          kycStatus:"Pending"


        },


        profileImage:profileImage,


        createdAt:serverTimestamp(),

        lastLogin:serverTimestamp()


      }

    );



    alert("Registration Successful");


    window.location.href="login.html";



  }

  catch(error){


    console.error(error);


    if(error.code==="auth/email-already-in-use"){

      alert("Email already registered");

    }

    else if(error.code==="auth/weak-password"){

      alert("Password is too weak");

    }

    else{

      alert(error.message);

    }


  }


});