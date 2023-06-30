import Signout from "./Signout";

const Navbar = (props)=>{
    const {room} = props;
    return(
        <>
        {room ?
        <>
        <h1>Welcome to { room }</h1>
        <Signout />
        </>
        :<h1 className="query">Enter room Name</h1>
        }

        
       
        </>
        
    )
}
export default Navbar;