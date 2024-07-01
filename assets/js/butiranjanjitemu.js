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
  query,
  where,
  getDocs,
  collection,
  updateDoc,
  deleteDoc
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
  onAuthStateChanged(auth, (user) => {
    if (user) {
      const email = user.email;
      const username = email.split("@")[0];
      const capitalizedUsername = username.toUpperCase();
      const stafID = document.getElementById("stafID");
      stafID.textContent = capitalizedUsername;
      // Fetch and display bungkusan data
      fetchBungkusanDetails();
    }
  });

  // Function to fetch bungkusan details based on ID
  const fetchBungkusanDetails = async () => {
    try {
      // Fetch janjitemu ID from URL query parameter
      const urlParams = new URLSearchParams(window.location.search);
      const janjitemuID = urlParams.get("id");
      
      if (!janjitemuID) {
        throw new Error("No janjitemu ID provided in URL.");
      }

      console.log("Fetching details for janjitemu ID:", janjitemuID);

      // Fetch janjitemu data
      const janjitemuDoc = doc(db, "janjitemu", janjitemuID);
      const janjitemuSnapshot = await getDoc(janjitemuDoc);
      if (janjitemuSnapshot.exists()) {
        const janjitemuData = janjitemuSnapshot.data();
        console.log("Fetched janjitemu data:", janjitemuData);

        // Get the bungkusanID from the janjitemu data
        const bungkusanID = janjitemuData.bungkusanID;
        console.log("Bungkusan ID:", bungkusanID);

        // Query the bungkusan collection for the document with the specified bungkusanID
        const bungkusanQuery = query(collection(db, "bungkusan"), where("bungkusanID", "==", bungkusanID));
        const bungkusanSnapshot = await getDocs(bungkusanQuery);
        if (!bungkusanSnapshot.empty) {
          const bungkusanDoc = bungkusanSnapshot.docs[0]; // Get the document reference
          const bungkusanData = bungkusanDoc.data();
          console.log("Fetched bungkusan data:", bungkusanData);

          // Populate the details HTML element with bungkusan data
          document.getElementById("noPengesananValue").textContent = bungkusanData.no_pengesanan || "N/A";
          document.getElementById("namaBungkusanValue").textContent = bungkusanData.nama_bungkusan || "N/A";
          document.getElementById("lokasiValue").textContent = bungkusanData.lokasi_bungkusan || "N/A";
          document.getElementById("idBungkusanValue").textContent = bungkusanData.bungkusanID || "N/A";

          // Use the image URL from the bungkusan data
          const imageUrl = bungkusanData.gambar_bungkusan;
          const bungkusanImage = document.getElementById("bungkusanImage");
          if (imageUrl) {
            bungkusanImage.src = imageUrl;
          } else {
            bungkusanImage.alt = "No image available";
          }

          // Populate the janjitemu details
          document.getElementById("masaValue").textContent = janjitemuData.masa_jt || "N/A";
          document.getElementById("wakilValue").textContent = janjitemuData.wakil_jt || "N/A";

          // Add event listener to the "SUDAH DIAMBIL!" button
          const sudahButton = document.getElementById("sudahbutton");
          sudahButton.addEventListener("click", async () => {
            try {
              // Update the status_bungkusan field to "Sudah Diambil"
              const bungkusanDocRef = doc(db, "bungkusan", bungkusanDoc.id);
              await updateDoc(bungkusanDocRef, {
                status_bungkusan: "Sudah Diambil"
              });
              alert("Janji temu sudah lengkap!'");
              
              // Delete the janjitemu document
              await deleteDoc(doc(db, "janjitemu", janjitemuID));
              
              // Redirect to janjitemu.html
              window.location.href = "janjitemu.html";
            } catch (error) {
              console.error("Error updating status_bungkusan or deleting janji temu:", error);
            }
          });
        } else {
          console.error("Bungkusan not found");
        }
      } else {
        console.error("Janji Temu not found");
      }
    } catch (error) {
      console.error("Error fetching details:", error);
    }
  };
});

// Function to add 'active' class to the selected menu item
const activeMenuNumber = "4";

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
