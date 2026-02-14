"use client";

import styles from "./auth.module.css";
import { useState } from "react";  
import SignupForm from "@/app/ui/signup-form";

export default function Auth() {
  const [showSignup, setShowSignup] = useState(false);

  return (
    <div className={styles.container}>
      <button>Login</button>
      <button onClick={() => setShowSignup(true)}>Sign Up</button>
      {showSignup && 
      <div>
        <button className={styles.closeButton} onClick={() => setShowSignup(false)}>x</button>
        <SignupForm /> 
      </div>}
    </div>
  )
}