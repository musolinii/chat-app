import { useEffect, useRef, useState } from "react";
import { addDoc, collection, onSnapshot, query, orderBy, where, limit } from "firebase/firestore";
import PropTypes from "prop-types";
import { db } from "../firebase/firebase-config";
import { describeError } from "../lib/errors";
import Navbar from "./Navbar";
import TextBar from "./TextBar";
import ChatMessage from "./ChatMessage";


const messageRef = collection(db, "messages")

const Chat = (props) => {

    const { room, roomLabel, currentUser, onLeaveRoom } = props;

    const [newMessage, setNewMessage] = useState("")
    const [messages, setMessages] = useState([]);
    const [error, setError] = useState(null);
    const [loadingMessages, setLoadingMessages] = useState(true);
    const [sending, setSending] = useState(false);

    const scrollRef = useRef(null)
    const stickToBottomRef = useRef(true)

    useEffect(() => {
        setLoadingMessages(true)
        stickToBottomRef.current = true
        const q = query(
            messageRef,
            where("room", "==", room),
            orderBy("createdAt", "desc"),
            limit(50)
        );
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const nextMessages = [];

            querySnapshot.forEach((doc) => {
                nextMessages.push({ ...doc.data(), docId: doc.id });
            });
            nextMessages.reverse();
            setMessages(nextMessages)
            setLoadingMessages(false)

        }, (err) => {
            console.error(err)
            setError(describeError(err, "Could not load messages."))
            setLoadingMessages(false)
        });
        return () => unsubscribe
    }, [room])

    useEffect(() => {
        const el = scrollRef.current
        if (!el || !stickToBottomRef.current) return
        el.scrollTop = el.scrollHeight
    }, [messages])

    const handleScroll = (e) => {
        const el = e.currentTarget
        stickToBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        const text = newMessage.trim();

        if (text === "") return;

        if (!currentUser) {
            setError(describeError({ code: "unauthenticated" }, "You appear to be signed out."))
            return;
        }

        setSending(true)
        try {
            await addDoc(messageRef, {
                text,
                createdAt: Date.now(),
                user: currentUser.displayName,
                room,
                dp: currentUser.photoURL,
                senderEmail: currentUser.email,

            })

            setNewMessage("");
            setError(null);
        } catch (err) {
            console.error(err)
            setError(describeError(err, "Message failed to send."))
        } finally {
            setSending(false)
        }

    }

    const renderMessages = () => {
        if (loadingMessages) {
            return <p className="chat__status">Loading messages...</p>
        }
        if (messages.length === 0) {
            return <p className="chat__status">No messages yet. Say something!</p>
        }
        return messages.map((message, index) => {
            const previous = messages[index - 1]
            const grouped = Boolean(message.senderEmail)
                && Boolean(previous)
                && previous.senderEmail === message.senderEmail
            return (
                <ChatMessage
                    message={message}
                    currentUser={currentUser}
                    grouped={grouped}
                    key={message.docId}
                />
            )
        })
    }

    return (
        <div className="chat">
            <Navbar roomLabel={roomLabel} onLeaveRoom={onLeaveRoom} />
            {error && (
                <div className="alert chat__alert" role="alert">
                    <span>{error.message}</span>
                    <code className="alert__code">{error.code}</code>
                </div>
            )}
            <div
                className="chat__scroll"
                ref={scrollRef}
                onScroll={handleScroll}
                aria-live="polite"
            >
                {renderMessages()}
            </div>
            <TextBar
                handleSubmit={handleSubmit}
                setNewMessage={setNewMessage}
                newMessage={newMessage}
                sending={sending}
            />

        </div>

    )
}

Chat.propTypes = {
    room: PropTypes.string.isRequired,
    roomLabel: PropTypes.string,
    currentUser: PropTypes.object,
    onLeaveRoom: PropTypes.func.isRequired,
}

export default Chat;
