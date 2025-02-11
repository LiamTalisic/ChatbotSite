import { useState } from "react";
import Chat from "./components/Chat";
import Navbar from "./components/Navbar";

function App() {

  return (
    <>
      <Navbar/>

      {/* Centered Content */}
      <div className="flex flex-col w-full h-[90vh] items-center justify-center min-h-[400px]">
        <div className="SizedDiv">
          <Chat />
          
        </div>
      </div>
    </>
  );
}

export default App;
