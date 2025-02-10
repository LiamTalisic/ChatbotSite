import { useState } from 'react'

import Chat from './components/Chat'

function App() {

    return (
        <>
            {/* div thats aligned to the center */}
            <div className="flex flex-col w-full h-[100vh] items-center justify-center  min-h-[400px]">
                <div className="SizedDiv">
                    
                    <Chat/>

                </div>
            </div>
        </>
    )
}

export default App
