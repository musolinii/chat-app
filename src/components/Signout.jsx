import { signOut } from "firebase/auth";
import { cookies } from "../App";
import { auth } from "../firebase/firebase-config";

const Signout = ()=>{

    const signout = async()=>{
        await signOut(auth);
        cookies.remove("auth-token");
        window.location.reload(false)

    }

    return(
        <button onClick={ signout }>Signout</button>
    )
}

export default Signout;