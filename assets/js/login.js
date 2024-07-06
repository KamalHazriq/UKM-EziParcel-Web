// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCUP1GicCdH32LxTw692YwZbCJlsCwTvRs",
  authDomain: "ukm-eziparcel-c71bc.firebaseapp.com",
  projectId: "ukm-eziparcel-c71bc",
  storageBucket: "ukm-eziparcel-c71bc.appspot.com",
  messagingSenderId: "409550515516",
  appId: "1:409550515516:web:b47a453305b80f69028239"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

// Export auth object
export const auth = getAuth();

// Wait for the DOM to fully load
document.addEventListener("DOMContentLoaded", () => {
  // Get the submit button
  const submit = document.getElementById("submit");

  // Check if the submit button exists
  if (submit) {
    // Add click event listener to the submit button
    submit.addEventListener("click", async (event) => {
      event.preventDefault();

      // Dapatkan input
      const email = document.getElementById("idpengguna").value;
      const password = document.getElementById("password").value;

      try {
        await signInWithEmailAndPassword(auth, email, password);
        
        // Mencari staf di pangkalan data
        const stafQuery = query(collection(db, "staf"), where("emel", "==", email));
        const querySnapshot = await getDocs(stafQuery);

        if (!querySnapshot.empty) {
          const stafData = querySnapshot.docs[0].data();
          const name = stafData.nama;
          const stafId = stafData.staf_id;
          const capitalizedName = name.toUpperCase();

          alert(`Berjaya Log Masuk!\n\nAnda Adalah : ${capitalizedName} (${stafId})`);
          window.location.href = "home.html";
        } else {
          alert("Staf tidak dijumpai dalam pangkalan data.");
        }
      } catch (error) {
        alert("Log Masuk Tidak Berjaya, Sila Cuba Lagi...\n\n" + error.message);
      }
    });
  }
});

/*=============== SHOW HIDDEN - PASSWORD ===============*/
const showHiddenPass = (inputPass, inputIcon) => {
  const input = document.getElementById(inputPass),
    iconEye = document.getElementById(inputIcon);

  iconEye.addEventListener('click', () => {
    // Change password to text
    if (input.type === 'password') {
      // Switch to text
      input.type = 'text';

      // Add icon
      iconEye.classList.add('ri-eye-line');
      // Remove icon
      iconEye.classList.remove('ri-eye-off-line');
    } else {
      // Change to password
      input.type = 'password';

      // Remove icon
      iconEye.classList.remove('ri-eye-line');
      // Add icon
      iconEye.classList.add('ri-eye-off-line');
    }
  });
}

showHiddenPass('password', 'inputicon');
