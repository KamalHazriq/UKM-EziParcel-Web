// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import {
  getAuth,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
import { 
  getFirestore, 
  doc, 
  getDoc, 
  updateDoc, 
  serverTimestamp,
  where,
  query,
  collection,
  getDocs,  
} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL
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

let globalStafId = "";
let globalCapitalizedName = "";

// Wait for the DOM to fully load
document.addEventListener("DOMContentLoaded", () => {

  // Check if user is signed in
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      const email = user.email;
  
        const stafQuery = query(collection(db, "staf"), where("emel", "==", email));
        const querySnapshot = await getDocs(stafQuery);
  
        if (!querySnapshot.empty) {
          const stafData = querySnapshot.docs[0].data();
          const name = stafData.nama;
          globalStafId = stafData.staf_id;
          globalCapitalizedName = name.toUpperCase();
  
          // Update the HTML elements
          document.getElementById("nama").textContent = globalCapitalizedName;
          document.getElementById("stafID").textContent = globalStafId;
        }

    // Fetch and populate existing bungkusan data
    fetchBungkusanDetails();

    // Handle form submission
    const submitButton = document.getElementById("subbtn");
    submitButton.addEventListener("click", async (event) => {
      event.preventDefault();
      await updateBungkusan();
    });
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

  // Get the back button
  const backButton = document.querySelector(".back-button");

  if (backButton) {
    backButton.addEventListener("click", (event) => {
      event.preventDefault();
      window.history.back(); // Go back to the previous page
    });
  }


});

// Function to fetch and populate existing bungkusan details based on ID
const fetchBungkusanDetails = async () => {
  try {
    // Fetch bungkusan ID from URL query parameter
    const urlParams = new URLSearchParams(window.location.search);
    const bungkusanID = urlParams.get("id");

    const bungkusanDoc = doc(db, "bungkusan", bungkusanID);
    const bungkusanSnapshot = await getDoc(bungkusanDoc);
    if (bungkusanSnapshot.exists()) {
      const bungkusanData = bungkusanSnapshot.data();

      // Populate the details HTML element with bungkusan data
      document.getElementById("no_pengesanan").value = bungkusanData.no_pengesanan;
      document.getElementById("nama_bungkusan").value = bungkusanData.nama_bungkusan;
      document.getElementById("status_bungkusan").value = bungkusanData.status_bungkusan;
      document.getElementById("lokasi_bungkusan").value = bungkusanData.lokasi_bungkusan;
      document.getElementById("gambar_bungkusan").src = bungkusanData.gambar_bungkusan;
    } else {
      console.error("Bungkusan not found");
    }
  } catch (error) {
    console.error("Error fetching bungkusan details: ", error);
  }
};

// Function to update the existing bungkusan
const updateBungkusan = async () => {
  const noPengesanan = document.getElementById("no_pengesanan").value.trim();
  const namaBungkusan = document.getElementById("nama_bungkusan").value.trim();
  const statusBungkusan = document.getElementById("status_bungkusan").value.trim();
  const lokasiBungkusan = document.getElementById("lokasi_bungkusan").value.trim();
  const gambarBungkusan = document.getElementById("gambar_bungkusan").files[0];
  const urlParams = new URLSearchParams(window.location.search);
  const bungkusanID = urlParams.get("id");

  // Check if any field is empty
  if (!noPengesanan || !namaBungkusan || !statusBungkusan || !lokasiBungkusan) {
    alert("Sila isi semua maklumat dahulu.");
    return; // Stop further execution
  }

  try {
    const bungkusanDoc = doc(db, "bungkusan", bungkusanID);
    const bungkusanData = {
      staf: `${globalStafId} ${globalCapitalizedName}`,
      no_pengesanan: noPengesanan,
      nama_bungkusan: namaBungkusan,
      status_bungkusan: statusBungkusan,
      lokasi_bungkusan: lokasiBungkusan,
      masa_rekod: serverTimestamp()
    };

    // Check if a new image is uploaded
    if (gambarBungkusan) {
      // Upload new image to Firebase Storage
      const storageRef = ref(storage, `bungkusan/${bungkusanID}`);
      await uploadBytes(storageRef, gambarBungkusan);
      const gambarURL = await getDownloadURL(storageRef);
      bungkusanData.gambar_bungkusan = gambarURL;
    }

    // Update the bungkusan in Firestore
    await updateDoc(bungkusanDoc, bungkusanData);

    alert("Bungkusan berjaya dikemas kini.");
    window.location.href = "bungkusan.html";
  } catch (error) {
    console.error("Error updating bungkusan: ", error);
  }
};

// Function to add 'active' class to the selected menu item
const activeMenuNumber = "2";

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
