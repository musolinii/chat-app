import { useState, useRef } from "react";
import Auth from "./components/Auth";
import Cookies from "universal-cookie";
import Chat from "./components/Chat";


const cookies = new Cookies();
function App() {
  const [isAuth, setIsAuth] = useState(cookies.get("auth-token"))
  const [room, setRoom] = useState(null)
  const roomInputRef = useRef(null)


  if(!isAuth){

    return (
      <>
      
      <Auth />
      
      <p>hello</p>
      
      </>
    )

  }

  return(
    <>
    {room ? 
    <Chat room ={room}/> 
    : 
    <div>
      <h1>Enter Name</h1>
      <input ref={roomInputRef}/>
      <button onClick={()=> setRoom(roomInputRef.current.value)}>Enter Chat</button>
    </div>}

    </>
  )




  
}

export default App;
