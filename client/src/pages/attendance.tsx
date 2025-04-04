import { Link, useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays, Clock, History, LogIn, LogOut } from "lucide-react";
import { formatDate, formatTime } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useState, useCallback } from "react";
import { UserRole } from "@shared/schema";

// Mock data for the attendance page
const mockAttendanceStatus = {
  clockedIn: true,
  clockedOut: false,
  record: {
    id: 1,
    userId: 1,
    clockInTime: new Date("2025-04-04T09:00:00").toISOString(),
    clockOutTime: null,
    notes: "",
    overtime: false,
    overtimeHours: 0
  }
};

const mockAttendanceRecords = [
  {
    id: 1,
    userId: 1,
    clockInTime: new Date("2025-04-04T09:00:00").toISOString(),
    clockOutTime: null,
    notes: "",
    overtime: false,
    overtimeHours: 0
  },
  {
    id: 2,
    userId: 1,
    clockInTime: new Date("2025-04-03T08:55:00").toISOString(),
    clockOutTime: new Date("2025-04-03T17:30:00").toISOString(),
    notes: "",
    overtime: false,
    overtimeHours: 0
  },
  {
    id: 3,
    userId: 1,
    clockInTime: new Date("2025-04-02T09:02:00").toISOString(),
    clockOutTime: new Date("2025-04-02T18:10:00").toISOString(),
    notes: "",
    overtime: true,
    overtimeHours: 110
  },
  {
    id: 4,
    userId: 1,
    clockInTime: new Date("2025-04-01T08:50:00").toISOString(),
    clockOutTime: new Date("2025-04-01T17:00:00").toISOString(),
    notes: "",
    overtime: false,
    overtimeHours: 0
  },
  {
    id: 5,
    userId: 1,
    clockInTime: new Date("2025-03-31T09:05:00").toISOString(),
    clockOutTime: new Date("2025-03-31T17:05:00").toISOString(),
    notes: "",
    overtime: false,
    overtimeHours: 0
  },
  {
    id: 6,
    userId: 1,
    clockInTime: new Date("2025-03-28T08:58:00").toISOString(),
    clockOutTime: new Date("2025-03-28T17:45:00").toISOString(),
    notes: "",
    overtime: false,
    overtimeHours: 0
  }
];

// Helper function to calculate duration
function calculateDuration(startDate: string, endDate?: string | null): string {
  if (!startDate) return "--";
  
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : new Date();
  
  const durationMs = end.getTime() - start.getTime();
  const hours = Math.floor(durationMs / (1000 * 60 * 60));
  const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
  
  return `${hours}h ${minutes}m`;
}

export default function Attendance() {
  const [location, navigate] = useLocation();
  const [viewAll, setViewAll] = useState(false);
  const [attendanceStatus, setAttendanceStatus] = useState(mockAttendanceStatus);
  
  // Mock user (admin for testing)
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
  
  const user = mockUser;
  
  // Filter records to show only the most recent few unless viewAll is true
  const displayedRecords = viewAll 
    ? mockAttendanceRecords 
    : mockAttendanceRecords.slice(0, 5);
  
  const handleClockIn = useCallback(() => {
    // In a real app, this would make an API call
    setAttendanceStatus({
      clockedIn: true,
      clockedOut: false,
      record: {
        ...mockAttendanceStatus.record,
        clockInTime: new Date().toISOString()
      }
    });
    alert("You've successfully clocked in!");
  }, []);
  
  const handleClockOut = useCallback(() => {
    // In a real app, this would make an API call
    setAttendanceStatus({
      ...attendanceStatus,
      clockedOut: true,
      record: {
        ...attendanceStatus.record,
        clockOutTime: new Date().toISOString()
      }
    });
    alert("You've successfully clocked out!");
  }, [attendanceStatus]);
  
  const handleNavigation = useCallback((path: string) => () => {
    navigate(path);
  }, [navigate]);
  
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <h1 
            className="text-xl font-bold cursor-pointer" 
            onClick={handleNavigation("/")}
          >
            Employee Attendance System
          </h1>
          <nav className="hidden md:flex gap-6">
            <span 
              className={`text-sm font-medium hover:text-primary transition-colors cursor-pointer ${location === "/" ? "text-primary" : ""}`}
              onClick={handleNavigation("/")}
            >
              Dashboard
            </span>
            <span 
              className={`text-sm font-medium hover:text-primary transition-colors cursor-pointer ${location === "/attendance" ? "text-primary" : ""}`}
              onClick={handleNavigation("/attendance")}
            >
              Attendance
            </span>
            <span 
              className={`text-sm font-medium hover:text-primary transition-colors cursor-pointer ${location === "/team" ? "text-primary" : ""}`}
              onClick={handleNavigation("/team")}
            >
              Team
            </span>
            <span 
              className={`text-sm font-medium hover:text-primary transition-colors cursor-pointer ${location === "/reports" ? "text-primary" : ""}`}
              onClick={handleNavigation("/reports")}
            >
              Reports
            </span>
            <span 
              className={`text-sm font-medium hover:text-primary transition-colors cursor-pointer ${location === "/users" ? "text-primary" : ""}`}
              onClick={handleNavigation("/users")}
            >
              Users
            </span>
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
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Attendance</h1>
            <p className="text-muted-foreground mt-1">
              Clock in and out to record your work hours.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Clock In/Out Card */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-primary" />
                  Clock In/Out
                </CardTitle>
                <CardDescription>
                  Use the buttons below to record your attendance for today.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center space-y-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold mb-2">
                      {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                    </div>
                    <div className="text-3xl font-bold text-primary">
                      {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <Button
                      size="lg"
                      onClick={handleClockIn}
                      disabled={attendanceStatus?.clockedIn}
                      className="flex items-center gap-2"
                    >
                      <LogIn className="h-5 w-5" />
                      Clock In
                    </Button>
                    
                    <Button
                      size="lg"
                      onClick={handleClockOut}
                      disabled={!attendanceStatus?.clockedIn || attendanceStatus?.clockedOut}
                      variant={!attendanceStatus?.clockedIn ? "outline" : "default"}
                      className="flex items-center gap-2"
                    >
                      <LogOut className="h-5 w-5" />
                      Clock Out
                    </Button>
                  </div>
                  
                  <div className="w-full max-w-md border border-border rounded-md p-4">
                    <div className="text-sm text-muted-foreground mb-2">Current Session:</div>
                    {attendanceStatus?.clockedIn ? (
                      <>
                        <div className="text-sm">
                          <span className="font-medium">Clock In Time:</span> {formatTime(attendanceStatus.record.clockInTime)}
                        </div>
                        {attendanceStatus.clockedOut && attendanceStatus.record.clockOutTime && (
                          <div className="text-sm">
                            <span className="font-medium">Clock Out Time:</span> {formatTime(attendanceStatus.record.clockOutTime)}
                          </div>
                        )}
                        <div className="text-sm">
                          <span className="font-medium">Duration:</span> {calculateDuration(
                            attendanceStatus.record.clockInTime,
                            attendanceStatus.record.clockOutTime
                          )}
                        </div>
                        <div className="text-sm mt-2">
                          {attendanceStatus.clockedOut ? (
                            <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                              Session Completed
                            </span>
                          ) : (
                            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                              Currently Working
                            </span>
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="text-sm italic">Not clocked in yet today.</div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Current Status Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CalendarDays className="h-5 w-5 mr-2 text-primary" />
                  Today's Status
                </CardTitle>
                <CardDescription>
                  Your attendance information for today.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-1">
                  <div className="text-sm font-medium text-muted-foreground">Status:</div>
                  <div className={`text-sm font-medium ${
                    attendanceStatus?.clockedIn ? "text-green-600" : "text-gray-600"
                  }`}>
                    {attendanceStatus?.clockedIn ? (
                      attendanceStatus.clockedOut ? "Completed" : "Working"
                    ) : "Not Started"}
                  </div>
                  
                  <div className="text-sm font-medium text-muted-foreground">Clock In:</div>
                  <div className="text-sm">
                    {attendanceStatus?.record?.clockInTime 
                      ? formatTime(attendanceStatus.record.clockInTime) 
                      : "--"}
                  </div>
                  
                  <div className="text-sm font-medium text-muted-foreground">Clock Out:</div>
                  <div className="text-sm">
                    {attendanceStatus?.record?.clockOutTime 
                      ? formatTime(attendanceStatus.record.clockOutTime) 
                      : "--"}
                  </div>
                  
                  <div className="text-sm font-medium text-muted-foreground">Duration:</div>
                  <div className="text-sm">
                    {attendanceStatus?.record 
                      ? calculateDuration(
                          attendanceStatus.record.clockInTime, 
                          attendanceStatus.record.clockOutTime
                        ) 
                      : "--"}
                  </div>
                  
                  <div className="text-sm font-medium text-muted-foreground">Overtime:</div>
                  <div className="text-sm">
                    {attendanceStatus?.record?.overtime ? "Yes" : "No"}
                  </div>
                </div>
                
                {attendanceStatus?.record?.overtime && (
                  <div className="text-sm p-2 bg-yellow-50 border border-yellow-200 rounded-md">
                    Your overtime is pending manager approval.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <History className="h-5 w-5 mr-2 text-primary" />
                Recent Attendance Records
              </CardTitle>
              <CardDescription>
                Your clock in/out history for the past days.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {mockAttendanceRecords.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  No attendance records found.
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Clock In</TableHead>
                        <TableHead>Clock Out</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Overtime</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {displayedRecords.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell>{formatDate(record.clockInTime)}</TableCell>
                          <TableCell>{formatTime(record.clockInTime)}</TableCell>
                          <TableCell>
                            {record.clockOutTime ? formatTime(record.clockOutTime) : "--"}
                          </TableCell>
                          <TableCell>
                            {calculateDuration(record.clockInTime, record.clockOutTime)}
                          </TableCell>
                          <TableCell>
                            {record.overtime ? (
                              <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                                {record.overtimeHours ? `${record.overtimeHours / 100}h` : "Yes"}
                              </span>
                            ) : "No"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  
                  {mockAttendanceRecords.length > 5 && (
                    <div className="mt-4 flex justify-center">
                      <Button
                        variant="outline"
                        onClick={() => setViewAll(!viewAll)}
                      >
                        {viewAll ? "Show Less" : `View All (${mockAttendanceRecords.length})`}
                      </Button>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
          
          {/* Development Note */}
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-md">
            <h3 className="font-medium text-amber-800">Development Note</h3>
            <p className="text-sm text-amber-700 mt-1">
              This is a temporary mockup of the attendance page with functional clock in/out buttons
              that update the UI state. In the complete implementation, 
              these actions will be connected to the backend APIs.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
