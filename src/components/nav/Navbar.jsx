import { useState, useEffect } from "react";
import { auth } from "../../firebaseConfig";
import { signOut, onAuthStateChanged, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, doc, onSnapshot } from "firebase/firestore";
import ModelDropdown from "./ModelDropdown"; // adjust path as needed
import { isMobile } from "react-device-detect";

const provider = new GoogleAuthProvider();
const db = getFirestore();
const API_URL = import.meta.env.VITE_BACKEND_URL;

function NavBar({ setSelectedModel, selectedModel }) {
    const [user, setUser] = useState(null);
    const [credits, setCredits] = useState(0);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    // 🔹 NEW: Manage sidebar visibility
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // 🔹 NEW: Handler for opening/closing chat history sidebar
    const toggleSidebar = () => {
        setIsSidebarOpen((prev) => !prev);
    };

    // 🔹 NEW: Handler for starting a new chat
    const handleNewChat = () => {
        // Implement your "new chat" logic here
        // e.g., clearing the current chat state in a parent component, or redirecting
        console.log("Starting a new chat...");
    };

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, async (authUser) => {
            setUser(authUser);
            if (authUser) {
                const userRef = doc(db, "users", authUser.uid);
                try {
                    const unsubscribeCredits = onSnapshot(userRef, (docSnap) => {
                        if (docSnap.exists()) {
                            setCredits(docSnap.data().credits || 0);
                        }
                    });
                    return () => unsubscribeCredits();
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
            // Optionally call your backend to create/update user in Firestore
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

    const handleLogout = async () => {
        try {
            await signOut(auth);
            setDropdownOpen(false);
            setCredits(0);
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
                body: JSON.stringify({ creditsAmount: 250 }),
            });
            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }
            const data = await response.json();
            window.open(data.url, "_blank");
        } catch (error) {
            console.error("Checkout Error:", error);
            alert("Failed to initiate checkout. Please try again.");
        }
    };

    return (
        <nav className="draggable no-draggable-children absolute w-full top-0 p-3 flex items-center justify-between z-10 h-header-height font-semibold bg-token-main-surface-primary">
            {/* Left side buttons + Model dropdown */}
            <div className="flex items-center space-x-4 pl-10">
                {/* <button className="bg-gray-200 px-2 py-1 rounded hover:bg-gray-300" onClick={toggleSidebar}>
                    Chat History
                </button>

                
                <button className="bg-gray-200 px-2 py-1 rounded hover:bg-gray-300" onClick={handleNewChat}>
                    New Chat
                </button> */}

                {/* Model selection dropdown */}
                <ModelDropdown setSelectedModel={setSelectedModel} selectedModel={selectedModel} />
            </div>

            {/* Right side user area */}
            <div className="relative pr-10">
                {user ? (
                    <div className="flex items-center gap-4">
                        <span className="text-gray-700 font-semibold">Credits: {credits}</span>
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-800">
                            <button onClick={() => setDropdownOpen(!dropdownOpen)}>
                                <img
                                    alt="User"
                                    src={user.photoURL || "https://via.placeholder.com/40"}
                                    className="rounded-full scale-[105%] hover:scale-[75%] transition duration-500"
                                    referrerPolicy="no-referrer"
                                />
                            </button>
                        </div>
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

            {/* 🔹 Conditional sidebar for Chat History */}
            {isSidebarOpen && (
                <div className="fixed top-0 left-0 w-64 h-full bg-white shadow-md border-r border-gray-200 z-50 p-4">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-bold">Chat History</h2>
                        <button className="text-gray-600 hover:text-black" onClick={toggleSidebar}>
                            Close
                        </button>
                    </div>
                    {/* Place your chat history content here, e.g. a list of previous chats */}
                    <ul className="space-y-2">
                        <li>Today’s chat</li>
                        <li>Yesterday’s chat</li>
                        <li>Archived chat</li>
                    </ul>
                </div>
            )}
        </nav>
    );
}

export default NavBar;
