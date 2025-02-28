import { useState } from "react";
import ChatHistory from "./ChatHistory";
import ChatInput from "./ChatInput";

const Chat = ({ selectedModel }) => {
    const [messages, setMessages] = useState([{ id: 1, text: "Hello! How can I assist you today?", sender: "bot" }]);

    return (
        <div className="flex flex-col p-5 m-5 border rounded-3xl shadow-md shadow-black bg-gray-50 justify-between h-full max-h-[95vh] chatbox">
            <ChatHistory messages={messages} />
            <ChatInput setMessages={setMessages} selectedModel={selectedModel} />
        </div>
    );
};

export default Chat;
