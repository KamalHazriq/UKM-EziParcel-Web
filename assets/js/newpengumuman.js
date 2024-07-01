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
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  limit,
  serverTimestamp  
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
});



let latestId = ""; // Variable to store the latest ID

// Function to retrieve the latest ID from Firestore
const getLatestId = async () => {
  try {
    const querySnapshot = await getDocs(query(collection(db, "pengumuman"), orderBy("id", "desc"), limit(1)));
    querySnapshot.forEach((doc) => {
      latestId = doc.data().id;
    });
  } catch (error) {
    console.error("Error retrieving latest ID: ", error);
  }
};

// Function to generate the next ID in the format "Pxxxx"
const generateNextId = () => {
  if (!latestId) {
    latestId = "P0000"; // Set initial ID if it's the first entry
  }
  // Extract the numeric part of the ID and increment by 1
  const numericPart = parseInt(latestId.slice(1), 10) + 1;
  // Format the numeric part with leading zeros
  const nextId = "P" + numericPart.toString().padStart(4, "0");
  latestId = nextId; // Update latestId variable
  return nextId;
};

// Function to add a new announcement
const addAnnouncement = async (event) => {
  event.preventDefault(); // Prevent the default form submission behavior

  const tajuk = document.getElementById("tajuk").value.trim();
  const isi = document.getElementById("isipengumuman").value.trim();

  // Check if any field is empty
  if (!tajuk || !isi) {
    alert("Sila isi semua kotak dengan nilai.");
    return; // Stop further execution
  }

  // Get the email of the currently signed-in user
  const userEmail = auth.currentUser.email;
  const username = userEmail.split("@")[0];
  const capitalizedUsername = username.toUpperCase();

  try {
    await getLatestId(); // Retrieve the latest ID from Firestore
    // Generate the new ID
    const newId = generateNextId();

    // Show alert with the success message and the new ID
    alert(`Pengumuman berjaya dibuat! \nID: ${newId}`);
    
    // Add the announcement to Firestore
    await addDoc(collection(db, "pengumuman"), {
      tajuk,
      isi,
      id: newId,
      author: capitalizedUsername,
      masa: serverTimestamp(),
    });
    console.log("Announcement added successfully!");

    // Redirect to pengumuman.html
    window.location.href = "pengumuman.html";

  } catch (error) {
    console.error("Error adding announcement: ", error);
  }
};

// Add event listener to the submit button
document.getElementById("subbtn").addEventListener("click", addAnnouncement);




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
