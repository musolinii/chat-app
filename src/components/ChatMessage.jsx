import PropTypes from "prop-types";

const formatTime = (ms) => {
    if (!Number.isFinite(ms)) return "";
    return new Date(ms).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const ChatMessage = (props)=>{

    const { text, dp, senderEmail, user, createdAt } = props.message;
    const { currentUser, grouped } = props;

    const isSent = senderEmail === currentUser?.email;

    const classes = ["message"];
    classes.push(isSent ? "message--sent" : "message--received");
    if (grouped) classes.push("message--grouped");

    return(
        <div className={classes.join(" ")}>
            {dp
                ? <img className="message__avatar" src={dp} alt={user || "User"} />
                : <span className="message__avatar message__avatar--empty" aria-hidden="true" />}

            <div className="message__col">
                {!grouped && (
                    <div className="message__meta">
                        {!isSent && <span className="message__author">{user || "Unknown"}</span>}
                        <span className="message__time">{formatTime(createdAt)}</span>
                    </div>
                )}
                <p className="message__bubble">{ text }</p>
            </div>
        </div>
    )
    
}

ChatMessage.propTypes = {
    message: PropTypes.shape({
        text: PropTypes.string,
        dp: PropTypes.string,
        senderEmail: PropTypes.string,
        user: PropTypes.string,
        createdAt: PropTypes.number,
    }).isRequired,
    currentUser: PropTypes.object,
    grouped: PropTypes.bool,
}

export default ChatMessage;