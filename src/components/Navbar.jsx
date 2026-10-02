import PropTypes from "prop-types";
import Signout from "./Signout";

const Navbar = (props)=>{
    const {roomLabel, onLeaveRoom} = props;

    if (!roomLabel) return null;

    return(
        <header className="navbar">
        <h1 className="navbar__title">{ roomLabel }</h1>
        <div className="navbar__actions">
        <Signout />
        <button className="btn" onClick={onLeaveRoom}>Leave room</button>
        </div>
        </header>
    )
}

Navbar.propTypes = {
    roomLabel: PropTypes.string,
    onLeaveRoom: PropTypes.func,
}

export default Navbar;