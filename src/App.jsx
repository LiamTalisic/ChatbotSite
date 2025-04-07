import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import Chat from "./components/Chat";
import Navbar from "./components/nav/Navbar";

function MainPage({ selectedModel, setSelectedModel }) {
    const navigate = useNavigate();

    return (
        <>
            <Navbar setSelectedModel={setSelectedModel} selectedModel={selectedModel} />
            <div className="flex flex-col items-center justify-center min-h-[400px] h-[100vh] ">
                <div className="SizedDiv relative">
                    <Chat selectedModel={selectedModel} />
                </div>
            </div>
        </>
    );
}

function SecretPage() {
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-pink-100">
            <h1 className="text-4xl font-bold mb-4">Hi Nora 💖</h1>
            <p className="text-lg text-center max-w-md">You are the most amazing person, and I wanted to remind you how much I love you! 💕</p>
        </div>
    );
}

function App() {
    const [selectedModel, setSelectedModel] = useState("gpt-4o-mini");

    return (
        <Router>
            <Routes>
                <Route path="/" element={<MainPage selectedModel={selectedModel} setSelectedModel={setSelectedModel} />} />
                <Route path="/secret" element={<SecretPage />} />
            </Routes>
        </Router>
    );
}

export default App;
