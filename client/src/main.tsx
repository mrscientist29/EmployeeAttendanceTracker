import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { Router, Route, Switch } from "wouter";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import Dashboard from "@/pages/dashboard";
import Attendance from "@/pages/attendance";
import Records from "@/pages/records";
import TeamOverview from "@/pages/team-overview";
import Approvals from "@/pages/approvals";
import UserManagement from "@/pages/user-management";
import Settings from "@/pages/settings";
import Reports from "@/pages/reports";
import AuditLogs from "@/pages/audit-logs";
import "./index.css";

// Create a temporary simple app while we fix auth issues
const AppContent = () => (
  <div className="min-h-screen bg-background">
    <Switch>
      <Route path="/auth">
        <AuthPage />
      </Route>
      
      {/* For now, we'll use normal routes without auth protection for development */}
      <Route path="/">
        <Dashboard />
      </Route>
      <Route path="/attendance">
        <Attendance />
      </Route>
      <Route path="/records">
        <Records />
      </Route>
      <Route path="/team">
        <TeamOverview />
      </Route>
      <Route path="/approvals">
        <Approvals />
      </Route>
      <Route path="/users">
        <UserManagement />
      </Route>
      <Route path="/settings">
        <Settings />
      </Route>
      <Route path="/reports">
        <Reports />
      </Route>
      <Route path="/audit-logs">
        <AuditLogs />
      </Route>
      
      {/* Fallback to 404 */}
      <Route>
        <NotFound />
      </Route>
    </Switch>
  </div>
);

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <Router>
      <AppContent />
      <Toaster />
    </Router>
  </QueryClientProvider>
);
