import { useState } from "react";
import { isMobile } from "react-device-detect";
import ChatHistory from "./ChatHistory";
import ChatInput from "./ChatInput";

const Chat = ({ selectedModel }) => {
    const [messages, setMessages] = useState([{ id: 1, text: "Hello! How can I assist you today?", sender: "bot" }]);

    // 🔹 Ensure all messages get a unique ID and proper format
    const handleSendMessage = (messageObj) => {
        setMessages((prevMessages) => [
            ...prevMessages,
            {
                id: prevMessages.length + 1,
                text: messageObj.text,
                sender: messageObj.sender,
                isImage: messageObj.isImage || false,
            },
        ]);
    };

    return (
        <div className="flex flex-col p-4 rounded-3xl shadow-md shadow-black justify-between h-[90vh] chatbox">
            <ChatHistory messages={messages} />
            <ChatInput onSendMessage={handleSendMessage} setMessages={setMessages} selectedModel={selectedModel} messageHistory={messages} />
        </div>
    );
};

export default Chat;
