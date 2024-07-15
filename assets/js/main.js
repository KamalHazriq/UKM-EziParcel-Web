import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import {
  getAuth,
  signOut,
  onAuthStateChanged,
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
  Timestamp,
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
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      const email = user.email;

      const stafQuery = query(
        collection(db, "staf"),
        where("emel", "==", email)
      );
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

  // Function to get local date string in YYYY-MM-DD format
  const getLocalDateString = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

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

        const bukaTimeMinutes =
          parseInt(bukaHours) * 60 + parseInt(bukaMinutes);
        const tutupTimeMinutes =
          parseInt(tutupHours) * 60 + parseInt(tutupMinutes);
        const currentTimeMinutes = currentHours * 60 + currentMinutes;

        if (
          currentTimeMinutes >= bukaTimeMinutes &&
          currentTimeMinutes <= tutupTimeMinutes
        ) {
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

  // Function to fetch and update bungkusan status counts
  const fetchBungkusanStatusCounts = async () => {
    try {
      const bungkusanCollection = collection(db, "bungkusan");
      const today = new Date();
      console.log(today);

      const todayDateString = getLocalDateString(today); // Get local YYYY-MM-DD format
      console.log(todayDateString);

      // Function to check if masa_rekod date matches today's date
      const isToday = (masa_rekod) => {
        if (!masa_rekod) {
          return false; // If masa_rekod is undefined, return false
        }
        const date = new Date(masa_rekod.seconds * 1000); // Convert Firestore Timestamp to JavaScript Date
        const dateString = getLocalDateString(date);
        console.log(dateString);
        return dateString === todayDateString;
      };

      // Query to count documents with status "Sudah Diambil" for today
      const sudahDiambilQuery = query(
        bungkusanCollection,
        where("status_bungkusan", "==", "Sudah Diambil")
      );
      const sudahDiambilSnapshot = await getDocs(sudahDiambilQuery);
      const sudahDiambilCount = sudahDiambilSnapshot.docs.filter((doc) =>
        isToday(doc.data().masa_rekod)
      ).length;
      document.getElementById("taken").textContent = sudahDiambilCount;

      // Query to count documents with status "Sila Ambil" for today
      const silaAmbilQuery = query(
        bungkusanCollection,
        where("status_bungkusan", "==", "Sila Ambil")
      );
      const silaAmbilSnapshot = await getDocs(silaAmbilQuery);
      const silaAmbilCount = silaAmbilSnapshot.docs.filter((doc) =>
        isToday(doc.data().masa_rekod)
      ).length;
      document.getElementById("janjitemu").textContent = silaAmbilCount;

      // Query to count documents with status "Sedia Diambil" for today
      const sediaDiambilQuery = query(
        bungkusanCollection,
        where("status_bungkusan", "==", "Sedia Diambil")
      );

      const sediaDiambilSnapshot = await getDocs(sediaDiambilQuery);
      const sediaDiambilCount = sediaDiambilSnapshot.docs.length;

      document.getElementById("checkin").textContent =
        sediaDiambilCount.toString();

      // Update Chart.js data
      updateChart(sudahDiambilCount, silaAmbilCount, sediaDiambilCount);

      console.log("Updated bungkusan status counts.");
    } catch (error) {
      console.error("Error fetching bungkusan status counts:", error);
    }
  };

  // Function to update or create Chart.js chart
  const updateChart = (
    sudahDiambilCount,
    silaAmbilCount,
    sediaDiambilCount
  ) => {
    // Get canvas element
    const ctx = document.getElementById("myChart").getContext("2d");

    // Define data for the chart
    const data = {
      labels: ["Belum Diambil", "Janji Temu", "Sudah Diambil"],
      datasets: [
        {
          label: "Bungkusan Counts",
          data: [sediaDiambilCount, silaAmbilCount, sudahDiambilCount],
          backgroundColor: [
            "rgba(255, 206, 86, 1)",
            "rgba(255, 0, 0, 1)",
            "rgba(61, 255, 3, 1)",  
          ],
          borderColor: [
            "rgba(0, 0, 0,  0.5)",
            "rgba(0, 0, 0,  0.5)",
            "rgba(0, 0, 0, 0.5)",
          ],
          borderWidth: 1,
        },
      ],
    };

    // Define chart options for the pie chart, including the title
const options = {
  responsive: true,
  plugins: {
    title: {
      display: true,
      text: 'Statistik Bungkusan Harian',
      font: {
        size: 20,
      },
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      display: false,
    },
  },
};

    // Create new chart
    window.myChart = new Chart(ctx, {
      type: "doughnut",
      data: data,
      options: options,
    });
  };

 // Function to fetch bungkusan status for the past 7 days and update the line chart
const fetchBungkusanStatus7Days = async () => {
  try {
    const bungkusanCollection = collection(db, "bungkusan");
    const today = new Date();

    // Generate date strings for the past 7 days
    const past7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      past7Days.push(getLocalDateString(date));
    }

    // Initialize an object to hold the counts for each day
    const dailyCounts = {};
    past7Days.forEach((date) => {
      dailyCounts[date] = 0;
    });

    // Query to fetch all documents with status "Sedia Diambil"
    const sediaDiambilQuery = query(
      bungkusanCollection,
      where("status_bungkusan", "==", "Sedia Diambil")
    );
    const sediaDiambilSnapshot = await getDocs(sediaDiambilQuery);

    // Count documents by day
    sediaDiambilSnapshot.forEach((doc) => {
      const data = doc.data();
      const masa_rekod = data.masa_rekod;
      if (masa_rekod) {
        const date = new Date(masa_rekod.seconds * 1000); // Convert Firestore Timestamp to JavaScript Date
        const dateString = getLocalDateString(date);
        if (dailyCounts.hasOwnProperty(dateString)) {
          dailyCounts[dateString]++;
        }
      }
    });

    // Prepare data for the line chart
    const labels = Object.keys(dailyCounts);
    const counts = Object.values(dailyCounts);

    // Update line chart with the fetched data
    createNewLineChart(labels, counts);

    console.log("Updated bungkusan status for the past 7 days.");
  } catch (error) {
    console.error("Error fetching bungkusan status for the past 7 days:", error);
  }
};

// Function to create a new line chart
const createNewLineChart = (labels, counts) => {
  // Get canvas element
  const lineChartCtx = document.getElementById("lineChart").getContext("2d");

  // Define data for the line chart
  const data = {
    labels: labels,
    datasets: [
      {
        label: "Bungkusan Direkod Harian",
        data: counts,
        backgroundColor: "rgba(13,18,130, 0.7)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
        fill: true,
        tension: 0.5
      },
    ],
  };

   // Define options for the line chart, including the title
   const options = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: 'Bungkusan Direkod Harian',
        font: {
          size: 25,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        precision: 0,
        stepSize: 1,
      },
    },
  };
  // Create new line chart
  window.lineChart = new Chart(lineChartCtx, {
    type: "line",
    data: data,
    options: options,
  });
};

  
  // Fetch and update the shop status initially and then every 15 seconds
  fetchShopStatus();
  setInterval(fetchShopStatus, 15000); // Update status every 15 seconds
  fetchBungkusanStatusCounts();
  fetchBungkusanStatus7Days();

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

        console.log(
          `Updated bungkusan status to "Sedia Diambil" for ID ${bungkusanID}.`
        );
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
