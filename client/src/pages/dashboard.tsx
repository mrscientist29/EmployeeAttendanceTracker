import { Link, useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserRole } from "@shared/schema";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Users, Clock, CalendarCheck, AlertTriangle, Download, UserPlus, History, LogIn, LogOut } from "lucide-react";
import { format, differenceInSeconds } from 'date-fns';
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { DateRange } from "react-day-picker";
import { saveAs } from 'file-saver';

// API fetch functions
const fetchDashboardStats = async () => {
  const res = await fetch("/api/stats/dashboard");
  if (!res.ok) throw new Error("Failed to fetch dashboard stats");
  return res.json();
};

const fetchAttendanceStatus = async () => {
  const res = await fetch("/api/attendance/status");
  if (!res.ok) throw new Error("Failed to fetch attendance status");
  return res.json();
};

const clockIn = async () => {
  const res = await fetch("/api/attendance/clock-in", { method: "POST" });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Failed to clock in");
  }
  return res.json();
};

const clockOut = async () => {
  const res = await fetch("/api/attendance/clock-out", { method: "POST" });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Failed to clock out");
  }
  return res.json();
};

const exportAttendance = async (dateRange: DateRange) => {
  const res = await fetch(`/api/export/attendance?start=${dateRange.from?.toISOString()}&end=${dateRange.to?.toISOString()}`);
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Failed to export attendance data");
  }
  const blob = await res.blob();
  saveAs(blob, `attendance_${format(dateRange.from!, 'yyyy-MM-dd')}_${format(dateRange.to!, 'yyyy-MM-dd')}.csv`);
};


export default function Dashboard() {
  const [location, navigate] = useLocation();
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const isManager = user ? (user.role === UserRole.MANAGER || user.role === UserRole.ADMIN) : false;

  // Queries for dashboard data
  const { data: stats, isLoading: isLoadingStats, error: statsError } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: fetchDashboardStats,
    enabled: isManager,
  });

  const { data: attendanceStatus, isLoading: isLoadingStatus, error: statusError } = useQuery({
    queryKey: ['attendanceStatus'],
    queryFn: fetchAttendanceStatus,
    enabled: !isManager,
  });

  // Mutations for clock in/out
  const clockInMutation = useMutation({
    mutationFn: clockIn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendanceStatus'] });
      toast({ title: "Success", description: "Clocked in successfully." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const clockOutMutation = useMutation({
    mutationFn: clockOut,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendanceStatus'] });
      toast({ title: "Success", description: "Clocked out successfully." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const exportMutation = useMutation({
    mutationFn: exportAttendance,
    onSuccess: () => {
      toast({ title: "Success", description: "Attendance data exported." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleNavigation = useCallback((path: string) => () => navigate(path), [navigate]);
  const handleLogout = useCallback(() => logoutMutation.mutate(), [logoutMutation]);
  
  const handleExportReports = useCallback(() => {
    if (!dateRange || !dateRange.from || !dateRange.to) {
      toast({ title: "Error", description: "Please select a date range to export.", variant: "destructive" });
      return;
    }
    exportMutation.mutate(dateRange);
  }, [dateRange, exportMutation, toast]);

  // Live timer for employee's shift duration
  const [duration, setDuration] = useState(0);
  useEffect(() => {
    if (attendanceStatus?.record?.clockInTime && !attendanceStatus?.record?.clockOutTime) {
      const interval = setInterval(() => {
        setDuration(differenceInSeconds(new Date(), new Date(attendanceStatus.record.clockInTime)));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [attendanceStatus]);

  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur z-10">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-xl font-bold cursor-pointer" onClick={handleNavigation("/")}>
            Employee Attendance
          </h1>
          <nav className="hidden md:flex gap-6 text-sm font-medium">
            <Link href="/" className={`hover:text-primary transition-colors ${location === "/" ? "text-primary" : "text-muted-foreground"}`}>Dashboard</Link>
            <Link href="/attendance" className={`hover:text-primary transition-colors ${location === "/attendance" ? "text-primary" : "text-muted-foreground"}`}>Attendance</Link>
            {isManager && <Link href="/team" className={`hover:text-primary transition-colors ${location === "/team" ? "text-primary" : "text-muted-foreground"}`}>Team</Link>}
            {isManager && <Link href="/approvals" className={`hover:text-primary transition-colors ${location === "/approvals" ? "text-primary" : "text-muted-foreground"}`}>Approvals</Link>}
            {isManager && <Link href="/reports" className={`hover:text-primary transition-colors ${location === "/reports" ? "text-primary" : "text-muted-foreground"}`}>Reports</Link>}
            {user?.role === UserRole.ADMIN && <Link href="/users" className={`hover:text-primary transition-colors ${location === "/users" ? "text-primary" : "text-muted-foreground"}`}>Users</Link>}
            {user?.role === UserRole.ADMIN && <Link href="/audit-logs" className={`hover:text-primary transition-colors ${location === "/audit-logs" ? "text-primary" : "text-muted-foreground"}`}>Audit</Link>}
          </nav>
          <div className="flex items-center gap-2">
            {user && <span className="text-sm font-medium hidden md:inline-block">{user.firstName} {user.lastName}</span>}
            <Button variant="outline" size="sm" onClick={handleLogout} disabled={logoutMutation.isPending}>
              {logoutMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Log Out"}
            </Button>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {isManager ? "Admin & Manager Dashboard" : "Employee Dashboard"}
              </h1>
              <p className="text-muted-foreground mt-1">
                {isManager ? "Overview of team attendance, approvals, and system activity." : "Track your work hours and view your attendance."}
              </p>
            </div>
            
            <div className="flex gap-2">
              {isManager ? (
                <>
                  <DateRangePicker onUpdate={({ range }) => setDateRange(range)} />
                  <Button size="sm" onClick={handleExportReports} disabled={exportMutation.isPending}>
                    {exportMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Download className="h-4 w-4 mr-2" />} Export
                  </Button>
                  <Button size="sm" onClick={handleNavigation("/users")}><UserPlus className="h-4 w-4 mr-2" /> Manage Users</Button>
                </>
              ) : (
                <>
                  <Button variant="outline" size="sm" onClick={handleNavigation("/records")}><History className="h-4 w-4 mr-2" /> View History</Button>
                  {!attendanceStatus?.clockedIn && (
                    <Button size="sm" onClick={() => clockInMutation.mutate()} disabled={clockInMutation.isPending}>
                      {clockInMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <LogIn className="h-4 w-4 mr-2" />} Clock In
                    </Button>
                  )}
                  {attendanceStatus?.clockedIn && !attendanceStatus?.clockedOut && (
                    <Button size="sm" variant="destructive" onClick={() => clockOutMutation.mutate()} disabled={clockOutMutation.isPending}>
                      {clockOutMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <LogOut className="h-4 w-4 mr-2" />} Clock Out
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {isManager ? (
              isLoadingStats ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <Card key={i}><CardHeader><CardTitle><Loader2 className="h-5 w-5 animate-spin text-muted-foreground"/></CardTitle></CardHeader><CardContent><div className="h-10"></div></CardContent></Card>
                ))
              ) : statsError ? (
                <Card className="col-span-4 bg-destructive/10"><CardHeader><CardTitle className="text-destructive">Error</CardTitle></CardHeader><CardContent><p>{statsError.message}</p></CardContent></Card>
              ) : (
                <>
                  <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium flex items-center justify-between">Total Employees <Users className="h-4 w-4 text-muted-foreground"/></CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{stats.totalEmployees}</div></CardContent></Card>
                  <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium flex items-center justify-between">Present Today <Clock className="h-4 w-4 text-muted-foreground"/></CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{stats.presentToday}</div><p className="text-xs text-muted-foreground">{stats.presentPercentage}% attendance rate</p></CardContent></Card>
                  <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium flex items-center justify-between">Pending Approvals <CalendarCheck className="h-4 w-4 text-muted-foreground"/></CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{stats.pendingApprovalsCount}</div></CardContent><CardFooter className="pt-0 -mx-2 -mb-2"><Button size="sm" variant="ghost" onClick={handleNavigation("/approvals")}>View all</Button></CardFooter></Card>
                  <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium flex items-center justify-between">Overtime Hours <AlertTriangle className="h-4 w-4 text-muted-foreground"/></CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{stats.overtimeHours.toFixed(2)}</div><p className="text-xs text-muted-foreground">This week (pending)</p></CardContent></Card>
                </>
              )
            ) : (
              isLoadingStatus ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <Card key={i}><CardHeader><CardTitle><Loader2 className="h-5 w-5 animate-spin text-muted-foreground"/></CardTitle></CardHeader><CardContent><div className="h-10"></div></CardContent></Card>
                ))
              ) : statusError ? (
                <Card className="col-span-4 bg-destructive/10"><CardHeader><CardTitle className="text-destructive">Error</CardTitle></CardHeader><CardContent><p>{statusError.message}</p></CardContent></Card>
              ) : (
                <>
                  <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Today's Status</CardTitle></CardHeader><CardContent><div className={`text-2xl font-bold ${attendanceStatus?.clockedIn ? 'text-green-500' : 'text-red-500'}`}>{attendanceStatus?.clockedIn ? 'Clocked In' : 'Clocked Out'}</div></CardContent></Card>
                  <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Clock In Time</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{attendanceStatus?.record?.clockInTime ? format(new Date(attendanceStatus.record.clockInTime), 'p') : '--'}</div></CardContent></Card>
                  <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Clock Out Time</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{attendanceStatus?.record?.clockOutTime ? format(new Date(attendanceStatus.record.clockOutTime), 'p') : '--'}</div></CardContent></Card>
                  <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Today's Duration</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{attendanceStatus?.record?.clockInTime ? formatDuration(duration) : '--'}</div></CardContent></Card>
                </>
              )
            )}
          </div>
          
          {isManager && (
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest actions and updates in the system.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Details</TableHead>
                      <TableHead>Timestamp</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats?.recentActivity?.length > 0 ? (
                      stats.recentActivity.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell>{log.user ? `${log.user.firstName} ${log.user.lastName}` : 'System'}</TableCell>
                          <TableCell>{log.action}</TableCell>
                          <TableCell>{log.details}</TableCell>
                          <TableCell>{format(new Date(log.timestamp), 'Pp')}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow><TableCell colSpan={4} className="text-center">No recent activity</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
