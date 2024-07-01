import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import {
  getAuth,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
import {
  getFirestore,
  collection,
  getDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  query,
  where,
  doc,
} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";

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

 // Function to fetch and update shop status
 const fetchShopStatus = async () => {
  try {
    const shopStatusRef = doc(db, "statusoperasi", "SO1");
    const docSnap = await getDoc(shopStatusRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      const masabuka = data.masabuka;
      const masatutup = data.masatutup;
      

      // Calculate and display Masa Operasi
      const [bukaHours, bukaMinutes] = masabuka.split(":");
      const [tutupHours, tutupMinutes] = masatutup.split(":");
      const bukaTime = new Date(0, 0, 0, bukaHours, bukaMinutes);
      const tutupTime = new Date(0, 0, 0, tutupHours, tutupMinutes);
      const masaBuka = bukaTime.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      const masaTutup = tutupTime.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      

      // Determine current status
      const currentTime = new Date();
      const currentHours = currentTime.getHours();
      const currentMinutes = currentTime.getMinutes();

      const bukaTimeMinutes = parseInt(bukaHours) * 60 + parseInt(bukaMinutes);
      const tutupTimeMinutes = parseInt(tutupHours) * 60 + parseInt(tutupMinutes);
      const currentTimeMinutes = currentHours * 60 + currentMinutes;
      
      if ( currentTimeMinutes >= bukaTimeMinutes && currentTimeMinutes <= tutupTimeMinutes) {

        await updateDoc(shopStatusRef, { status: true });
        console.log("Status updated to open.");
      } else {

        await updateDoc(shopStatusRef, { status: false });
        console.log("Status updated to close.");

        //DELETE
        await deletePastSlots();
      }
    }
  } catch (error) {
    console.error("Error retrieving shop status:", error);
  }
};

// Fetch and update the shop status initially and then every 15 seconds
fetchShopStatus();
setInterval(fetchShopStatus, 15000); // Update status every 15 seconds

// Function to delete past slots
const deletePastSlots = async () => {
  try {
    const janjitemuCollection = collection(db, "janjitemu");
    const slotjtCollection = collection(db, "slot_jt");

    const janjitemuSnapshot = await getDocs(janjitemuCollection);
    const slotjtSnapshot = await getDocs(slotjtCollection);

    // Delete documents in janjitemu collection
    janjitemuSnapshot.forEach(async (doc) => {
      const bungkusanID = doc.data().bungkusanID;
      // Update bungkusan status to "Sedia Diambil" based on bungkusanID
      await updateBungkusanStatus(bungkusanID);
      // Delete janjitemu document
      await deleteDoc(doc.ref);
    });

    // Delete documents in slot_jt collection
    slotjtSnapshot.forEach(async (doc) => {
      await deleteDoc(doc.ref);
    });

    console.log("Deleted past slots in janjitemu and slot_jt collections.");
  } catch (error) {
    console.error("Error deleting past slots:", error);
  }
};

// Function to update bungkusan status to "Sedia Diambil"
const updateBungkusanStatus = async (bungkusanID) => {
try {
   // Query to find bungkusan document with matching bungkusanID
  const bungkusanQuery = query(
    collection(db, "bungkusan"),
    where("bungkusanID", "==", bungkusanID)
  );
  
  const bungkusanSnapshot = await getDocs(bungkusanQuery);

   // If matching document found, update its status to "Sedia Diambil"
   if (!bungkusanSnapshot.empty) {
    const bungkusanDoc = bungkusanSnapshot.docs[0];
    const bungkusanDocRef = doc(db, "bungkusan", bungkusanDoc.id);

    await updateDoc(bungkusanDocRef, {
      status_bungkusan: "Sedia Diambil",
    });

    console.log(`Updated bungkusan status to "Sedia Diambil" for ID ${bungkusanID}.`);
  } else {
    console.error(`No bungkusan found with ID ${bungkusanID}`);
  }
} catch (error) {
  console.error("Error updating bungkusan status:", error);
}
};

  
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
