import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";

const ChatHistory = ({ messages }) => {
    const chatContainerRef = useRef(null);
    const [popupImage, setPopupImage] = useState(null);

    // Auto-scroll to the bottom only if the user is near the bottom
    useEffect(() => {
        const container = chatContainerRef.current;
        if (!container) return;

        // Set a threshold (in pixels) to determine if the user is at the bottom
        const threshold = 50;
        const { scrollTop, scrollHeight, clientHeight } = container;

        // Check if the user is near the bottom
        if (scrollHeight - scrollTop - clientHeight < threshold) {
            container.scrollTop = scrollHeight;
        }
    }, [messages]);

    return (
        <div
            ref={chatContainerRef}
            className="flex flex-col w-full mx-auto p-4 border rounded-lg shadow-md bg-white mb-5 h-full overflow-y-auto
                        [&::-webkit-scrollbar]:w-2 
                        [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-track]:rounded-full
                        [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full"
        >
            <div className="flex flex-col gap-y-2">
                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={`relative p-2 rounded-2xl max-w-[80%] break-words 
                            ${message.sender === "user" ? "bg-blue-500 text-white self-end" : "bg-gray-200 text-black self-start"}`}
                    >
                        {message.isImage ? (
                            <div className="flex flex-col items-start relative">
                                <div className="flex flex-row items-start justify-between w-full mb-1">
                                    <p className="text-sm text-gray-600 mb-1">AI Generated Image:</p>
                                    {/* ✅ Updated Copy Button */}
                                    {/* <button
                                        onClick={() => handleCopyImage(message.imageUrl)}
                                        className="px-2 bg-gray-300 text-white text-sm rounded-lg hover:bg-gray-600 duration-250"
                                    >
                                        COPY
                                    </button> */}
                                </div>
                                <img
                                    src={message.text}
                                    alt="Generated content"
                                    className="max-w-full rounded-lg shadow-lg cursor-pointer transition-transform hover:scale-102 duration-250"
                                    style={{ maxHeight: "300px", objectFit: "cover" }}
                                    onClick={() => setPopupImage(message.text)}
                                />
                            </div>
                        ) : (
                            <ReactMarkdown className="whitespace-pre-wrap">{message.text}</ReactMarkdown>
                        )}
                    </div>
                ))}
            </div>

            {/* ✅ Image Popup (Centered, 80% width) */}
            {popupImage && (
                <div className="fixed inset-0 flex items-center justify-center bg-[rgba(0,0,0,0.7)] backdrop-blur-md z-50" onClick={() => setPopupImage(null)}>
                    <img src={popupImage} alt="Enlarged preview" className="max-w-[80%] max-h-[80%] rounded-2xl shadow-lg" />
                </div>
            )}
        </div>
    );
};

export default ChatHistory;
