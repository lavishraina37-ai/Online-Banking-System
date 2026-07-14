import { auth, db } from "./firebase.js";


import {

collection,
query,
where,
orderBy,
getDocs

}

from

"https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";



const historyDiv = 
document.getElementById("history");


const searchBox = 
document.getElementById("searchBox");



let transactions = [];





auth.onAuthStateChanged(async(user)=>{


if(!user){


historyDiv.innerHTML =

`
<div class="no-data">
Please Login First
</div>
`;


return;


}



console.log(
"Logged User UID:",
user.uid
);



try{


const q = query(


collection(db,"transactions"),


where(
"uid",
"==",
user.uid
),


orderBy(
"createdAt",
"desc"
)


);



const snapshot = await getDocs(q);



console.log(
"Transaction Count:",
snapshot.size
);



transactions=[];



snapshot.forEach((doc)=>{


transactions.push({

id:doc.id,

...doc.data()

});


});



displayTransactions(transactions);



}


catch(error){


console.error(
"History Error:",
error
);



historyDiv.innerHTML =

`
<div class="no-data">

${error.message}

</div>
`;



}



});









function displayTransactions(data){


historyDiv.innerHTML="";



if(data.length===0){


historyDiv.innerHTML =

`
<div class="no-data">
No Transactions Found
</div>
`;


return;


}




data.forEach((item)=>{



let css =

(item.type==="Deposit" || item.type==="Transfer (Received)")

?

"deposit"

:

"withdraw";




let date="No Date";



if(item.createdAt){

date =
item.createdAt
.toDate()
.toLocaleString();

}



historyDiv.innerHTML +=


`

<div class="transaction-card ${css}">


<h3>
${item.type}
</h3>


<p class="amount">

₹${item.amount}

</p>



<p>

Balance:
₹${item.balance}

</p>



<p>

Transaction ID:
${item.id}

</p>



<p class="date">

${date}

</p>


</div>


`;



});


}









// Search

if(searchBox){


searchBox.addEventListener("input",()=>{


let text =
searchBox.value.toLowerCase();



let filtered =
transactions.filter((item)=>{


return (

item.type
.toLowerCase()
.includes(text)


||

item.amount
.toString()
.includes(text)


);


});



displayTransactions(filtered);



});


}









// Filter Buttons

window.filterTransaction=function(type){



if(type==="all"){


displayTransactions(
transactions
);


return;

}



let filtered =

transactions.filter((item)=>{


if (type === "Deposit") {
    return item.type === "Deposit" || item.type === "Transfer (Received)";
}
if (type === "Withdraw") {
    return item.type === "Withdraw" || item.type === "Transfer (Sent)";
}
return item.type===type;


});



displayTransactions(filtered);



}