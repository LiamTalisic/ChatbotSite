import { useState } from "react";
import ChatHistory from "./ChatHistory";
import ChatInput from "./ChatInput";

const Chat = () => {
    const [messages, setMessages] = useState([
        { id: 1, text: "Hello! How can I assist you today?", sender: "bot" },
        { id: 2, text: "Hi! I need help with my project.", sender: "user" },
        { id: 3, text: "Sure! What specifically do you need help with?", sender: "bot" },
        { id: 4, text: "I'm trying to style the scrollbar in my chat app.", sender: "user" },
        { id: 5, text: "Great! Are you using Tailwind CSS for styling?", sender: "bot" },
        { id: 6, text: "Yes, I want to make the scrollbar visible only when scrolling.", sender: "user" },
        { id: 7, text: "Got it! You can use WebKit properties or Tailwind’s scrollbar plugin.", sender: "bot" },
        { id: 8, text: "I prefer WebKit, but I need rounded edges for the track.", sender: "user" },
        { id: 9, text: "No problem! You can use `::-webkit-scrollbar-track` with `border-radius`.", sender: "bot" },
        { id: 10, text: "Thanks! Also, can I hide it when not scrolling?", sender: "user" },
        { id: 11, text: "Yes! Use opacity transitions or JavaScript to detect scrolling.", sender: "bot" },
        { id: 12, text: "That sounds great! I'll test it out.", sender: "user" },
        { id: 13, text: "Let me know if you need any refinements.", sender: "bot" },
        { id: 14, text: "Will do! Also, how can I test with more messages?", sender: "user" },
        { id: 15, text: "Just generate some fake messages like these!", sender: "bot" },
        { id: 16, text: "Haha, makes sense! Thanks for the help.", sender: "user" },
        { id: 17, text: "You're welcome! Happy coding!", sender: "bot" },
        { id: 18, text: "By the way, how can I add smooth scrolling?", sender: "user" },
        { id: 19, text: "Use `scroll-behavior: smooth` in CSS or set `ref.current.scrollTop` in React.", sender: "bot" },
        { id: 20, text: "That’s awesome! I’ll try it now.", sender: "user" },
    ]);


    const handleSendMessage = (message) => {
        setMessages((prevMessages) => [...prevMessages, { id: prevMessages.length + 1, text: message, sender: "user" }]);
    };

    return (
        // can add "flex" to make it just fit the content
        <div className="flex flex-col h-full max-h-[95%] p-5 m-5 border rounded-2xl shadow-md shadow-black bg-gray-50 justify-between">
            <ChatHistory messages={messages} setMessages={setMessages} />
            <ChatInput onSendMessage={handleSendMessage} />
        </div>
        
    );
};

export default Chat;