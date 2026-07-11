import { auth, db } from "./firebase.js";

import {
    collection,
    query,
    where,
    orderBy,
    limit,
    getDocs
}
from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";


const recentDiv = document.getElementById("recentTransactions");


auth.onAuthStateChanged(async(user)=>{


    if(!user){

        recentDiv.innerHTML = "Please login";

        return;

    }


    console.log("Dashboard UID:", user.uid);


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
            ),

            limit(5)

        );



        const snapshot = await getDocs(q);



        console.log(
            "Recent count:",
            snapshot.size
        );



        recentDiv.innerHTML="";



        if(snapshot.empty){

            recentDiv.innerHTML =
            "<p>No recent transactions</p>";

            return;

        }



        snapshot.forEach((doc)=>{


            const data = doc.data();



            recentDiv.innerHTML += `

            <div class="transaction-card">

                <h4>${data.type}</h4>

                <p>
                Amount: ₹${data.amount}
                </p>

                <p>
                Balance: ₹${data.balance}
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

        recentDiv.innerHTML = error.message;

    }


});