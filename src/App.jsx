import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Chat from "./components/Chat";
import Navbar from "./components/nav/Navbar";

function MainPage({ selectedModel, setSelectedModel }) {
    return (
        <>
            <Navbar setSelectedModel={setSelectedModel} selectedModel={selectedModel} />
            <div className="flex flex-col items-center justify-center min-h-[400px] h-[100vh]">
                <div className="SizedDiv">
                    <Chat selectedModel={selectedModel} />
                </div>
            </div>
        </>
    );
}

function App() {
    const [selectedModel, setSelectedModel] = useState("gpt-4o-mini");

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<MainPage selectedModel={selectedModel} setSelectedModel={setSelectedModel} />} />
                <Route path="/secret" element={<Navigate to="/index2.html" replace />} />
                {/* Optional catch-all route */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
