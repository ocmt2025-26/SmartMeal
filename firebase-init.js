// firebase-init.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
  getDatabase, ref, push, onValue, update, remove,
  query, orderByChild, equalTo
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyACuoVWxvF2jvHpfyjdtVXL1h1VZFr0YsQ",
  authDomain: "smartmeal-7f276.firebaseapp.com",
  databaseURL: "https://smartmeal-7f276-default-rtdb.firebaseio.com",
  projectId: "smartmeal-7f276",
  storageBucket: "smartmeal-7f276.firebasestorage.app",
  messagingSenderId: "291729989038",
  appId: "1:291729989038:web:cc99a3818578b488c3bc3f",
  measurementId: "G-W2MNS8BQGQ"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

window.SMARTMEAL_DB = db;
window.firebaseDb = {
  db, ref, push, onValue, update, remove, query, orderByChild, equalTo
};
