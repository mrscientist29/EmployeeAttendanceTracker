import { Switch, Route } from "wouter";
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
import { ProtectedRoute } from "@/lib/protected-route";

function App() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      
      {/* Dashboard Routes */}
      <ProtectedRoute path="/" component={Dashboard} />
      <ProtectedRoute path="/attendance" component={Attendance} />
      <ProtectedRoute path="/records" component={Records} />
      
      {/* Manager and Admin Routes - role checking done in components */}
      <ProtectedRoute path="/team" component={TeamOverview} />
      <ProtectedRoute path="/approvals" component={Approvals} />
      
      {/* Admin-only Routes - role checking done in components */}
      <ProtectedRoute path="/users" component={UserManagement} />
      <ProtectedRoute path="/settings" component={Settings} />
      <ProtectedRoute path="/reports" component={Reports} />
      <ProtectedRoute path="/audit-logs" component={AuditLogs} />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

export default App;
