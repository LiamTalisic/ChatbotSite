import { useEffect, useRef } from "react";

const ChatHistory = ({ messages }) => {
    const chatContainerRef = useRef(null);

    // Auto-scroll to the bottom when a new message is added
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
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
                        className={`p-2 rounded-2xl max-w-[80%] break-words 
                            ${message.sender === "user" ? "bg-blue-500 text-white self-end" : "bg-gray-200 text-black self-start"}`}
                    >
                        {message.isImage ? (
                            <div className="flex flex-col items-start">
                                <p className="text-sm text-gray-600 mb-1">AI Generated Image:</p>
                                <img 
                                    src={message.text} 
                                    alt="Generated content" 
                                    className="max-w-full rounded-lg shadow-lg" 
                                    style={{ maxHeight: "300px", objectFit: "cover" }}
                                />
                            </div>
                        ) : (
                            <p className="whitespace-pre-wrap">{message.text}</p>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ChatHistory;
