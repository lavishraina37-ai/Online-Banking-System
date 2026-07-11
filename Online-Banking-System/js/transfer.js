import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";

import {
    collection,
    query,
    where,
    getDocs,
    doc,
    runTransaction,
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

const form = document.getElementById("transferForm");

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

            const receiverEmail = document
                .getElementById("receiverEmail")
                .value
                .trim()
                .toLowerCase();

            const amount = Number(
                document.getElementById("amount").value
            );

            if (!receiverEmail) {
                alert("Please enter receiver email.");
                return;
            }

            if (isNaN(amount) || amount <= 0) {
                alert("Please enter a valid amount.");
                return;
            }

            if (receiverEmail === user.email.toLowerCase()) {
                alert("You cannot transfer money to yourself.");
                return;
            }

            const senderRef = doc(db, "users", user.uid);

            const receiverQuery = query(
                collection(db, "users"),
                where("email", "==", receiverEmail)
            );

            const receiverSnapshot = await getDocs(receiverQuery);

            if (receiverSnapshot.empty) {
                alert("Receiver account not found.");
                return;
            }

            const receiverDoc = receiverSnapshot.docs[0];
            const receiverRef = doc(db, "users", receiverDoc.id);

            let senderName = "";
            let receiverName = "";
            let senderBalance = 0;
            let receiverBalance = 0;

            await runTransaction(db, async (transaction) => {

                const senderSnap = await transaction.get(senderRef);
                const receiverSnap = await transaction.get(receiverRef);

                if (!senderSnap.exists()) {
                    throw new Error("Sender account not found.");
                }

                if (!receiverSnap.exists()) {
                    throw new Error("Receiver account not found.");
                }

                const sender = senderSnap.data();
                const receiver = receiverSnap.data();

                senderName = sender.name;
                receiverName = receiver.name;

                senderBalance = Number(sender.balance);
                receiverBalance = Number(receiver.balance);

                if (senderBalance < amount) {
                    throw new Error("Insufficient balance.");
                }

                transaction.update(senderRef, {
                    balance: senderBalance - amount,
                    lastTransaction: serverTimestamp()
                });

                transaction.update(receiverRef, {
                    balance: receiverBalance + amount,
                    lastTransaction: serverTimestamp()
                });

            });

            const transactionId =
                "TXN" +
                Date.now() +
                Math.floor(Math.random() * 1000);

            await addDoc(collection(db, "transactions"), {

                transactionId,

                uid: user.uid,

                type: "Transfer",

                amount,

                to: receiverEmail,

                senderName,

                receiverName,

                previousBalance: senderBalance,

                newBalance: senderBalance - amount,

                status: "Success",

                description: "Money Transfer",

                createdAt: serverTimestamp()

            });

            alert(
`Transfer Successful!

Transaction ID: ${transactionId}

Receiver: ${receiverName}

Amount: ₹${amount}

Remaining Balance: ₹${senderBalance - amount}`
            );

            form.reset();

            window.location.href = "dashboard.html";

        } catch (error) {

            console.error(error);

            alert(error.message);

        } finally {

            submitBtn.disabled = false;

        }

    });

});