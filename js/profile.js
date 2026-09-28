import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

const name = document.getElementById("name");
const email = document.getElementById("email");
const balance = document.getElementById("balance");
const uid = document.getElementById("uid");
const logoutBtn = document.getElementById("logoutBtn");

onAuthStateChanged(auth, async (user) => {

    if (!user) {
        window.location.href = "login.html";
        return;
    }

    const docRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {

        const data = docSnap.data();

        const nameVal = data.name ?? data.personalDetails?.name ?? "N/A";
        const emailVal = data.email ?? data.personalDetails?.email ?? "N/A";
        const balanceVal = data.balance ?? data.accountInfo?.balance ?? 0;

        name.textContent = nameVal;

        email.textContent = "📧 " + emailVal;

        balance.textContent = "₹" + balanceVal;

        uid.textContent = "User ID: " + user.uid;

    }

});

logoutBtn.addEventListener("click", async () => {

    await signOut(auth);

    window.location.href = "login.html";

});