import { useState } from "react";
import Chat from "./components/Chat";
import Navbar from "./components/Navbar";

function App() {

  return (
    <>
      <Navbar/>

      {/* Centered Content */}
        

      <div className="flex flex-col items-center justify-center min-h-[400px] h-[100vh] ">
        <div className="SizedDiv">
          <Chat />
          
        </div>
      </div>
    </>
  );
}

export default App;
