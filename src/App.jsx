import { useState } from 'react'

import Chat from './components/Chat'
import Login from './components/Login'




function App() {

    return (
        <>
            {/* div thats aligned to the center */}
            <div className="flex flex-col w-full h-[100vh] items-center justify-center  min-h-[400px]">
                <div className="SizedDiv">
                    <Login/>
                    <Chat/>

                </div>
            </div>
        </>
    )
}

export default App
