import { useState, useRef } from "react";
import Auth from "./components/Auth";
import Cookies from "universal-cookie";
import Chat from "./components/Chat";
import Navbar from "./components/Navbar";
import './App.css'

export const cookies = new Cookies();

function App() {
  const [isAuth, setIsAuth] = useState(cookies.get("auth-token"))
  const [room, setRoom] = useState(null)
  const roomInputRef = useRef(null)


  if(!isAuth){

    return (
      <>
      
      <Auth />
      
      </>
    )

  }

  return(
    <div className="main-container">
    {room ? 
    <Chat room ={room}/> 
    : 
    <div>
      <Navbar room = { room }/>
      <input ref={roomInputRef}/>
      <button className="btn" onClick={()=> setRoom(roomInputRef.current.value)}>Enter Chat</button>
    </div>}
    

    </div>
  )




  
}

export default App;
