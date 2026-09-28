// firebase.js

import { initializeApp } 
from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";


import { getAuth } 
from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";


import { getFirestore } 
from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";



// Firebase Configuration

const firebaseConfig = {

  apiKey: "AIzaSyB_KJpur0WoE-V8cKIyPI4Jt5xvgHRwFzg",

  authDomain: "online-banking-system-7ab46.firebaseapp.com",

  projectId: "online-banking-system-7ab46",

  storageBucket: "online-banking-system-7ab46.appspot.com",

  messagingSenderId: "572510316412",

  appId: "1:572510316412:web:50a72aa314aaa8ce5b66f9"

};



// Initialize Firebase

const app = initializeApp(firebaseConfig);



// Initialize Authentication

const auth = getAuth(app);



// Initialize Firestore Database

const db = getFirestore(app);



// Export Firebase services

export { auth, db };