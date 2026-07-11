import { auth, db } from "./firebase.js";


import {
    doc,
    getDoc,
    collection,
    query,
    where,
    orderBy,
    limit,
    getDocs
}
from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";


import {
    signOut
}
from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";




// HTML Elements

const balanceBox = document.getElementById("balance");

const accountNumberBox =
document.getElementById("accountNumber");

const customerIdBox =
document.getElementById("customerId");

const ifscBox =
document.getElementById("ifsc");

const branchBox =
document.getElementById("branch");

const recentDiv =
document.getElementById("recentTransactions");





// Check Login


auth.onAuthStateChanged(async(user)=>{


    if(!user){

        window.location.href="login.html";

        return;

    }



    console.log(
        "Dashboard User:",
        user.uid
    );



    loadUserData(user.uid);

    loadRecentTransactions(user.uid);



});







// Load User Details


async function loadUserData(uid){


try{


const userRef =
doc(db,"users",uid);



const userSnap =
await getDoc(userRef);



if(userSnap.exists()){


const data =
userSnap.data();



console.log(
"User Data:",
data
);



if(balanceBox)
balanceBox.innerHTML =
"₹"+(data.balance || 0);



if(accountNumberBox)
accountNumberBox.innerHTML =
data.accountNumber || "Not Generated";



if(customerIdBox)
customerIdBox.innerHTML =
data.customerId || "Not Available";



if(ifscBox)
ifscBox.innerHTML =
data.ifsc || "Not Available";



if(branchBox)
branchBox.innerHTML =
data.branch || "Not Available";



}

else{


console.log(
"User document not found"
);



}



}

catch(error){


console.log(
"User Loading Error:",
error
);



}



}










// Load Recent Transactions


async function loadRecentTransactions(uid){


try{


const q=query(


collection(db,"transactions"),


where(
"uid",
"==",
uid
),


orderBy(
"createdAt",
"desc"
),


limit(5)



);



const snapshot =
await getDocs(q);



console.log(
"Recent Transactions:",
snapshot.size
);



recentDiv.innerHTML="";



if(snapshot.empty){


recentDiv.innerHTML =
`
<p>
No Recent Transactions
</p>
`;

return;


}





snapshot.forEach((doc)=>{


const data =
doc.data();



recentDiv.innerHTML +=

`

<div class="transaction-card">


<h4>
${data.type}
</h4>


<p>
Amount:
₹${data.amount}
</p>


<p>
Balance:
₹${data.balance}
</p>


<p>
${
data.createdAt
?
data.createdAt.toDate().toLocaleString()
:
""
}
</p>


</div>


`;



});



}


catch(error){


console.log(
"Recent Transaction Error:",
error
);


recentDiv.innerHTML =
`
<p>
${error.message}
</p>
`;


}



}







// Logout


const logoutBtn =
document.getElementById("logoutBtn");



if(logoutBtn){


logoutBtn.addEventListener(
"click",
async()=>{


await signOut(auth);


window.location.href="login.html";


});



}