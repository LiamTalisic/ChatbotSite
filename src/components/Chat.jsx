import { useState } from "react";
import ChatHistory from "./ChatHistory";
import ChatInput from "./ChatInput";

const Chat = () => {
    const [messages, setMessages] = useState([
        { id: 1, text: "Hello! How can I assist you today?", sender: "bot" },
    ]);

    // 🔹 Ensure all messages get a unique ID and proper format
    const handleSendMessage = (messageObj) => {
        setMessages((prevMessages) => [
            ...prevMessages,
            { 
                id: prevMessages.length + 1, 
                text: messageObj.text, 
                sender: messageObj.sender, 
                isImage: messageObj.isImage || false 
            },
        ]);
    };

    return (
        <div className="flex flex-col h-full max-h-[95%] p-5 m-5 border rounded-2xl shadow-md shadow-black bg-gray-50 justify-between">
            <ChatHistory messages={messages} />
            <ChatInput onSendMessage={handleSendMessage} />
        </div>
    );
};

export default Chat;
