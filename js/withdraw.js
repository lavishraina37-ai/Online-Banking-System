import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";

import {
    doc,
    getDoc,
    updateDoc,
    collection,
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

const form = document.getElementById("withdrawForm");

onAuthStateChanged(auth, (user) => {

    if (!user) {
        window.location.href = "login.html";
        return;
    }

    form.addEventListener("submit", async (e) => {

        e.preventDefault();

        const submitBtn = form.querySelector("button");

        submitBtn.disabled = true;

        try {

            const amount = Number(document.getElementById("amount").value);

            if (isNaN(amount) || amount <= 0) {

                alert("Please enter a valid amount.");

                submitBtn.disabled = false;
                return;
            }

            const userRef = doc(db, "users", user.uid);

            const snap = await getDoc(userRef);

            if (!snap.exists()) {

                alert("User not found.");

                submitBtn.disabled = false;
                return;
            }

            const data = snap.data();

            const previousBalance = Number(data.balance ?? data.accountInfo?.balance ?? 0);

            if (amount > previousBalance) {

                alert("Insufficient Balance!");

                submitBtn.disabled = false;
                return;
            }

            const newBalance = previousBalance - amount;

            const name = data.name ?? data.personalDetails?.name ?? "N/A";
            const email = data.email ?? data.personalDetails?.email ?? "N/A";
            const accountNumber = data.accountNumber ?? data.bankDetails?.accountNumber ?? "N/A";

            await updateDoc(userRef, {

                balance: newBalance,
                ...(data.accountInfo ? { "accountInfo.balance": newBalance } : {}),

                lastTransaction: serverTimestamp()

            });

            const transactionId =
                "TXN" + Date.now() + Math.floor(Math.random() * 1000);

            await addDoc(collection(db, "transactions"), {

                transactionId: transactionId,

                uid: user.uid,

                name: name,

                email: email,

                accountNumber: accountNumber,

                type: "Withdraw",

                amount: amount,

                previousBalance: previousBalance,

                newBalance: newBalance,

                status: "Success",

                description: "Cash Withdrawal",

                createdAt: serverTimestamp()

            });

            alert(
`Withdrawal Successful!

Transaction ID : ${transactionId}

Amount : ₹${amount}

Remaining Balance : ₹${newBalance}`
            );

            window.location.href = "dashboard.html";

        }

        catch (error) {

            console.error(error);

            alert(error.message);

        }

        finally {

            submitBtn.disabled = false;

        }

    });

});