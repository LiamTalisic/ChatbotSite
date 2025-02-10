import { useState, useEffect } from "react";
import { auth } from "../firebaseConfig";
import { signOut, onAuthStateChanged, signInWithPopup, GoogleAuthProvider } from "firebase/auth";

const provider = new GoogleAuthProvider();

function NavBar({ setShowComponent }) {
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      setUser(authUser);
    });
    return () => unsubscribe();
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
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  return (
    <nav className=" draggable no-draggable-children sticky top-0 p-3 mb-1.5 flex items-center justify-between z-10 h-header-height font-semibold bg-token-main-surface-primary max-md:hidden">
      <div className="flex items-center space-x-4 pl-10">
        <button onClick={() => setShowComponent("chat")} className="hover:text-gray-300">
          Text Chat
        </button>
        <button onClick={() => setShowComponent("users")} className="hover:text-gray-300">
          Image Generation
        </button>
      </div>

      <div className="relative pr-10">
        {user ? (
          <div className="flex items-center gap-4">
            {/* Profile Picture Button */}
            <button 
              onClick={() => setDropdownOpen(!dropdownOpen)} 
              className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-gray-600 focus-visible:outline-0"
            >
              <img
                alt="User"
                src={user.photoURL}
                className="rounded-full w-10 h-10"
                referrerPolicy="no-referrer"
              />
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-22 w-40 bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
                <button 
                  onClick={handleLogout} 
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-800"
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
