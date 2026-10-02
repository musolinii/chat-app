import PropTypes from "prop-types";

const TextBar = (props)=>{
    const { handleSubmit, setNewMessage, newMessage, sending } = props;

    const canSend = newMessage.trim() !== "" && !sending;

    return(
        <div className="composer">
        <form className="composer__form" onSubmit={handleSubmit}>
        <input
            className="composer__input"
            placeholder="Type your message"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            aria-label="Message"
            disabled={sending}
        />
        <button
            className="btn btn--primary composer__send"
            type="submit"
            disabled={!canSend}
            aria-label="Send message"
            title="Send (Enter)"
        >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
                <path d="M2.01 21 23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
        </button>
        </form>
        <p className="composer__hint">Press Enter to send</p>
    </div>
    )
} 

TextBar.propTypes = {
    handleSubmit: PropTypes.func.isRequired,
    setNewMessage: PropTypes.func.isRequired,
    newMessage: PropTypes.string.isRequired,
    sending: PropTypes.bool,
}

export default TextBar;