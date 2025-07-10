import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { AuthState, User, UserPreferences } from "@/lib/types";

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  register: (userData: RegisterData) => Promise<void>;
  updatePreferences: (preferences: Partial<UserPreferences>) => void;
}

interface LoginCredentials {
  username: string;
  password: string;
  pin?: string;
}

interface RegisterData {
  username: string;
  password: string;
  pin?: string;
  email?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    isLoading: true,
  });

  useEffect(() => {
    // Check for existing session
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      // For demo purposes, check localStorage
      const savedUser = localStorage.getItem("diary_user");
      const savedAuth = localStorage.getItem("diary_auth");

      if (savedUser && savedAuth === "authenticated") {
        const user: User = JSON.parse(savedUser);
        setAuthState({
          isAuthenticated: true,
          user,
          isLoading: false,
        });
      } else {
        setAuthState((prev) => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setAuthState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const login = async (credentials: LoginCredentials) => {
    try {
      // For demo purposes, create a user session
      const user: User = {
        id: "1",
        username: credentials.username,
        preferences: {
          theme: "system",
          fontSize: "medium",
          reminderEnabled: true,
          autoLock: true,
          autoLockDelay: 5,
          biometricEnabled: false,
          backupEnabled: false,
        },
        createdAt: new Date().toISOString(),
      };

      localStorage.setItem("diary_user", JSON.stringify(user));
      localStorage.setItem("diary_auth", "authenticated");

      setAuthState({
        isAuthenticated: true,
        user,
        isLoading: false,
      });
    } catch (error) {
      console.error("Login failed:", error);
      throw new Error("Login failed");
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      // For demo purposes, create a new user
      const user: User = {
        id: Date.now().toString(),
        username: userData.username,
        email: userData.email,
        preferences: {
          theme: "system",
          fontSize: "medium",
          reminderEnabled: true,
          autoLock: true,
          autoLockDelay: 5,
          biometricEnabled: false,
          backupEnabled: false,
        },
        createdAt: new Date().toISOString(),
      };

      localStorage.setItem("diary_user", JSON.stringify(user));
      localStorage.setItem("diary_auth", "authenticated");

      setAuthState({
        isAuthenticated: true,
        user,
        isLoading: false,
      });
    } catch (error) {
      console.error("Registration failed:", error);
      throw new Error("Registration failed");
    }
  };

  const logout = () => {
    localStorage.removeItem("diary_user");
    localStorage.removeItem("diary_auth");
    localStorage.removeItem("diary_entries");

    setAuthState({
      isAuthenticated: false,
      user: null,
      isLoading: false,
    });
  };

  const updatePreferences = (preferences: Partial<UserPreferences>) => {
    if (authState.user) {
      const updatedUser = {
        ...authState.user,
        preferences: { ...authState.user.preferences, ...preferences },
      };

      localStorage.setItem("diary_user", JSON.stringify(updatedUser));
      setAuthState((prev) => ({ ...prev, user: updatedUser }));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        logout,
        register,
        updatePreferences,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
