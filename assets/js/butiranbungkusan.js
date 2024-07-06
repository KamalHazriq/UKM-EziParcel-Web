// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import {
  getAuth,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  where,
  query,
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";
import {
  getStorage,
  ref,
  getDownloadURL,
} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-storage.js";

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
const db = getFirestore(app);
const storage = getStorage(app);

// Export auth object and signOut function
export const auth = getAuth();
export { signOut };

// Wait for the DOM to fully load
document.addEventListener("DOMContentLoaded", () => {
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

  // Check if user is signed in
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      const email = user.email;
  
        const stafQuery = query(collection(db, "staf"), where("emel", "==", email));
        const querySnapshot = await getDocs(stafQuery);
  
        if (!querySnapshot.empty) {
          const stafData = querySnapshot.docs[0].data();
          const name = stafData.nama;
          const stafId = stafData.staf_id;
          const capitalizedName = name.toUpperCase();
  
          // Update the HTML elements
          document.getElementById("nama").textContent = capitalizedName;
          document.getElementById("stafID").textContent = stafId;
        }
      // Fetch and display bungkusan data
      fetchBungkusanDetails();
    }
  });

  // Function to fetch bungkusan details based on ID
  const fetchBungkusanDetails = async () => {
    try {
      // Fetch bungkusan ID from URL query parameter
      const urlParams = new URLSearchParams(window.location.search);
      const bungkusanID = urlParams.get("id");

      const bungkusanDoc = doc(db, "bungkusan", bungkusanID);
      const bungkusanSnapshot = await getDoc(bungkusanDoc);
      if (bungkusanSnapshot.exists()) {
        const bungkusanData = bungkusanSnapshot.data();
        console.log("Fetched bungkusan data:", bungkusanData);

        // Extract date and time from timestamp
        let date = "N/A";
        let time = "N/A";
        if (bungkusanData.masa_rekod) {
          const timestamp = bungkusanData.masa_rekod.toDate();
          date = timestamp.toLocaleDateString();
          time = timestamp.toLocaleTimeString();
        } else {
          console.log("Timestamp is not defined");
        }

        // Populate the details HTML element with bungkusan data
        document.getElementById("noPengesananValue").textContent =
          bungkusanData.no_pengesanan;
        document.getElementById("namaBungkusanValue").textContent =
          bungkusanData.nama_bungkusan;
        document.getElementById("statusValue").textContent =
          bungkusanData.status_bungkusan;
        document.getElementById("lokasiValue").textContent =
          bungkusanData.lokasi_bungkusan;
        document.getElementById("idBungkusanValue").textContent =
          bungkusanData.bungkusanID;
        document.getElementById("idStafValue").textContent =
          bungkusanData.staf;
        document.getElementById("tarikhValue").textContent = date;
        document.getElementById("masaValue").textContent = time;

        // Use the image URL from the bungkusan data
        const imageUrl = bungkusanData.gambar_bungkusan;
        const bungkusanImage = document.getElementById("bungkusanImage");
        bungkusanImage.src = imageUrl;


        // Add click event listener to the "KEMASKINI" button
        const kemaskiniButton = document.getElementById("kemaskinibutton");
        kemaskiniButton.addEventListener("click", () => {
          kemaskiniDetails(bungkusanID);
        });
        
        // Function to update details
        window.kemaskiniDetails = (id) => {
          window.location.href = `kemaskinibungkusan.html?id=${id}`;
        };
      } else {
        console.error("Bungkusan not found");
      }
    } catch (error) {
      console.error("Error fetching bungkusan details: ", error);
    }
  };
});

// Function to add 'active' class to the selected menu item
const activeMenuNumber = "2";

function setActiveMenuItem() {
  const menuItem = document.getElementById(`menu-item-${activeMenuNumber}`);
  if (menuItem) {
    menuItem.classList.add("active");
  }
}

// Function to remove 'active' class from the active menu item
function removeActiveMenuItem() {
  const activeMenuItem = document.querySelector(".navigation ul li.active");
  if (activeMenuItem) {
    activeMenuItem.classList.remove("active");
  }
}

// Add 'active' class to the selected menu item initially
setActiveMenuItem();

// Function to handle mouseover and remove 'active' class from other items
function handleMouseOver() {
  const allMenuItems = document.querySelectorAll(".navigation ul li");
  allMenuItems.forEach((item) => {
    if (item.id !== `menu-item-${activeMenuNumber}`) {
      item.classList.remove("active");
    }
  });

  // Add 'active' class back to the initially selected menu item
  setActiveMenuItem();
}

// Event listeners for mouseover and mouseleave
const menuItems = document.querySelectorAll(".navigation ul li");
menuItems.forEach((item) => {
  item.addEventListener("mouseover", () => {
    removeActiveMenuItem();
  });
});

document.querySelector(".navigation").addEventListener("mouseleave", () => {
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
