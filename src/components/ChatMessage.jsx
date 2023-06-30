import { useState } from "react";
import { auth } from "../firebase/firebase-config";

const ChatMessage = (props)=>{

    // const [ mess, setMess ] = useState("")  
    const { text, dp, id } = props.message;

    const messageClass = id === auth.currentUser.email ? 'sent' : 'received';

    return(
        <div className={`messagebox ${messageClass}`}>
            <img src={dp} alt="Photo" />

            <p>{ text }</p>
        </div>
    )
    
}

export default ChatMessage;