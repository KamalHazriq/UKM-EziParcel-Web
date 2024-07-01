// Import necessary Firebase SDK functions
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
  query,
  where,
  getDocs,
  collection,
  updateDoc,
  deleteDoc,
  orderBy,
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

  // Check if user is signed in
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      const email = user.email;
      const username = email.split("@")[0];
      const capitalizedUsername = username.toUpperCase();
      const stafID = document.getElementById("stafID");
      stafID.textContent = capitalizedUsername;
      
      // Fetch and display bungkusan data
      await fetchBungkusanData();
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

  // Get the search input element
  const searchInput = document.getElementById("searchInput");
    
  // Add event listener for input event on search input
  searchInput.addEventListener("input", () => {
      const searchText = searchInput.value.trim().toLowerCase();
      filterTableRows(searchText);
  });
});

// Function to fetch bungkusan data from Firestore and populate the table
const fetchBungkusanData = async () => {
  try {
    const querySnapshot = await getDocs(query(collection(db, "janjitemu"), orderBy("bungkusanID", "asc")));
    const tableBody = document.querySelector("table tbody");
    tableBody.innerHTML = ""; // Clear existing data

    querySnapshot.forEach(async (doc) => {
      const data = doc.data();
      const row = document.createElement("tr");

      row.innerHTML = `
        <td>${data.bungkusanID}</td>
        <td>${data.nama_bungkusan}</td>
        <td>${data.masa_jt}</td>
        <td>${data.wakil_jt}</td>
        <td><button class="sdh" id="sudahbutton-${data.bungkusanID}" >SUDAH DIAMBIL!</button></td>
        <td><button onclick="viewDetails('${doc.id}')">Butiran</button></td>
      `;

      tableBody.appendChild(row);

  // Add event listener to the "SUDAH DIAMBIL!" button for each row
  const sudahButton = row.querySelector(`#sudahbutton-${data.bungkusanID}`);
  sudahButton.addEventListener("click", async () => {
    try {
      // Update bungkusan document status
      await updateBungkusanStatus(data.bungkusanID);

      // Delete the janjitemu document associated with this bungkusan
      await deleteJanjitemuDocument(doc.id);

      // Redirect to janjitemu.html
      window.location.href = "janjitemu.html";
    } catch (error) {
      console.error("Error updating status_bungkusan or deleting janji temu:", error);
    }
  });

});
} catch (error) {
console.error("Error fetching bungkusan data: ", error);
}
};

// Function to update bungkusan status to "Sudah Diambil"
const updateBungkusanStatus = async (bungkusanID) => {
try {
const bungkusanQuery = query(collection(db, "bungkusan"), where("bungkusanID", "==", bungkusanID));
const bungkusanSnapshot = await getDocs(bungkusanQuery);

if (!bungkusanSnapshot.empty) {
  const bungkusanDoc = bungkusanSnapshot.docs[0];
  const bungkusanDocRef = doc(db, "bungkusan", bungkusanDoc.id);

  await updateDoc(bungkusanDocRef, {
    status_bungkusan: "Sudah Diambil"
  });

  alert("Janji temu sudah lengkap!");
} else {
  console.error(`No bungkusan found with ID ${bungkusanID}`);
}
} catch (error) {
console.error("Error updating bungkusan status:", error);
throw error; // Re-throw the error for handling upstream
}
};

// Function to delete janjitemu document
const deleteJanjitemuDocument = async (janjitemuDocId) => {
try {
const janjitemuDocRef = doc(db, "janjitemu", janjitemuDocId);
await deleteDoc(janjitemuDocRef);
} catch (error) {
console.error("Error deleting janjitemu document:", error);
throw error; // Re-throw the error for handling upstream
}
};

// Function to view details (you can expand this function as needed)
window.viewDetails = (id) => {
  window.location.href = `butiranjanjitemu.html?id=${id}`;
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

// Add 'active' class to the selected menu item initially
const activeMenuNumber = "4";
const setActiveMenuItem = () => {
  const menuItem = document.getElementById(`menu-item-${activeMenuNumber}`);
  if (menuItem) {
    menuItem.classList.add('active');
  }
};

// Remove 'active' class from the active menu item
const removeActiveMenuItem = () => {
  const activeMenuItem = document.querySelector('.navigation ul li.active');
  if (activeMenuItem) {
    activeMenuItem.classList.remove('active');
  }
};

// Event listener for mouseover and mouseleave
const handleMouseOver = () => {
  const allMenuItems = document.querySelectorAll('.navigation ul li');
  allMenuItems.forEach(item => {
    if (item.id !== `menu-item-${activeMenuNumber}`) {
      item.classList.remove('active');
    }
  });

  // Add 'active' class back to the initially selected menu item
  setActiveMenuItem();
};

// Add 'active' class to selected menu item initially
setActiveMenuItem();

// Toggle menu visibility
const toggle = document.querySelector(".toggle");
const navigation = document.querySelector(".navigation");
const main = document.querySelector(".main");

toggle.addEventListener('click', () => {
  navigation.classList.toggle("active");
  main.classList.toggle("active");
});

// Handle DOM mouseleave event
document.querySelector('.navigation').addEventListener('mouseleave', () => {
  setActiveMenuItem();
});
