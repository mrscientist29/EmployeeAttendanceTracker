import { createContext, ReactNode, useContext, useState, useEffect } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { User, InsertUser, LoginData } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type AuthContextType = {
  user: Omit<User, "password"> | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<Omit<User, "password">, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<Omit<User, "password">, Error, InsertUser>;
};

export const AuthContext = createContext<AuthContextType | null>(null);

// Create a simple mock user for testing - We'll remove this in production
const mockUser = {
  id: 1,
  username: "admin",
  firstName: "Admin",
  lastName: "User",
  email: "admin@example.com",
  department: "IT",
  role: "admin",
  isActive: true
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  // For now we're using a mock user - in a production app, this would come from the API
  const [mockState, setMockState] = useState({
    user: mockUser, // Start with a mock user for testing
    isLoading: false,
    error: null
  });
  
  // You can uncomment this to use the real API
  /*
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<Omit<User, "password"> | null>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });
  */

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      // For testing, return the mock user without making an API call
      // In production, this would make a real API call
      return mockUser;
      
      /* Real implementation for production:
      const res = await apiRequest("POST", "/api/login", credentials);
      return await res.json();
      */
    },
    onSuccess: (user) => {
      // Update our mock state
      setMockState(prev => ({ ...prev, user }));
      
      // In production, update the query cache
      // queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "Login successful",
        description: `Welcome back, ${user.firstName}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (userData: InsertUser) => {
      // Return mock data for testing
      return {
        ...mockUser,
        ...userData,
      };
      
      /* Real implementation for production:
      const res = await apiRequest("POST", "/api/register", userData);
      return await res.json();
      */
    },
    onSuccess: (user) => {
      // Update our mock state
      setMockState(prev => ({ ...prev, user }));
      
      // In production, update the query cache
      // queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "Registration successful",
        description: `Welcome, ${user.firstName}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      // For testing - just a mock function
      // In production, this would make a real API call
      return;
      
      /* Real implementation for production:
      await apiRequest("POST", "/api/logout");
      */
    },
    onSuccess: () => {
      // Update our mock state
      setMockState(prev => ({ ...prev, user: null }));
      
      // In production, update the query cache
      // queryClient.setQueryData(["/api/user"], null);
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: mockState.user,
        isLoading: mockState.isLoading,
        error: mockState.error as Error,
        loginMutation,
        logoutMutation,
        registerMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
