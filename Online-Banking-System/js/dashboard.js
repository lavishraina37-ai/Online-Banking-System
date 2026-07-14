import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";

import {
    doc,
    getDoc,
    collection,
    query,
    where,
    orderBy,
    limit,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

// DOM Elements
const welcomeHeader = document.querySelector(".welcome h1");
const balanceBox = document.getElementById("balance");
const accountNumberBox = document.getElementById("accountNumber");
const customerIdBox = document.getElementById("customerId");
const ifscBox = document.getElementById("ifsc");
const branchBox = document.getElementById("branch");
const recentTransactionsBox = document.getElementById("recentTransactions");
const logoutBtn = document.getElementById("logoutBtn");

onAuthStateChanged(auth, async (user) => {
    if (!user) {
        window.location.href = "login.html";
        return;
    }
    await loadUserData(user.uid);
    await loadRecentTransactions(user.uid);
});

async function loadUserData(uid) {
    try {
        const userRef = doc(db, "users", uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            console.log("User document not found");
            return;
        }

        const data = userSnap.data();
        console.log("User Data:", data);

        // Welcome header
        const name = data.name ?? data.personalDetails?.name ?? "User";
        if (welcomeHeader) {
            welcomeHeader.textContent = `Welcome, ${name}`;
        }

        // Balance
        const balance = data.balance ?? data.accountInfo?.balance ?? 0;
        if (balanceBox) {
            balanceBox.innerHTML = "₹" + balance;
        }

        // Account Number
        const accountNumber = data.accountNumber ?? data.bankDetails?.accountNumber ?? "Not Generated";
        if (accountNumberBox) {
            accountNumberBox.innerHTML = accountNumber;
        }

        // Customer ID
        let customerId = data.customerId ?? data.bankDetails?.customerId ?? "";
        if (typeof customerId === "string") {
            const cleanCust = customerId.trim().toLowerCase();
            if (!cleanCust || cleanCust === "not available" || cleanCust === "n/a" || cleanCust === "null" || cleanCust === "undefined") {
                customerId = "CUST" + uid.substring(0, 8).toUpperCase();
            }
        } else if (!customerId) {
            customerId = "CUST" + uid.substring(0, 8).toUpperCase();
        }
        if (customerIdBox) {
            customerIdBox.innerHTML = customerId;
        }

        // IFSC
        let ifsc = data.ifscCode ?? data.bankDetails?.ifscCode ?? data.ifsc ?? "";
        if (typeof ifsc === "string") {
            const cleanIfsc = ifsc.trim().toLowerCase();
            if (!cleanIfsc || cleanIfsc === "not available" || cleanIfsc === "n/a" || cleanIfsc === "null" || cleanIfsc === "undefined") {
                ifsc = "SBIN0001234";
            }
        } else if (!ifsc) {
            ifsc = "SBIN0001234";
        }
        if (ifscBox) {
            ifscBox.innerHTML = ifsc;
        }

        // Branch
        let branch = data.branch ?? data.bankDetails?.branch ?? "";
        if (typeof branch === "string") {
            const cleanBranch = branch.trim().toLowerCase();
            if (!cleanBranch || cleanBranch === "not available" || cleanBranch === "n/a" || cleanBranch === "null" || cleanBranch === "undefined") {
                branch = "Main Branch";
            }
        } else if (!branch) {
            branch = "Main Branch";
        }
        if (branchBox) {
            branchBox.innerHTML = branch;
        }

    } catch (error) {
        console.error("User Loading Error:", error);
    }
}

async function loadRecentTransactions(uid) {
    try {
        if (!recentTransactionsBox) return;

        const q = query(
            collection(db, "transactions"),
            where("uid", "==", uid),
            orderBy("createdAt", "desc"),
            limit(5)
        );

        const querySnapshot = await getDocs(q);
        recentTransactionsBox.innerHTML = "";

        if (querySnapshot.empty) {
            recentTransactionsBox.innerHTML = "<p>No recent transactions</p>";
            return;
        }

        querySnapshot.forEach((doc) => {
            const txn = doc.data();
            let css = (txn.type === "Deposit" || txn.type === "Transfer (Received)") ? "deposit" : "withdraw";
            let dateStr = txn.createdAt ? txn.createdAt.toDate().toLocaleString() : "No Date";
            
            recentTransactionsBox.innerHTML += `
                <div class="transaction-card ${css}">
                    <h4>${txn.type}</h4>
                    <p>Amount: ₹${txn.amount}</p>
                    <p>Balance: ₹${txn.newBalance ?? txn.balance}</p>
                    <p>Date: ${dateStr}</p>
                </div>
            `;
        });
    } catch (error) {
        console.error("Error loading recent transactions:", error);
        recentTransactionsBox.innerHTML = "<p>Error loading transactions</p>";
    }
}

if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
        await signOut(auth);
        window.location.href = "login.html";
    });
}