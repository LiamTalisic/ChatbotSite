import { useState, useRef, useEffect } from "react";
import { auth } from "../firebaseConfig";

const ChatInput = ({ onSendMessage }) => {
    const [message, setMessage] = useState("");
    const textareaRef = useRef(null);
    const maxHeight = 150; // Maximum height before scrollbar appears

    const sendMessage = async () => {
        const trimmedMessage = message.trim();
        if (!trimmedMessage) return;

        const user = auth.currentUser;
        if (!user) {
            console.error("User not authenticated");
            return;
        }

        // 🔹 Get Firebase Authentication Token
        const token = await user.getIdToken();

        // 🔹 Send user message to ChatHistory
        onSendMessage({ text: trimmedMessage, sender: "user" });
        setMessage("");

        try {
            const response = await fetch("http://localhost:3000/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`, // ✅ Include Firebase Token
                },
                body: JSON.stringify({ message: trimmedMessage }),
            });

            console.log(token)

            const reply = await response.text();
            console.log("AI Reply:", reply);

            // 🔹 Send AI response to ChatHistory
            onSendMessage({ text: reply, sender: "bot" });

        } catch (error) {
            console.error("Error sending message:", error);
        }
    };


    const handleSend = () => {
        sendMessage();
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault(); // Prevent default Enter behavior (new line)
            handleSend();
        }
    };

    const resizeTextarea = () => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = "auto"; // Reset height to auto
            textarea.style.height = Math.min(textarea.scrollHeight, maxHeight) + "px";
        }
    };

    useEffect(() => {
        resizeTextarea(); // Adjust height when message changes
    }, [message]);

    return (
        <div className="flex items-end w-full mx-auto p-2 rounded-lg shadow-md shadow-gray-300 border border-gray-200 bg-white">
            <textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Type a message... (Shift+Enter for new line)"
                className="flex-1 p-2 rounded-lg outline-none resize-none overflow-y-auto max-h-[400px] min-h-[40px]
                            [&::-webkit-scrollbar]:w-2 
                            [&::-webkit-scrollbar-track]:bg-gray-100  [&::-webkit-scrollbar-track]:rounded-full
                            [&::-webkit-scrollbar-thumb]:bg-gray-500 [&::-webkit-scrollbar-thumb]:rounded-full"
            />

            <button
                onClick={handleSend}
                className="ml-2 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-400 duration-200"
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
