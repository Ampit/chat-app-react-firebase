import React, { useEffect, useRef, useState } from "react";
import "./App.css";
import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";

import { useAuthState } from "react-firebase-hooks/auth";
import { useCollectionData } from "react-firebase-hooks/firestore";

try {
    firebase.initializeApp({
        apiKey: "AIzaSyCNqNK1tBFr-lv4GtLIRM4rVFr-s4CJVCs",
        authDomain: "chat-app-b6f5e.firebaseapp.com",
        databaseURL: "https://chat-app-b6f5e.firebaseio.com",
        projectId: "chat-app-b6f5e",
        storageBucket: "chat-app-b6f5e.appspot.com",
        messagingSenderId: "376696276321",
        appId: "1:376696276321:web:eca8e9fc373239fa653120",
        measurementId: "G-2X4MRD04HF",
    });
} catch (err) {
    if (!/already exists/.test(err.message)) {
        console.error("Firebase initialization error raised", err.stack);
    }
}

const auth = firebase.auth();
const firestore = firebase.firestore();

function App() {
    const [user] = useAuthState(auth);

    return (
        <div className="App">
            <header>
                <h1>⚛️💬</h1>
                <SignOut />
            </header>

            <section>{user ? <ChatRoom /> : <SignIn />}</section>
        </div>
    );
}

function SignIn() {
    const signInWithGoogle = () => {
        const provider = new firebase.auth.GoogleAuthProvider();
        auth.signInWithPopup(provider);
    };

    return <button onClick={signInWithGoogle}>Sign in with Google</button>;
}
function SignOut() {
    return (
        auth.currentUser && (
            <button onClick={() => auth.signOut()}>Sign Out</button>
        )
    );
}
function ChatRoom() {
    const messagesRef = firestore.collection("messages");
    const query = messagesRef.orderBy("createdAt").limitToLast(25);
    const dummy = useRef();
    const [messages] = useCollectionData(query, { idField: "id" });

    useEffect(() => {
        dummy.current.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const [formValue, setFormValue] = useState("");

    const sendMessage = async e => {
        e.preventDefault();

        const { uid, photoURL } = auth.currentUser;

        await messagesRef.add({
            text: formValue,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            uid,
            photoURL,
        });

        setFormValue("");
    };

    return (
        <>
            <main>
                {messages &&
                    messages.map(msg => (
                        <ChatMessage key={msg.id} message={msg} />
                    ))}

                <span ref={dummy}></span>
            </main>

            <form onSubmit={sendMessage}>
                <input
                    value={formValue}
                    onChange={e => setFormValue(e.target.value)}
                    placeholder="say something nice"
                />

                <button type="submit" disabled={!formValue}>
                    🕊️
                </button>
            </form>
        </>
    );
}
function ChatMessage(props) {
    const { text, uid, photoURL } = props.message;

    const messageClass = uid === auth.currentUser.uid ? "sent" : "received";

    return (
        <>
            <div className={`message ${messageClass}`}>
                <img
                    alt={text}
                    src={
                        photoURL ||
                        "https://api.adorable.io/avatars/23/abott@adorable.png"
                    }
                />
                <p>{text}</p>
            </div>
        </>
    );
}

export default App;
