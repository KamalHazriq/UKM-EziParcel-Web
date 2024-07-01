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
  orderBy 
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
  onAuthStateChanged(auth, (user) => {
    if (user) {
      const email = user.email;
      const username = email.split("@")[0];
      const capitalizedUsername = username.toUpperCase();
      const stafID = document.getElementById("stafID");
      stafID.textContent = capitalizedUsername;
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
