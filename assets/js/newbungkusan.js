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
  serverTimestamp,
  where  
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
        const stafId = stafData.staf_id;
        const capitalizedName = name.toUpperCase();

        // Update the HTML elements
        document.getElementById("nama").textContent = capitalizedName;
        document.getElementById("stafID").textContent = stafId;

        // Handle form submission
        const submitButton = document.getElementById("subbtn");
        submitButton.addEventListener("click", async (event) => {
          event.preventDefault();
          await addBungkusan(stafId, capitalizedName);
        });
      }
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
    const querySnapshot = await getDocs(query(collection(db, "bungkusan"), orderBy("bungkusanID", "desc"), limit(1)));
    querySnapshot.forEach((doc) => {
      latestId = doc.data().bungkusanID;
    });
  } catch (error) {
    console.error("Error retrieving latest ID: ", error);
  }
};

// Function to generate the next ID in the format "Bxxxx"
const generateNextId = () => {
  if (!latestId) {
    latestId = "B0000"; // Set initial ID if it's the first entry
  }
  // Extract the numeric part of the ID and increment by 1
  const numericPart = parseInt(latestId.slice(1), 10) + 1;
  // Format the numeric part with leading zeros
  const nextId = "B" + numericPart.toString().padStart(4, "0");
  latestId = nextId; // Update latestId variable
  return nextId;
};

// Tambah bungkusan ke pangkalan data
const addBungkusan = async (stafId, capitalizedName) => {
  const noPengesanan = document.getElementById("no_pengesanan").value.trim().toUpperCase();
  const namaBungkusan = document.getElementById("nama_bungkusan").value.trim().toUpperCase();
  const statusBungkusan = document.getElementById("status_bungkusan").value.trim();
  const lokasiBungkusan = document.getElementById("lokasi_bungkusan").value.trim().toUpperCase();
  const gambarBungkusan = document.getElementById("gambar_bungkusan").files[0];

  // Check if any field is empty
  if (!noPengesanan || !namaBungkusan || !statusBungkusan || !lokasiBungkusan || !gambarBungkusan) {
    alert("Sila isi semua maklumat dahulu.");
    return; // Stop further execution
  }

  try {
    await getLatestId();
    // Jana ID Baru
    const newId = generateNextId();

    // Muat Naik gambar bungkusan ke pangkalan data
    const storageRef = ref(storage, `bungkusan/${newId}`);
    await uploadBytes(storageRef, gambarBungkusan);
    const gambarURL = await getDownloadURL(storageRef);

    // Tambah bungkusan ke pangkalan data
    await addDoc(collection(db, "bungkusan"), {
      bungkusanID: newId,
      staf: `${stafId} ${capitalizedName}`,
      no_pengesanan: noPengesanan,
      nama_bungkusan: namaBungkusan,
      status_bungkusan: statusBungkusan,
      lokasi_bungkusan: lokasiBungkusan,
      gambar_bungkusan: gambarURL,
      masa_rekod: serverTimestamp()
    });
    alert("Bungkusan berjaya disimpan.");
    window.location.href = "bungkusan.html";
  } catch (error) {
    console.error("Ralat Menambah Bungkusan: ", error);
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

// Back button event listener
const backButton = document.querySelector(".back-button");

if (backButton) {
  backButton.addEventListener("click", (event) => {
    event.preventDefault();
    window.history.back(); // Go back to the previous page
  });
}
