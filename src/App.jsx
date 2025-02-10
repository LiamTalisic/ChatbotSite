import { useState } from "react";
import Chat from "./components/Chat";
import Navbar from "./components/Navbar";
import ImageGenerator from "./components/ImageGenerator";

function App() {
  const [showComponent, setShowComponent] = useState("chat"); // Default view

  return (
    <>
      <Navbar setShowComponent={setShowComponent} />

      {/* Centered Content */}
      <div className="flex flex-col w-full h-[100vh] items-center justify-center min-h-[400px]">
        <div className="SizedDiv">
          {showComponent === "chat" && <Chat />}
          {showComponent === "users" && <ImageGenerator />}
        </div>
      </div>
    </>
  );
}

export default App;
