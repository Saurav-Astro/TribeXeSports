
'use client';
import {
  Auth,
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  User,
  GoogleAuthProvider,
  signInWithRedirect,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { getSdks } from '@/firebase';

/** Initiate anonymous sign-in (non-blocking). */
export function initiateAnonymousSignIn(authInstance: Auth): void {
  signInAnonymously(authInstance);
}

export async function signUpWithEmail(auth: Auth, email: string, password: string, username: string): Promise<void> {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  
  // Update Firebase Auth profile
  await updateProfile(user, { displayName: username });

  // Also create a document in the 'users' collection in Firestore
  const { firestore } = getSdks(auth.app);
  const userDocRef = doc(firestore, "users", user.uid);
  
  // Use setDoc with merge:true to create or update the user document
  await setDoc(userDocRef, {
    uid: user.uid,
    username: username,
    email: user.email,
    photoURL: user.photoURL, // Initially null
    bio: '', // Initial empty bio
  }, { merge: true });
}

/** Initiate email/password sign-in (non-blocking). */
export function signInWithEmail(auth: Auth, email: string, password: string): Promise<void> {
  return signInWithEmailAndPassword(auth, email, password).then(() => {});
}

export function initiateGoogleSignIn(auth: Auth): void {
    const provider = new GoogleAuthProvider();
    signInWithRedirect(auth, provider);
}

export async function updateUserProfile(user: User, profileData: { displayName?: string, photoURL?: string }): Promise<void> {
    await updateProfile(user, profileData);

    // Also update the document in the 'users' collection in Firestore
    const { firestore } = getSdks(user.app);
    const userDocRef = doc(firestore, "users", user.uid);
    
    // Create an update object with only the fields that are being changed.
    const updateData: { [key: string]: any } = {};
    if (profileData.displayName) {
        updateData.username = profileData.displayName;
    }
    if (profileData.photoURL) {
        updateData.photoURL = profileData.photoURL;
    }

    // Use setDoc with merge:true to update the user document
    if (Object.keys(updateData).length > 0) {
        await setDoc(userDocRef, updateData, { merge: true });
    }
}
