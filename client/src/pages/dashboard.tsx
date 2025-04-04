import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserRole } from "@shared/schema";

// Temporary mock user for development
const mockUser = {
  id: 1,
  username: "admin",
  firstName: "Admin",
  lastName: "User",
  email: "admin@example.com",
  department: "IT",
  role: UserRole.ADMIN,
  isActive: true
};

export default function Dashboard() {
  // For demonstration, we're using a mock user while we fix the auth
  const user = mockUser;
  const isManager = user?.role === UserRole.MANAGER || user?.role === UserRole.ADMIN;
  
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-xl font-bold">Employee Attendance System</h1>
          <nav className="hidden md:flex gap-6">
            <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">
              Dashboard
            </Link>
            <Link href="/attendance" className="text-sm font-medium hover:text-primary transition-colors">
              Attendance
            </Link>
            <Link href="/team" className="text-sm font-medium hover:text-primary transition-colors">
              Team
            </Link>
            <Link href="/reports" className="text-sm font-medium hover:text-primary transition-colors">
              Reports
            </Link>
            {isManager && (
              <Link href="/users" className="text-sm font-medium hover:text-primary transition-colors">
                Users
              </Link>
            )}
          </nav>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium hidden md:inline-block">
              {user.firstName} {user.lastName}
            </span>
            <Button variant="outline" size="sm">
              Log Out
            </Button>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {isManager ? "Admin Dashboard" : "Employee Dashboard"}
              </h1>
              <p className="text-muted-foreground mt-1">
                {isManager 
                  ? "Manage employee attendance, approvals, and system settings." 
                  : "Track your work hours and view attendance records."}
              </p>
            </div>
            
            <div className="flex gap-2">
              {isManager ? (
                <>
                  <Button variant="outline" size="sm">Export Reports</Button>
                  <Button size="sm">Manage Users</Button>
                </>
              ) : (
                <>
                  <Button variant="outline" size="sm">View History</Button>
                  <Button size="sm">Clock In/Out</Button>
                </>
              )}
            </div>
          </div>
          
          {/* Dashboard Cards - Mock Data */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {isManager ? (
              // Manager/Admin dashboard cards
              <>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">15</div>
                    <p className="text-xs text-muted-foreground">+3.1% from last month</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Present Today</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">12</div>
                    <p className="text-xs text-muted-foreground">80% attendance rate</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">3</div>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <Button size="sm" variant="ghost" asChild>
                      <Link href="/approvals">View all</Link>
                    </Button>
                  </CardFooter>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Overtime Hours</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">24.5</div>
                    <p className="text-xs text-muted-foreground">This week</p>
                  </CardContent>
                </Card>
              </>
            ) : (
              // Employee dashboard cards
              <>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Today's Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">Present</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Clock In Time</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">09:00 AM</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Clock Out Time</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">--</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Today's Duration</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">3h 15m</div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
          
          {/* Activity Feed */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest actions and updates in the system</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 mt-2 rounded-full bg-green-500"></div>
                  <div>
                    <p className="font-medium">John Smith clocked in</p>
                    <p className="text-sm text-muted-foreground">Today at 09:15 AM</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 mt-2 rounded-full bg-red-500"></div>
                  <div>
                    <p className="font-medium">Maria Garcia clocked out</p>
                    <p className="text-sm text-muted-foreground">Today at 09:02 AM</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 mt-2 rounded-full bg-blue-500"></div>
                  <div>
                    <p className="font-medium">Robert Johnson requested overtime approval</p>
                    <p className="text-sm text-muted-foreground">Yesterday at 05:45 PM</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Note about Mock Data */}
          {isManager && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-md">
              <h3 className="font-medium text-amber-800">Development Note</h3>
              <p className="text-sm text-amber-700 mt-1">
                This is a mockup version of the dashboard with static data. In the complete implementation, 
                this will be connected to the backend APIs and real-time data.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
