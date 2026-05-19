import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";   // 🔥 ADD THIS

const firebaseConfig = {
  apiKey: "AIzaSyANmVsM0NmoYzoPbHuq7SRvIaQPVZn6yYM",
  authDomain: "zevax-1234.firebaseapp.com",
  databaseURL: "https://zevax-1234-default-rtdb.firebaseio.com",
  projectId: "zevax-1234",
  storageBucket: "zevax-1234.firebasestorage.app",
  messagingSenderId: "204186523532",
  appId: "1:204186523532:web:70fde8287dac661ddf28a9"
};

const app = initializeApp(firebaseConfig);

// 🔥 EXPORT BOTH
export const db = getDatabase(app);
export const auth = getAuth(app);   // 🔥 VERY IMPORTANT

export default app;