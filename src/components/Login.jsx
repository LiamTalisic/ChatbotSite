import React, { useState } from "react";
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword 
} from "firebase/auth";
import { auth } from "../firebaseConfig"; // ✅ Import Firebase Auth
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";

// ✅ Initialize Firestore
const db = getFirestore();
const provider = new GoogleAuthProvider();

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // 🔹 Google Sign-In (with Firestore User Entry)
  const signInWithGoogle = async () => {
    try {
        setLoading(true);
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        const userRef = doc(db, "users", user.uid);

        // 🔍 Check if user exists in Firestore
        const userDoc = await getDoc(userRef);
        if (!userDoc.exists()) {
            // 🚀 Add user with default permissions
            await setDoc(userRef, {
                uid: user.uid,
                email: user.email,
                role: "user",
                canChat: false // Default to false, admin must enable manually
            });
        }

        setMessage(`Signed in as ${user.email}`);
        console.log("User signed in and stored in Firestore");
    } catch (error) {
        setMessage(`Google Sign-in Error: ${error.message}`);
        console.error("Google Sign-in Error:", error);
    } finally {
        setLoading(false);
    }
  };

  // 🔹 Email/Password Sign-Up (with Firestore User Entry)
  const signUpWithEmailPassword = async () => {
    try {
      setLoading(true);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const userRef = doc(db, "users", user.uid);

      // 🔍 Check if user exists in Firestore
      const userDoc = await getDoc(userRef);
      if (!userDoc.exists()) {
          // 🚀 Add user with default permissions
          await setDoc(userRef, {
              uid: user.uid,
              email: user.email,
              role: "user",
              canChat: false // Default to false, admin must enable manually
          });
      }

      setMessage(`Signed up as ${user.email}`);
      console.log("User registered and stored in Firestore");
    } catch (error) {
      setMessage(`Sign-up Error: ${error.message}`);
      console.error("Sign-up Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Email/Password Login
  const loginWithEmailPassword = async () => {
    try {
      setLoading(true);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      setMessage(`Logged in as ${user.email}`);
    } catch (error) {
      setMessage(`Login Error: ${error.message}`);
      console.error("Login Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>

        {/* Email & Password Fields */}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded mb-2"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded mb-4"
        />

        {/* Buttons */}
        <button 
          onClick={loginWithEmailPassword} 
          className="w-full bg-blue-500 text-white py-2 rounded mb-2 hover:bg-blue-600"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login with Email"}
        </button>
        <button 
          onClick={signUpWithEmailPassword} 
          className="w-full bg-green-500 text-white py-2 rounded mb-2 hover:bg-green-600"
          disabled={loading}
        >
          {loading ? "Signing up..." : "Sign Up with Email"}
        </button>
        <button 
          onClick={signInWithGoogle} 
          className="w-full bg-red-500 text-white py-2 rounded hover:bg-red-600"
          disabled={loading}
        >
          {loading ? "Signing in..." : "Login with Google"}
        </button>

        {/* Message Display */}
        {message && <p className="text-center text-sm text-gray-600 mt-4">{message}</p>}
      </div>
    </div>
  );
};

export default Login;
