// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import {
  getAuth,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";

import { 
  getFirestore, 
  collection, 
  getDocs,
  query,
  orderBy,
} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCUP1GicCdH32LxTw692YwZbCJlsCwTvRs",
  authDomain: "ukm-eziparcel-c71bc.firebaseapp.com",
  projectId: "ukm-eziparcel-c71bc",
  storageBucket: "ukm-eziparcel-c71bc.appspot.com",
  messagingSenderId: "409550515516",
  appId: "1:409550515516:web:b47a453305b80f69028239",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Export auth object and signOut function
export const auth = getAuth();
export { signOut };

// Wait for the DOM to fully load
document.addEventListener("DOMContentLoaded", async () => {

  // Check if user is signed in
 onAuthStateChanged(auth, (user) => {
  if (user) {
    const email = user.email;
    const username = email.split("@")[0];
    const capitalizedUsername = username.toUpperCase();
    const stafID = document.getElementById("stafID");
    stafID.textContent = capitalizedUsername;
    
  }
});

  // Function to perform search
  const performSearch = async () => {
    const searchText = document.getElementById("searchInput").value.toLowerCase();
    const pengumumanContainer = document.querySelector(".cardBox");

    try {
      // Clear previous search results
      pengumumanContainer.innerHTML = '';

      // Retrieve pengumuman data from Firestore
      const q = query(collection(db, "pengumuman"), orderBy("masa", "desc"));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        const pengumumanData = doc.data();
        const title = pengumumanData.tajuk.toLowerCase();

        if (title.includes(searchText)) {
          // Display only the announcements that match the search text
          const card = document.createElement("div");
          card.classList.add("card");
          const timestamp = pengumumanData.masa ? pengumumanData.masa.toDate().toLocaleString() : "Unknown";
          card.innerHTML = `
            <div>
              <div class="numbers">${pengumumanData.tajuk}</div>
              <div class="author">${pengumumanData.author}</div>
              <div class="timestamp">${timestamp}</div>
              <div class="isi">${pengumumanData.isi}</div>
            </div>
          `;
          pengumumanContainer.appendChild(card);
        }
      });
    } catch (error) {
      console.error("Error retrieving pengumuman: ", error);
    }
  };

  // Add event listener for search input
  document.getElementById("searchInput").addEventListener("input", performSearch);

  // Get the sign out button
  const signOutButton = document.getElementById("signOut");

  // Check if the sign out button exists
  if (signOutButton) {
    // Add click event listener to the sign out button
    signOutButton.addEventListener("click", (event) => {
      event.preventDefault();

      // Sign out the user
      signOut(auth)
        .then(() => {
          // Redirect to index.html upon successful sign out
          alert("Log Keluar...");
          window.location.href = "index.html";
        })
        .catch((error) => {
          // Display error message
          console.error("Error signing out:", error);
        });
    });
  }

  // Function to retrieve pengumuman data from Firestore and display it
  const displayPengumuman = async () => {
    const pengumumanContainer = document.querySelector(".cardBox");

    try {
      // Retrieve pengumuman data from Firestore
      const q = query(collection(db, "pengumuman"), orderBy("masa", "desc"));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        const pengumumanData = doc.data();
        const card = document.createElement("div");
        card.classList.add("card");
        const timestamp = pengumumanData.masa ? pengumumanData.masa.toDate().toLocaleString() : "Unknown";
        card.innerHTML = `
          <div>
            <div class="numbers">${pengumumanData.tajuk}</div>
            <div class="author">${pengumumanData.author}</div>
            <div class="timestamp">${timestamp}</div>
            <div class="isi">${pengumumanData.isi}</div>
          </div>
        `;
        pengumumanContainer.appendChild(card);
      });
    } catch (error) {
      console.error("Error retrieving pengumuman: ", error);
    }
  };

  // Call the function to display pengumuman
  displayPengumuman();

});

// Function to add 'active' class to the selected menu item
const activeMenuNumber = "5";

function setActiveMenuItem() {
  const menuItem = document.getElementById(`menu-item-${activeMenuNumber}`);
  if (menuItem) {
    menuItem.classList.add('active');
  }
}

// Function to remove 'active' class from the active menu item
function removeActiveMenuItem() {
  const activeMenuItem = document.querySelector('.navigation ul li.active');
  if (activeMenuItem) {
    activeMenuItem.classList.remove('active');
  }
}

// Add 'active' class to the selected menu item initially
setActiveMenuItem();

// Function to handle mouseover and remove 'active' class from other items
function handleMouseOver() {
  const allMenuItems = document.querySelectorAll('.navigation ul li');
  allMenuItems.forEach(item => {
    if (item.id !== `menu-item-${activeMenuNumber}`) {
      item.classList.remove('active');
    }
  });

  // Add 'active' class back to the initially selected menu item
  setActiveMenuItem();
}

// Event listeners for mouseover and mouseleave
const menuItems = document.querySelectorAll('.navigation ul li');
menuItems.forEach(item => {
  item.addEventListener('mouseover', () => {
    removeActiveMenuItem();
  });
});

document.querySelector('.navigation').addEventListener('mouseleave', () => {
  setActiveMenuItem();
});





// Menu Toggle
let toggle = document.querySelector(".toggle");
let navigation = document.querySelector(".navigation");
let main = document.querySelector(".main");

toggle.onclick = function () {
  navigation.classList.toggle("active");
  main.classList.toggle("active");
};
