import Signout from "./Signout";

const Navbar = (props)=>{
    const {room} = props;
    return(
        <>
        {room ?
        <>
        <div className="navbar">
        <h1>Welcome to { room }</h1>
        <Signout />
        </div>
        
        </>
        :<h1 className="query">Enter room Name</h1>
        }

        
       
        </>
        
    )
}
export default Navbar;