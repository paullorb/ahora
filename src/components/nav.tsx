import Auth from "./auth";

import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs'
import styles from "./nav.module.css";

export default function Nav() {
  return (
    <nav className={styles.container}>
      <h1 className={styles.logo}>Ahora</h1>
        {/* <Auth /> */}

´     <SignedOut>
        <SignInButton />
        <SignUpButton>
          <button className="bg-[#6c47ff] text-white rounded-full font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 cursor-pointer">
          Sign Up
          </button>
        </SignUpButton>
      </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
    </nav>
  );
}