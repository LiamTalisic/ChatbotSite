import { useState, useEffect } from "react";
import { auth } from "../firebaseConfig";
import { signOut, onAuthStateChanged, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";

const provider = new GoogleAuthProvider();
const db = getFirestore();
const API_URL = import.meta.env.VITE_BACKEND_URL;

function NavBar({ setShowComponent }) {
    const [user, setUser] = useState(null);
    const [credits, setCredits] = useState(0);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, async (authUser) => {
            setUser(authUser);

            if (authUser) {
                const userRef = doc(db, "users", authUser.uid);

                try {
                    const userDoc = await getDoc(userRef);

                    if (!userDoc.exists()) {
                        console.log("🆕 Creating new user in Firestore...");

                        // ✅ Create new user document in Firestore
                        await setDoc(userRef, {
                            uid: authUser.uid,
                            email: authUser.email,
                            credits: 5,  // 🔹 New users get 10 free credits
                            canChat: true, // 🔹 Allow chat by default
                            stripeCustomerId: "", // 🔹 Will be filled when first payment is made
                            lastPaymentDate: "", // 🔹 Will update when a payment is made
                            totalCreditsPurchased: 0, // 🔹 Tracks total credits purchased
                            createdAt: new Date().toISOString()
                        });

                        console.log("✅ New user successfully added to Firestore.");
                    } else {
                        console.log("✅ User already exists in Firestore.");
                    }

                    // ✅ Real-time listener for credit updates
                    const unsubscribeCredits = onSnapshot(userRef, (docSnap) => {
                        if (docSnap.exists()) {
                            setCredits(docSnap.data().credits || 0);
                        }
                    });

                    return () => unsubscribeCredits(); // Cleanup listener on unmount
                } catch (error) {
                    console.error("🔥 Error checking/creating user document:", error);
                }
            }
        });

        return () => unsubscribeAuth();
    }, []);

    const handleGoogleSignIn = async () => {
        try {
            await signInWithPopup(auth, provider);
        } catch (error) {
            console.error("Google Sign-In Error:", error);
        }
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
            setDropdownOpen(false);
            setCredits(0); // Reset credits on logout
        } catch (error) {
            console.error("Logout Error:", error);
        }
    };

    const handleBuyCredits = async () => {
        if (!user) {
            alert("Please log in first to purchase credits.");
            return;
        }

        try {
            const token = await user.getIdToken();
            const response = await fetch(`${API_URL}/create-checkout-session`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ creditsAmount: 50 }) // Default: 50 credits purchase
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }

            const data = await response.json();
            window.location.href = data.url; // Redirect to Stripe Payment Link
        } catch (error) {
            console.error("Checkout Error:", error);
            alert("Failed to initiate checkout. Please try again.");
        }
    };

    return (
        <nav className="draggable no-draggable-children sticky top-0 p-3 mb-1.5 flex items-center justify-between z-10 h-header-height font-semibold bg-token-main-surface-primary max-md:hidden">
            <div className="flex items-center space-x-4 pl-10">
                <button onClick={() => setShowComponent("chat")} className="hover:text-gray-300 duration-150">
                    New Text Chat
                </button>
            </div>

            <div className="relative pr-10">
                {user ? (
                    <div className="flex items-center gap-4">
                        {/* Display user credits */}
                        <span className="text-gray-700 font-semibold">Credits: {credits}</span>

                        {/* Profile Picture Button */}
                        <button 
                            onClick={() => setDropdownOpen(!dropdownOpen)} 
                            className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-gray-600 focus-visible:outline-0"
                        >
                            <img
                                alt="User"
                                src={user.photoURL || "https://via.placeholder.com/40"}
                                className="rounded-full w-10 h-10"
                                referrerPolicy="no-referrer"
                            />
                        </button>

                        {/* Dropdown Menu */}
                        {dropdownOpen && (
                            <div className="absolute right-10 mt-35 w-48 bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
                                <button 
                                    onClick={handleBuyCredits} 
                                    className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-800"
                                >
                                    Buy Credits
                                </button>
                                <button 
                                    onClick={handleLogout} 
                                    className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-800 border-t border-gray-300"
                                >
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <button onClick={handleGoogleSignIn} className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded">
                        Login with Google
                    </button>
                )}
            </div>
        </nav>
    );
}

export default NavBar;
