const FIREBASE_MESSAGES = {
    "permission-denied": "Firestore security rules rejected this request. Check the rules for this collection.",
    "failed-precondition": "This query needs a Firestore composite index. The browser console has a link to create it.",
    "unavailable": "Can't reach Firestore. Check your internet connection.",
    "deadline-exceeded": "Firestore took too long to respond. Try again.",
    "unauthenticated": "You need to be signed in to do that.",
    "not-found": "That room or message no longer exists.",
    "already-exists": "That already exists.",
    "resource-exhausted": "Quota exceeded. Check your Firebase billing plan.",
    "invalid-argument": "That request was malformed.",
    "aborted": "The request was aborted. Try again.",
    "cancelled": "The request was cancelled.",
    "out-of-range": "That request was out of range.",
    "unimplemented": "That Firebase feature isn't enabled yet.",
    "data-loss": "Data was lost in transit. Try again.",
    "internal": "Firebase hit an internal error. Try again later.",
    "unknown": "An unknown Firebase error occurred.",

    "auth/popup-closed-by-user": "Sign-in cancelled.",
    "auth/popup-blocked": "Your browser blocked the sign-in popup. Allow popups for this site.",
    "auth/cancelled-popup-request": "Another sign-in window is already open.",
    "auth/network-request-failed": "Network request failed. Check your connection.",
    "auth/too-many-requests": "Too many attempts. Wait a moment and try again.",
    "auth/unauthorized-domain": "This domain isn't authorised for sign-in. Add it in Firebase Console under Authentication, then Settings, then Authorised domains.",
    "auth/operation-not-allowed": "Google sign-in isn't enabled. Turn it on in Firebase Console under Authentication, then Sign-in method.",
    "auth/account-exists-with-different-credential": "That email is already linked to a different sign-in method.",
    "auth/user-disabled": "This account has been disabled.",
};

export const describeError = (err, fallback) => {
    if (!err) return null;

    const code = typeof err.code === "string" && err.code ? err.code : "unknown";

    return {
        code,
        message: FIREBASE_MESSAGES[code] || fallback || "Something went wrong.",
    };
};
