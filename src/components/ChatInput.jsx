import { useState, useRef, useEffect } from "react";
import { auth } from "../firebaseConfig";
import { getFirestore, doc, getDoc } from "firebase/firestore";

const db = getFirestore();

const ChatInput = ({ onSendMessage }) => {
    const [message, setMessage] = useState("");
    const [canChat, setCanChat] = useState(false); // 🔹 Default to null (loading state)
    const textareaRef = useRef(null);
    const maxHeight = 150;

    // 🔹 Function to Check Firestore `canChat` Permission
    const checkChatPermission = async (user) => {
        if (!user) {
            setCanChat(false);
            console.log("No user authenticated. Setting canChat to false.");
            return;
        }

        try {
            const userRef = doc(db, "users", user.uid);
            const userDoc = await getDoc(userRef);

            if (userDoc.exists()) {
                const userData = userDoc.data();
                console.log("ChatInput Firestore Data:", userData);
                setCanChat(userData.canChat); // 🔥 Updates state dynamically
            } else {
                console.log("User document does not exist in Firestore.");
                setCanChat(false);
            }
        } catch (error) {
            console.error("Error checking chat permission:", error);
            setCanChat(false);
        }
    };

    // 🔹 Automatically Check Permissions When User Logs In/Out
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user?.uid) checkChatPermission(user);
        });
        return () => unsubscribe();
    }, []);

    const API_URL = import.meta.env.VITE_BACKEND_URL; // ✅ Load from .env

    const sendMessage = async () => {
        const trimmedMessage = message.trim();
        if (!trimmedMessage) return;

        const user = auth.currentUser;
        if (!user) {
            console.error("User not authenticated.");
            alert("Please log in first.");
            return;
        }

        // 🔹 Get Firebase Authentication Token
        const token = await user.getIdToken();
        if (!token) {
            console.error("Failed to get Firebase token.");
            return;
        }

        // 🔹 Send user message to ChatHistory
        onSendMessage({ text: trimmedMessage, sender: "user" });
        setMessage("");

        try {
            const response = await fetch(`${API_URL}/chat`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`, // ✅ Include Firebase Token
                },
                body: JSON.stringify({ message: trimmedMessage }),
            });

            if (!response.ok) {
                throw new Error(`Server error: ${response.status} - ${response.statusText}`);
            }

            // ✅ Parse JSON response
            const data = await response.json();

            if (!data.reply) {
                throw new Error("Invalid response format: Missing 'reply' key.");
            }

            console.log("AI Reply:", data.reply);
            
            // 🔹 Send AI response to ChatHistory
            onSendMessage({ text: data.reply, sender: "bot" });

        } catch (error) {
            console.error("Error sending message:", error);
            alert("Error communicating with the chatbot. Please try again.");
        }
    };


    const handleSend = () => {
        sendMessage();
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const resizeTextarea = () => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = "auto";
            textarea.style.height = Math.min(textarea.scrollHeight, maxHeight) + "px";
        }
    };

    useEffect(() => {
        resizeTextarea();
    }, [message]);

    return (
        <div className="flex items-end w-full mx-auto p-2 rounded-lg shadow-md shadow-gray-300 border border-gray-200 bg-white">
            <textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder={canChat === false ? "You do not have chat permissions." : "Type a message... (Shift+Enter for new line)"}
                className="flex-1 p-2 rounded-lg outline-none resize-none overflow-y-auto max-h-[400px] min-h-[40px]
                            [&::-webkit-scrollbar]:w-2 
                            [&::-webkit-scrollbar-track]:bg-gray-100  [&::-webkit-scrollbar-track]:rounded-full
                            [&::-webkit-scrollbar-thumb]:bg-gray-500 [&::-webkit-scrollbar-thumb]:rounded-full"
                disabled={canChat === false}
            />

            <button
                onClick={handleSend}
                className={`ml-2 w-10 h-10 text-white rounded-full flex items-center justify-center duration-200 ${
                    canChat === false ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-400"
                }`}
                disabled={canChat === false}
            >
                <svg
                    width="24"
                    height="24"
                    viewBox="0 0 32 32"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-6 h-6"
                >
                    <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M15.1918 8.90615C15.6381 8.45983 16.3618 8.45983 16.8081 8.90615L21.9509 14.049C22.3972 14.4953 22.3972 15.2189 21.9509 15.6652C21.5046 16.1116 20.781 16.1116 20.3347 15.6652L17.1428 12.4734V22.2857C17.1428 22.9169 16.6311 23.4286 15.9999 23.4286C15.3688 23.4286 14.8571 22.9169 14.8571 22.2857V12.4734L11.6652 15.6652C11.2189 16.1116 10.4953 16.1116 10.049 15.6652C9.60265 15.2189 9.60265 14.4953 10.049 14.049L15.1918 8.90615Z"
                        fill="currentColor"
                    />
                </svg>
            </button>
        </div>
    );
};

export default ChatInput;
