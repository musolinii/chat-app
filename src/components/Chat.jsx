import { useEffect, useState } from "react";
import { addDoc, collection, onSnapshot, query, serverTimestamp , orderBy, limit} from "firebase/firestore";
import { auth, db } from "../firebase/firebase-config";
import Navbar from "./Navbar";
import TextBar from "./TextBar";
import ChatMessage from "./ChatMessage";

const Chat = (props) => {

    const { room } = props;

    const [newMessage, setNewMessage] = useState("")
    const [ messages, setMessages] = useState([]);

    const messageRef = collection(db, "messages")

    useEffect(() =>{
        const q = query(collection(db, "messages"), orderBy("createdAt"), limit(50));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const messages = [];

        querySnapshot.forEach((doc) => {
            messages.push({...doc.data(), id:doc.id});
        });
        setMessages(messages)
      });
      return () => unsubscribe
      }, [])

    const handleSubmit = async (e) => {
        e.preventDefault();


        


        if (newMessage === "") return;


        await addDoc(messageRef, {
            text: newMessage,
            createdAt: serverTimestamp(),
            user: auth.currentUser.displayName,
            room,
            dp: auth.currentUser.photoURL,
            id: auth.currentUser.email,


        })

        setNewMessage("");
    }

    return (
        <>
            <Navbar room ={room}/>
            <div className="chatbox">
            {messages.map((message)=><ChatMessage  message={message}/>)}
            </div>
            <TextBar handleSubmit = { handleSubmit } setNewMessage={ setNewMessage }/>
            
        </>

    )
}

export default Chat;