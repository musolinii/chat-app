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
        <>
        <p>Sign in with Google</p>
        <button onClick={signInWithGoogle}>Sign in</button>
        </>
    )
}

export default Auth;