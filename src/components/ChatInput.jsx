import { useState, useRef, useEffect } from "react";
import { auth } from "../firebaseConfig";
import { getFirestore, doc, onSnapshot } from "firebase/firestore";

const db = getFirestore();

const ChatInput = ({ onSendMessage, setMessages, selectedModel, messageHistory }) => {
    const [message, setMessage] = useState("");
    const [credits, setCredits] = useState(0);
    const [canChat, setCanChat] = useState(false); // 🔹 Added for better control and visibility in the

    const [isLoading, setIsLoading] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [controller, setController] = useState(null);
    const textareaRef = useRef(null);
    const maxHeight = 150;
    const API_URL = import.meta.env.VITE_BACKEND_URL;

    // 🔹 Listen for real-time updates to credits
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user?.uid) {
                const userRef = doc(db, "users", user.uid);

                return onSnapshot(userRef, (docSnap) => {
                    if (docSnap.exists()) {
                        const userData = docSnap.data();
                        setCanChat(userData.canChat);
                        setCredits(userData.credits || 0);
                    } else {
                        setCanChat(false);
                        setCredits(0);
                    }
                });
            }
        });

        return () => unsubscribe();
    }, []);

    const sendMessage = async (controller) => {
        const trimmedMessage = message.trim();
        if (!trimmedMessage) return;

        const user = auth.currentUser;
        if (!user) {
            alert("Please log in first.");
            return;
        }

        if (credits <= 0) {
            alert("You have no credits left. Please purchase more to continue.");
            return;
        }

        const token = await user.getIdToken();
        if (!token) return;

        setIsLoading(true);
        onSendMessage({ text: trimmedMessage, sender: "user" });
        setMessage("");

        try {
            const response = await fetch(`${API_URL}/chat`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ message: trimmedMessage, model: selectedModel, history: messageHistory }),
                signal: controller.signal, // Attach AbortController
            });

            if (!response.ok) {
                throw new Error(`Server error: ${response.status} - ${response.statusText}`);
            }

            // ✅ STREAM HANDLING
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let botMessage = { id: Date.now(), text: "", sender: "bot", isImage: false };

            // ✅ Read first chunk (metadata/image check)
            const { value, done } = await reader.read();
            if (done) return;

            const firstChunk = decoder.decode(value, { stream: true }).trim();

            try {
                const metadata = JSON.parse(firstChunk.replace("data: ", "").trim());
                if (metadata.isImage) {
                    setMessages((prevMessages) => [...prevMessages, { id: Date.now(), text: metadata.imageUrl, sender: "bot", isImage: true }]);
                    return; // ✅ Stop processing further, since it's an image.
                }
            } catch (error) {
                console.log("No image metadata detected, proceeding with text.");
            }

            // ✅ Add empty message first so we can append text in real-time
            setMessages((prevMessages) => [...prevMessages, botMessage]);

            //add the first chunk to the message
            setMessages((prevMessages) => prevMessages.map((msg) => (msg.id === botMessage.id ? { ...msg, text: firstChunk } : msg)));

            while (true) {
                const { value, done } = await reader.read();

                if (done) break;

                const chunk = decoder.decode(value, { stream: true });

                setMessages((prevMessages) => prevMessages.map((msg) => (msg.id === botMessage.id ? { ...msg, text: msg.text + chunk } : msg)));
            }
        } catch (error) {
            if (error.name === "AbortError") {
                console.log("Fetch aborted");
            } else {
                console.error("Error processing message:", error);
                alert("Error communicating with the chatbot. Please try again.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleSend = () => {
        if (isLoading && controller) {
            controller.abort(); // Abort the fetch request
            setIsLoading(false); // Reset loading state
        } else {
            const newController = new AbortController();
            setController(newController);
            sendMessage(newController);
        }
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
                placeholder={credits === 0 ? "You have no credits left. Purchase more to continue." : "Type a message... (Shift+Enter for new line)"}
                className="flex-1 p-2 rounded-lg outline-none resize-none overflow-y-auto max-h-[400px] min-h-[40px]
                            [&::-webkit-scrollbar]:w-2 
                            [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-track]:rounded-full
                            [&::-webkit-scrollbar-thumb]:bg-gray-500 [&::-webkit-scrollbar-thumb]:rounded-full"
                disabled={credits === 0}
            />

            <button
                onClick={handleSend}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className={`relative ml-2 w-10 h-10 text-white rounded-full flex items-center justify-center 
                        transition-all duration-300 ease-in-out 
                        ${credits === 0 ? "bg-gray-400 cursor-not-allowed" : isLoading ? "bg-blue-600 hover:bg-blue-400" : "bg-blue-600 hover:bg-blue-400"}
                    `}
                disabled={credits === 0}
            >
                {/* Icon container */}
                <div className="relative w-6 h-6 flex items-center justify-center">
                    {/* Stop icon (fades in on hover) */}
                    <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className={`absolute transition-opacity duration-300 transform scale-95 ${isLoading && isHovered ? "opacity-100 scale-100" : "opacity-0 scale-90"}`}
                    >
                        {/* Rounded stop icon */}
                        <rect x="6" y="6" width="12" height="12" fill="currentColor" rx="3" ry="3" />
                    </svg>

                    {/* Rotating loader (fades out on hover) */}
                    <svg
                        className={`absolute animate-spin transition-opacity duration-300 transform scale-95 ${isLoading && !isHovered ? "opacity-100 scale-100" : "opacity-0 scale-90"}`}
                        viewBox="0 0 24 24"
                        fill="none"
                    >
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path fill="currentColor" d="M4 12a8 8 0 018-8"></path>
                    </svg>

                    {/* Send icon (only visible when idle) */}
                    <svg
                        width="24"
                        height="24"
                        viewBox="0 0 32 32"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className={`absolute transition-opacity duration-300 transform scale-95 ${isLoading ? "opacity-0 scale-90" : "opacity-100 scale-100"}`}
                    >
                        <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M15.1918 8.90615C15.6381 8.45983 16.3618 8.45983 16.8081 8.90615L21.9509 14.049C22.3972 14.4953 22.3972 15.2189 21.9509 15.6652C21.5046 16.1116 20.781 16.1116 20.3347 15.6652L17.1428 12.4734V22.2857C17.1428 22.9169 16.6311 23.4286 15.9999 23.4286C15.3688 23.4286 14.8571 22.9169 14.8571 22.2857V12.4734L11.6652 15.6652C11.2189 16.1116 10.4953 16.1116 10.049 15.6652C9.60265 15.2189 9.60265 14.4953 10.049 14.049L15.1918 8.90615Z"
                            fill="currentColor"
                        />
                    </svg>
                </div>
            </button>
        </div>
    );
};

export default ChatInput;
