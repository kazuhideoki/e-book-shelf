import { User } from "@firebase/auth";
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { Env } from "./front-env";

console.log({ config: process.env.NEXT_PUBLIC_FIREBASE_CONFIG! });

const app = initializeApp(Env.NEXT_PUBLIC_FIREBASE_CONFIG);

export const FrontAuth = getAuth(app);

export class FrontFirebaseHelper {
  static listenFirebaseAuth(setAuth: (credential: User) => void) {
    if (typeof (window as any) === "undefined") return;

    const unsubscribe = FrontAuth.onAuthStateChanged(
      async (user) => {
        if (!user) {
          console.log("User not signedin!");
          try {
            await signInWithPopup(FrontAuth, new GoogleAuthProvider());
          } catch (error) {
            console.log({ error });
          }
          return;
        }
        console.log("User is signin");
        console.log({ user });

        setAuth(user);
      },
      (error) => {}
    );

    return () => {
      unsubscribe();
    };
  }
}
