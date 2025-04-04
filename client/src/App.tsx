import { Switch, Route, useLocation } from "wouter";
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
import { useAuth } from "@/hooks/use-auth"; 
import { Loader2 } from "lucide-react";
import { Redirect } from "wouter";
import { UserRole } from "@shared/schema";

// Create a custom ProtectedRoute component with role-based access control
function ProtectedRoute({ 
  component: Component, 
  requiredRoles = [] 
}: { 
  component: React.ComponentType,
  requiredRoles?: UserRole[] 
}) {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!user) {
    return <Redirect to="/auth" />;
  }
  
  // If roles are specified, check if user has required role
  if (requiredRoles.length > 0 && !requiredRoles.includes(user.role as UserRole)) {
    return <Redirect to="/" />;
  }
  
  return <Component />;
}

function App() {
  return (
    <div className="min-h-screen bg-background">
      <Switch>
        <Route path="/auth">
          <AuthPage />
        </Route>
        
        {/* Dashboard Routes - All users */}
        <Route path="/">
          {() => <ProtectedRoute component={Dashboard} />}
        </Route>
        <Route path="/attendance">
          {() => <ProtectedRoute component={Attendance} />}
        </Route>
        <Route path="/records">
          {() => <ProtectedRoute component={Records} />}
        </Route>
        
        {/* Manager and Admin Routes */}
        <Route path="/team">
          {() => <ProtectedRoute 
            component={TeamOverview} 
            requiredRoles={[UserRole.MANAGER, UserRole.ADMIN]} 
          />}
        </Route>
        <Route path="/approvals">
          {() => <ProtectedRoute 
            component={Approvals} 
            requiredRoles={[UserRole.MANAGER, UserRole.ADMIN]} 
          />}
        </Route>
        
        {/* Admin-only Routes */}
        <Route path="/users">
          {() => <ProtectedRoute 
            component={UserManagement} 
            requiredRoles={[UserRole.ADMIN]} 
          />}
        </Route>
        <Route path="/settings">
          {() => <ProtectedRoute 
            component={Settings} 
            requiredRoles={[UserRole.ADMIN]} 
          />}
        </Route>
        <Route path="/reports">
          {() => <ProtectedRoute 
            component={Reports} 
            requiredRoles={[UserRole.ADMIN]} 
          />}
        </Route>
        <Route path="/audit-logs">
          {() => <ProtectedRoute 
            component={AuditLogs} 
            requiredRoles={[UserRole.ADMIN]} 
          />}
        </Route>
        
        {/* Fallback to 404 */}
        <Route>
          <NotFound />
        </Route>
      </Switch>
    </div>
  );
}

export default App;
