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
  doc,
  getDoc,
  deleteDoc,
  updateDoc,
  where
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
      fetchBungkusanData();
    }
  });

  

  // Get the search input element
  const searchInput = document.getElementById("searchInput");
    
  // Add event listener for input event on search input
  searchInput.addEventListener("input", () => {
      const searchText = searchInput.value.trim().toLowerCase();
      filterTableRows(searchText);
  });


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

// Function to fetch bungkusan data from Firestore in ascending order of bungkusanID
const fetchBungkusanData = async () => {
  try {
    const querySnapshot = await getDocs(query(
      collection(db, "bungkusan"),
      orderBy("status_bungkusan", "asc"),
      orderBy("bungkusanID", "asc")
    ));
    const tableBody = document.querySelector("table tbody");
    tableBody.innerHTML = ""; // Clear existing data

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const row = document.createElement("tr");

      row.innerHTML = `
        <td>${data.bungkusanID}</td>
        <td>${data.no_pengesanan}</td>
        <td>${data.nama_bungkusan}</td>
        <td><span class="status ${getStatusClass(data.status_bungkusan)}">${data.status_bungkusan}</span></td>
        <td>${data.lokasi_bungkusan}</td>
        <td class="btn"><button onclick="viewDetails('${doc.id}')">Butiran</button></td>
      `;

      tableBody.appendChild(row);
    });
  } catch (error) {
    console.error("Error fetching bungkusan data: ", error);
  }


};

// Function to get status class
const getStatusClass = (status) => {
  switch (status) {
    case "Sudah Diambil":
      return "delivered";
    case "Sedia Diambil":
      return "pending";
    case "Sila Ambil":
      return "return";
    default:
      return "";
  }
};

// Function to view details (you can expand this function as needed)
window.viewDetails = (id) => {
  window.location.href = `butiranbungkusan.html?id=${id}`;
};

// Function to filter table rows based on search text
const filterTableRows = (searchText) => {
  const tableRows = document.querySelectorAll("table tbody tr");
    
  tableRows.forEach((row) => {
    const id = row.cells[0].textContent.trim().toLowerCase();
    const noPengesanan = row.cells[1].textContent.trim().toLowerCase();
    const nama = row.cells[2].textContent.trim().toLowerCase();
        
    if (id.includes(searchText) || noPengesanan.includes(searchText) || nama.includes(searchText)) {
      row.style.display = "table-row";
    } else {
      row.style.display = "none";
    }
  });
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
