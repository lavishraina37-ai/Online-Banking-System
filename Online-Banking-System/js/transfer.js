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
    getDoc,
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

            const receiverAccount = document
                .getElementById("receiverAccount")
                .value
                .trim();

            const amount = Number(
                document.getElementById("amount").value
            );

            if (!receiverAccount) {
                alert("Please enter receiver account number.");
                return;
            }

            if (isNaN(amount) || amount <= 0) {
                alert("Please enter a valid amount.");
                return;
            }

            const senderRef = doc(db, "users", user.uid);
            const senderSnap = await getDoc(senderRef);
            if (!senderSnap.exists()) {
                alert("Sender account not found.");
                return;
            }
            const senderData = senderSnap.data();

            if (receiverAccount === senderData.accountNumber) {
                alert("You cannot transfer money to yourself.");
                return;
            }

            const receiverQuery = query(
                collection(db, "users"),
                where("accountNumber", "==", receiverAccount)
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
            let senderAccount = "";

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

                senderName = sender.name ?? sender.personalDetails?.name ?? "N/A";
                receiverName = receiver.name ?? receiver.personalDetails?.name ?? "N/A";
                senderAccount = sender.accountNumber ?? sender.bankDetails?.accountNumber ?? "N/A";

                senderBalance = Number(sender.balance ?? sender.accountInfo?.balance ?? 0);
                receiverBalance = Number(receiver.balance ?? receiver.accountInfo?.balance ?? 0);

                if (senderBalance < amount) {
                    throw new Error("Insufficient balance.");
                }

                transaction.update(senderRef, {
                    balance: senderBalance - amount,
                    ...(sender.accountInfo ? { "accountInfo.balance": senderBalance - amount } : {}),
                    lastTransaction: serverTimestamp()
                });

                transaction.update(receiverRef, {
                    balance: receiverBalance + amount,
                    ...(receiver.accountInfo ? { "accountInfo.balance": receiverBalance + amount } : {}),
                    lastTransaction: serverTimestamp()
                });

            });

            const transactionId =
                "TXN" +
                Date.now() +
                Math.floor(Math.random() * 1000);

            // Add transaction for sender (Debit)
            await addDoc(collection(db, "transactions"), {
                transactionId,
                uid: user.uid,
                type: "Transfer (Sent)",
                amount,
                to: receiverAccount,
                senderName,
                receiverName,
                previousBalance: senderBalance,
                newBalance: senderBalance - amount,
                status: "Success",
                description: `Sent to Account ${receiverAccount}`,
                createdAt: serverTimestamp()
            });

            // Add transaction for receiver (Credit)
            await addDoc(collection(db, "transactions"), {
                transactionId,
                uid: receiverDoc.id,
                type: "Transfer (Received)",
                amount,
                from: senderAccount,
                senderName,
                receiverName,
                previousBalance: receiverBalance,
                newBalance: receiverBalance + amount,
                status: "Success",
                description: `Received from Account ${senderAccount}`,
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