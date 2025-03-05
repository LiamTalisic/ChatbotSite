import { useState } from "react";
import Chat from "./components/Chat";
import Navbar from "./components/nav/Navbar";

function App() {
    const [selectedModel, setSelectedModel] = useState("gpt-4o-mini");

    return (
        <>
            <Navbar setSelectedModel={setSelectedModel} selectedModel={selectedModel} />

            {/* Centered Content */}

            <div className="flex flex-col items-center justify-center min-h-[400px] h-[100vh] ">
                <div className="SizedDiv">
                    <Chat selectedModel={selectedModel} />
                </div>
            </div>
        </>
    );
}

export default App;
