import { createContext, useContext, useState, ReactNode } from "react";
import {
  signInWithEmailAndPassword,
  signOut,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword
} from "firebase/auth";
import { auth } from "@/firebase";

interface AuthContextType {
  isLoggedIn: boolean;
  user: { username: string } | null;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  changePassword: (
    username: string,
    oldPassword: string,
    newPassword: string
  ) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<{ username: string } | null>(null);

  // 🔐 LOGIN
  const login = async (username: string, password: string) => {
    try {
      const email = `${username}@gmail.com`;

      await signInWithEmailAndPassword(auth, email, password);

      setIsLoggedIn(true);
      setUser({ username });

      return { success: true };
    } catch (error) {
      console.error(error);
      return { success: false, error: "Invalid username or password" };
    }
  };

  // 🔓 LOGOUT
  const logout = async () => {
    await signOut(auth);
    setIsLoggedIn(false);
    setUser(null);
  };

  // 🔁 CHANGE PASSWORD (FINAL FIX)
  const changePassword = async (
    username: string,
    oldPassword: string,
    newPassword: string
  ) => {
    try {
      const currentUser = auth.currentUser;

      if (!currentUser || !currentUser.email) {
        return { success: false, error: "User not logged in" };
      }

      console.log("Logged user:", currentUser.email);
      console.log("Entered old password:", oldPassword);

      // 🔥 RE-AUTH WITH CURRENT USER EMAIL (IMPORTANT)
      const credential = EmailAuthProvider.credential(
        currentUser.email,
        oldPassword
      );

      await reauthenticateWithCredential(currentUser, credential);

      // 🔥 UPDATE PASSWORD
      await updatePassword(currentUser, newPassword);

      return { success: true };

    } catch (error: any) {
      console.error("Password change error:", error.code, error.message);

      return {
        success: false,
        error:
          error.code === "auth/wrong-password"
            ? "Current password is incorrect"
            : "Something went wrong",
      };
    }
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, login, logout, changePassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);