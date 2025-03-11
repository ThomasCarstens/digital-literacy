import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
createRoot(document.getElementById("root")!).render(<App />);
// Import the functions you need from the SDKs you need



// TODO: Add SDKs for Firebase products that you want to use

// https://firebase.google.com/docs/web/setup#available-libraries


// Your web app's Firebase configuration

// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const firebaseConfig = {
  apiKey: "AIzaSyDwSTbTE9sNiZSh2cdi3yWZPf2o6IcP_Rc",
  authDomain: "snap-and-play.firebaseapp.com",
  databaseURL: "https://snap-and-play-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "snap-and-play",
  storageBucket: "snap-and-play.firebasestorage.app",
  messagingSenderId: "756292014806",
  appId: "1:756292014806:web:ad23acf4a727e1b109af77",
  measurementId: "G-GE81W4MBTT"
};


// // Initialize Firebase

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);