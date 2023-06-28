import { useEffect, useState } from "react";
import { addDoc, collection, onSnapshot, query, serverTimestamp , orderBy, limit} from "firebase/firestore";
import { auth, db } from "../firebase/firebase-config";

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


        })

        setNewMessage("");
    }

    return (
        <>
            <div>{messages.map((message)=><p>{message.user}:{message.text}</p>)}</div>

            <form onSubmit={handleSubmit} onChange={(e) => setNewMessage(e.target.value)}>
                <input  placeholder="Type your message" />
                <button type="submit">Send</button>
            </form>
        </>

    )
}

export default Chat;