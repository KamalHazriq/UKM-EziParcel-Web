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
  setDoc,
  serverTimestamp,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  deleteDoc
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
    }
  });

  // Get the sign out button
  const signOutButton = document.getElementById("signOut");

  if (signOutButton) {
    signOutButton.addEventListener("click", (event) => {
      event.preventDefault();
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

  // Function to populate time dropdowns
  const populateTimeDropdown = (dropdown, currentTime) => {
    const [currentHour, currentMinute] = currentTime.split(":").map(Number);

    for (let hour = currentHour; hour < 24; hour++) {
      const hourStr = hour.toString().padStart(2, '0');
      for (let minute of ["00", "30"]) {
        const minuteNum = parseInt(minute, 10);
        if (hour > currentHour || (hour === currentHour && minuteNum >= currentMinute)) {
          const timeStr = `${hourStr}:${minute}`;
          dropdown.innerHTML += `<option value="${timeStr}">${timeStr}</option>`;
        }
      }
    }
    // Add "00:00" option for the end of the day
    if (dropdown.id === "closeTime") {
      dropdown.innerHTML += `<option value="00:00">00:00</option>`;
    }
  };

  // Function to update "MASA TUTUP" dropdown based on "MASA BUKA" selection
  const updateCloseTimeDropdown = (openTimeValue) => {
    const closeTimeDropdown = document.getElementById("closeTime");
    closeTimeDropdown.innerHTML = ""; // Clear existing options

    const [selectedHour, selectedMinute] = openTimeValue.split(":").map(Number);
    for (let hour = selectedHour; hour < 24; hour++) {
      const hourStr = hour.toString().padStart(2, '0');
      for (let minute of ["00", "30"]) {
        const minuteNum = parseInt(minute, 10);
        if (hour > selectedHour || (hour === selectedHour && minuteNum > selectedMinute)) {
          const timeStr = `${hourStr}:${minute}`;
          closeTimeDropdown.innerHTML += `<option value="${timeStr}">${timeStr}</option>`;
        }
      }
    }
    // Add "00:00" option for the end of the day
    closeTimeDropdown.innerHTML += `<option value="00:00">00:00</option>`;
  };

  // Get the current time
  const now = new Date();
  const currentTime = now.getMinutes() < 30 ? `${now.getHours().toString().padStart(2, '0')}:00` : `${now.getHours().toString().padStart(2, '0')}:30`;

  // Populate the "MASA BUKA" dropdown
  populateTimeDropdown(document.getElementById("openTime"), currentTime);

  // Populate the "MASA TUTUP" dropdown initially based on current time
  populateTimeDropdown(document.getElementById("closeTime"), currentTime);

  // Event listener for "MASA BUKA" dropdown change
  const openTimeDropdown = document.getElementById("openTime");
  openTimeDropdown.addEventListener("change", () => {
    const selectedOpenTime = openTimeDropdown.value;
    updateCloseTimeDropdown(selectedOpenTime);

    
  });

  const updateShopHours = async (openTime, closeTime, slots) => {
    const currentDate = new Date();
    const timestamp = serverTimestamp();
    

    const data = {
      staf: `${globalStafId} ${globalCapitalizedName}`,
      tarikh: currentDate.toDateString(),
      masabuka: openTime,
      masatutup: closeTime,
      updated_at: timestamp,
    };

    try {
      const shopStatusRef = doc(db, "statusoperasi", "SO1");
      await setDoc(shopStatusRef, data, { merge: true });
      await deletePastSlots();
      alert("Status Operasi berjaya kemas kini!");
      console.log("Status Operasi berjaya kemas kini!");
      
       await generateTimeSlots(openTime, closeTime, slots);
       
       window.location.href = "statusoperasi.html";
      
    } catch (error) {
      console.error("Error updating shop hours:", error);
    }
  };

  // Function to generate time slots and save to Firestore
  const generateTimeSlots = async (openTime, closeTime, slots) => {
    const [openHour, openMinute] = openTime.split(":").map(Number);
    const [closeHour, closeMinute] = closeTime.split(":").map(Number);

    const slotsCollection = collection(db, "slot_jt");

    let currentHour = openHour;
    let currentMinute = openMinute + 15;

    if (currentMinute >= 60) {
      currentHour += 1;
      currentMinute = 0;
    }

    while (currentHour < closeHour || (currentHour === closeHour && currentMinute < closeMinute)) {
      const slotTime = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
      const slotData = {
        tarikh: new Date().toDateString(),
        waktu: slotTime,
        created_at: serverTimestamp(),
        slots: Array(slots).fill({ status: "kosong" }),
      };

      try {
        await addDoc(slotsCollection, slotData);
      } catch (error) {
        console.error("Error creating time slot:", error);
      }

      currentMinute += 15;
      if (currentMinute >= 60) {
        currentHour += 1;
        currentMinute = 0;
      }
    }
    
  };


 // Function to delete past slots
const deletePastSlots = async () => {
  try {
    const slotjtCollection = collection(db, "slot_jt");
    const slotjtSnapshot = await getDocs(slotjtCollection);

    const deletePromises = slotjtSnapshot.docs.map(async (doc) => {
      await deleteDoc(doc.ref);
    });

    await Promise.all(deletePromises);

    console.log("Deleted past slots in slot_jt collection.");
  } catch (error) {
    console.error("Error deleting past slots:", error);
  }
};


  // Function to handle button click event
  const updateStatusButton = document.getElementById("updateStatusBtn");
  if (updateStatusButton) {
    updateStatusButton.addEventListener("click", () => {
      const openTime = document.getElementById("openTime").value;
      const closeTime = document.getElementById("closeTime").value;
      const slots = parseInt(document.getElementById("slot").value, 10);

      if (!openTime || !closeTime || isNaN(slots)) {
        alert("Sila masukkan masa buka , masa tutup dan bilangan slot!");
        return;
      }

      updateShopHours(openTime, closeTime,slots);
    });
  }
});

// Function to add 'active' class to the selected menu item
const activeMenuNumber = "3";

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
