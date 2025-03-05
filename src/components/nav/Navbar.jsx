import { useState, useEffect } from "react";
import { auth } from "../../firebaseConfig";
import { signOut, onAuthStateChanged, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import ModelDropdown from "./ModelDropdown"; // adjust the path as needed

const provider = new GoogleAuthProvider();
const db = getFirestore();
const API_URL = import.meta.env.VITE_BACKEND_URL;

function NavBar({ setSelectedModel, selectedModel }) {
    const [user, setUser] = useState(null);
    const [credits, setCredits] = useState(0);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, async (authUser) => {
            setUser(authUser);

            if (authUser) {
                const userRef = doc(db, "users", authUser.uid);
                console.log("User id:", authUser.uid); //hmm i dont like this
                // not familiar enough with it to actually know if its actually a security issue, but it does seem like users could potentially
                // forcefully change their id to someone elses use get credits function

                try {
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
            const result = await signInWithPopup(auth, provider);
            const user = result.currentUser;

            const idToken = await user.getIdToken();

            // Call your backend to create/update user in Firestore
            await createUserInDatabase(user, idToken);
        } catch (error) {
            console.error("Google Sign-In Error:", error);
        }
    };

    const createUserInDatabase = async (user, idToken) => {
        try {
            const response = await fetch(`${API_URL}/user/signup`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${idToken}`,
                },
                body: JSON.stringify({
                    uid: user.uid,
                    email: user.email,
                    displayName: user.displayName,
                    photoURL: user.photoURL,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to create user in database");
            }

            const data = await response.json();
            console.log("User created/updated in database:", data);
        } catch (error) {
            console.error("Error creating user in database:", error);
        }
    };

    // Call the backend to get the user credits
    const getUserCredits = async (user) => {
        const idToken = await user.getIdToken();
        // call the backend to get the user credits
        const response = await fetch(`${API_URL}/user/credits`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${idToken}`,
            },
        });
        if (!response.ok) {
            throw new Error("Failed to get user credits");
        }
        const data = await response.json();
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

            const response = await fetch(`${API_URL}/payment/create-checkout-session`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ creditsAmount: 250 }), // Default: 50 credits purchase
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }

            //log the response
            const data = await response.json();
            console.log(data);

            // Open Stripe Checkout
            window.open(data.url, "_blank");
        } catch (error) {
            console.error("Checkout Error:", error);
            alert("Failed to initiate checkout. Please try again.");
        }
    };

    return (
        <nav className="draggable no-draggable-children absolute w-full top-0 p-3 flex items-center justify-between z-10 h-header-height font-semibold bg-token-main-surface-primary ">
            <div className="flex items-center space-x-4 pl-10">
                {/* change this to a model selection dropdown*/}
                <ModelDropdown setSelectedModel={setSelectedModel} selectedModel={selectedModel} />
            </div>

            <div className="relative pr-10">
                {user ? (
                    <div className="flex items-center gap-4">
                        {/* Display user credits */}
                        <span className="text-gray-700 font-semibold">Credits: {credits}</span>

                        {/* Profile Picture Button */}
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-800 ">
                            <button onClick={() => setDropdownOpen(!dropdownOpen)}>
                                <img
                                    alt="User"
                                    src={user.photoURL || "https://via.placeholder.com/40"}
                                    className="rounded-full  scale-[105%] hover:scale-[75%] transition duration-500"
                                    referrerPolicy="no-referrer"
                                />
                            </button>
                        </div>
                        {/* Dropdown Menu */}
                        {dropdownOpen && (
                            <div className="absolute right-10 mt-35 w-48 bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
                                <button onClick={handleBuyCredits} className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-800">
                                    Buy Credits
                                </button>
                                <button onClick={handleLogout} className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-800 border-t border-gray-300">
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
