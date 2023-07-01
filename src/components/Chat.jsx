import { useEffect, useState } from "react";
import { addDoc, collection, onSnapshot, query, orderBy, where, limit } from "firebase/firestore";
import { auth, db } from "../firebase/firebase-config";
import Navbar from "./Navbar";
import TextBar from "./TextBar";
import ChatMessage from "./ChatMessage";


const Chat = (props) => {

    const { room } = props;

    const [newMessage, setNewMessage] = useState("")
    const [messages, setMessages] = useState([]);

    const messageRef = collection(db, "messages")
    // const q = query(messageRef, where("room", "==", room) ,limit(50));

    useEffect(() => {
        const q = query(
            messageRef,
            where("room", "==", room),
            orderBy("createdAt"),
            limit(50)
        );
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const messages = [];

            querySnapshot.forEach((doc) => {
                messages.push({ ...doc.data(), id: doc.id });
            });
            setMessages(messages)

        });
        return () => unsubscribe
    }, [messageRef, room])

    const handleSubmit = async (e) => {
        e.preventDefault();





        if (newMessage === "") return;


        await addDoc(messageRef, {
            text: newMessage,
            createdAt: Date.now(),
            user: auth.currentUser.displayName,
            room,
            dp: auth.currentUser.photoURL,
            id: auth.currentUser.email,


        })

        setNewMessage("");
    }

    return (
        <>
            <Navbar room={room} />
            <div className="chatbox">
                {messages && messages.map((message, index) => <ChatMessage message={message} key={index} />)}
            </div>
            <TextBar handleSubmit={handleSubmit} setNewMessage={setNewMessage} />

        </>

    )
}

export default Chat;
