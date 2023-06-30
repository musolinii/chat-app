const TextBar = (props)=>{
    const { handleSubmit, setNewMessage } = props;

    return(
        <form onSubmit={handleSubmit} onChange={(e) => setNewMessage(e.target.value)}>
        <input  placeholder="Type your message" />
        <button type="submit">Send</button>
    </form>
    )
} 

export default TextBar;