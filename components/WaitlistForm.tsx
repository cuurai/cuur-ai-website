// components/WaitlistForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

// Initialize Firebase using environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const firestore = getFirestore(app);

const WaitlistForm = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
  };

  const handleFormSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    try {
      await addDoc(collection(firestore, "cuur-waitlist"), {
        email: email,
        timestamp: serverTimestamp(),
      });

      // Try to send email notification but do not fail the app if it does not work
      fetch("/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      }).catch((emailError) => {
        console.error("Error sending email:", emailError);
      });

      setEmail("");
      setError("");
      setShowModal(true);
    } catch (error) {
      console.error("Error adding email to the waitlist: ", error);
      setError("An error occurred. Please try again later.");
    }
  };

  const validateEmail = (email: string) => {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    router.push("/thank-you");
  };

  return (
    <div className="flex flex-col items-center justify-center py-10">
      <form
        onSubmit={handleFormSubmit}
        className="flex flex-col items-center bg-white p-6 rounded-lg shadow-md w-full max-w-md"
      >
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={handleInputChange}
          required
          className="p-2 mb-4 w-full border border-gray-300 rounded text-black"
        />
        <button
          type="submit"
          className="p-2 w-full bg-blue-500 text-white rounded hover:bg-blue-700"
        >
          Join the Waitlist
        </button>
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </form>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-lg text-center animate-fade-in">
            <h2 className="text-xl font-bold mb-4 text-black">
              Thank you for registering, you have been added to the waitlist!
            </h2>
            <p className="mb-4 text-black">
              You will be notified when the platform goes live.
            </p>
            <button
              onClick={handleCloseModal}
              className="mt-4 p-2 bg-blue-500 text-white rounded hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WaitlistForm;
