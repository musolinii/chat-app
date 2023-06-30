import {auth, provider} from "../firebase/firebase-config";
import { signInWithPopup } from "firebase/auth";

import Cookies from "universal-cookie";

const cookies = new Cookies();

const Auth = ()=>{
    const signInWithGoogle = async()=>{

        try {
            const result = await signInWithPopup(auth, provider);
            cookies.set("auth-token",result.user.refreshToken)
            
            
        } catch (err) {
            console.error(err)
            
        }
        

    }
    return(
        <div className="login">
        <h1>Sign in with Google</h1>
        <button onClick={signInWithGoogle}>Sign in</button>
        </div>
    )
}

export default Auth;