import { useState } from "react";
import { signInWithPopup } from "firebase/auth";
import {auth, provider} from "../firebase/firebase-config";
import { describeError } from "../lib/errors";

const Auth = ()=>{
    const [error, setError] = useState(null)

    const signInWithGoogle = async()=>{

        try {
            await signInWithPopup(auth, provider);
        } catch (err) {
            console.error(err)
            setError(describeError(err, "Sign-in failed."))
        }


    }
    return(
        <div className="auth">
        <div className="auth__card">
        <h1 className="auth__title">Sign in with Google</h1>
        {error && (
            <div className="alert auth__alert" role="alert">
                <span>{error.message}</span>
                <code className="alert__code">{error.code}</code>
            </div>
        )}
        <button className="btn btn--primary" onClick={signInWithGoogle}>Sign in</button>
        </div>
        </div>
    )
}

export default Auth;