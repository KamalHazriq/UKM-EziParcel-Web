import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import {
  getAuth,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";

// Your web app's Firebase configuration
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
const auth = getAuth();

// Flag to determine if the user is signing out
let isSigningOut = false;

document.addEventListener("DOMContentLoaded", () => {

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

  /*const bodyElement = document.body;

  
  // Initially blur the content
  bodyElement.classList.add("blur");

  // Check if user is signed in
  onAuthStateChanged(auth, (user) => {
    if (user) {
      const email = user.email;
      const username = email.split("@")[0];
      const capitalizedUsername = username.toUpperCase();
      const stafID = document.getElementById("stafID");
      stafID.textContent = capitalizedUsername;

      // Remove blur if user is authenticated
      bodyElement.classList.remove("blur");
    } else if (!isSigningOut) {
      // Only alert if the user is not in the process of signing out
      alert("Akses tidak dibenarkan. Sila Log Masuk.");
      window.location.href = "login.html";
    }
  });
  */
  // Get the sign out button
  const signOutButton = document.getElementById("signOut");

  if (signOutButton) {
    signOutButton.addEventListener("click", (event) => {
      event.preventDefault();
      isSigningOut = true; // Set the flag to true when signing out

      signOut(auth)
        .then(() => {
          alert("Log Keluar...");
          window.location.href = "index.html";
        })
        .catch((error) => {
          console.error("Error signing out:", error);
        });
    });
  }
});



// Function to add 'active' class to the selected menu item
const activeMenuNumber = "1";

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
