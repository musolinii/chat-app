import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase/firebase-config";
import Auth from "./components/Auth";
import Chat from "./components/Chat";
import './App.css'

function App() {
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [roomInput, setRoomInput] = useState("")
  const [room, setRoom] = useState(null)
  const [roomLabel, setRoomLabel] = useState(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser)
      setAuthLoading(false)
      if (!nextUser) {
        setRoom(null)
        setRoomLabel(null)
      }
    })
    return unsubscribe
  }, [])

  if (authLoading) {
    return <div className="loading">Loading...</div>
  }

  if (!user) {
    return <Auth />
  }

  const joinRoom = (e) => {
    e.preventDefault()
    const label = roomInput.trim()
    if (label === "") return
    setRoom(label.toLowerCase())
    setRoomLabel(label)
  }

  const leaveRoom = () => {
    setRoom(null)
    setRoomLabel(null)
  }

  return(
    <div className="app-shell">
    {room ?
    <Chat room ={room} roomLabel ={roomLabel} currentUser ={user} onLeaveRoom ={leaveRoom}/>
    :
    <div className="room">
      <form className="room__card" onSubmit={joinRoom}>
      <h1 className="room__title">Join a room</h1>
      <div className="room__row">
        <input
          className="room__input"
          placeholder="Room name"
          value={roomInput}
          onChange={(e) => setRoomInput(e.target.value)}
          aria-label="Room name"
        />
        <button className="btn btn--primary" type="submit">Enter Chat</button>
      </div>
      </form>
    </div>}


    </div>
  )




  
}

export default App;
