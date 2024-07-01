// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";



// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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

// Export auth object
export const auth = getAuth();

// Wait for the DOM to fully load
document.addEventListener("DOMContentLoaded", () => {
  // Get the submit button
  const submit = document.getElementById("submit");

  // Check if the submit button exists
  if (submit) {
    // Add click event listener to the submit button
    submit.addEventListener("click", (event) => {
      event.preventDefault();

      // Get email and password inputs
      const email = document.getElementById("idpengguna").value;
      const password = document.getElementById("password").value;

      // Sign in with email and password
      signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {

          const username = email.split("@")[0];
          const capitalizedUsername = username.toUpperCase();

          // Redirect to index.html upon successful login
          alert("Berjaya Log Masuk! Anda adalah : " + capitalizedUsername);
          window.location.href = "../../home.html";
        })
        .catch((error) => {
          // Display error message
          alert("Log Masuk Tidak Berjaya, Sila Cuba Lagi...\n\n" +error.message)
          
        });
    });
  }
});

/*=============== SHOW HIDDEN - PASSWORD ===============*/
const showHiddenPass = (inputPass, inputIcon) =>{
   const input = document.getElementById(inputPass),
         iconEye = document.getElementById(inputIcon)
         
   iconEye.addEventListener('click', () =>{
       // Change password to text
       if(input.type === 'password'){
           // Switch to text
           input.type = 'text'

           // Add icon
           iconEye.classList.add('ri-eye-line')
           // Remove icon
           iconEye.classList.remove('ri-eye-off-line')
       }else{
           // Change to password
           input.type = 'password'

           // Remove icon
           iconEye.classList.remove('ri-eye-line')
           // Add icon
           iconEye.classList.add('ri-eye-off-line')
       }
   })
}

showHiddenPass('password','inputicon')
