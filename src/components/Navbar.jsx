import Signout from "./Signout";

const Navbar = (props)=>{
    const {room} = props;

    const home = ()=>{
        window.location.reload(false)
    }
    return(
        <>
        {room ?
        <>
        <div className="navbar">
        <h1>Welcome to { room }</h1>
        <Signout />
        <button onClick={home}>Home</button>
        </div>
        
        </>
        :<h1 className="query">Enter room Name</h1>
        }

        
       
        </>
        
    )
}
export default Navbar;