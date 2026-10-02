import { useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/firebase-config";
import { describeError } from "../lib/errors";

const Signout = ()=>{

    const [error, setError] = useState(null)

    const signout = async()=>{
        try {
            await signOut(auth);
        } catch (err) {
            console.error(err)
            setError(describeError(err, "Sign-out failed."))
        }
    }

    if (error) {
        return (
            <span className="navbar__alert" role="alert">
                <span>{error.message}</span>
                <code className="alert__code">{error.code}</code>
            </span>
        )
    }

    return(
        <button className="btn" onClick={ signout }>Sign out</button>
    )
}

export default Signout;