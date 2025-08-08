import { AppLayout } from "@/components/layout/app-layout";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatTime, calculateDuration, getInitials, stringToColor } from "@/lib/utils";
import { ChartBarStacked, CheckCircle, XCircle, Search, Download, Users, ChevronLeft, ChevronRight } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const RECORDS_PER_PAGE = 10;

export default function TeamOverview() {
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  
  const { data: todayAttendance, isLoading } = useQuery({
    queryKey: ["/api/attendance/today"],
  });
  
  const { data: allUsers, isLoading: isLoadingUsers } = useQuery({
    queryKey: ["/api/users"],
  });
  
  const totalEmployees = allUsers?.length || 0;
  const presentEmployees = todayAttendance?.length || 0;
  const absentEmployees = totalEmployees - presentEmployees;
  const attendanceRate = totalEmployees > 0 ? Math.round((presentEmployees / totalEmployees) * 100) : 0;
  
  const departments = useMemo(() => {
    const deps = new Set(allUsers?.map(user => user.department).filter(Boolean));
    return ["all", ...Array.from(deps)];
  }, [allUsers]);

  const filteredAndSortedUsers = useMemo(() => {
    const combinedUsers = allUsers?.map(user => {
      const attendanceRecord = todayAttendance?.find(record => record.userId === user.id);
      return { ...user, attendance: attendanceRecord };
    });

    const filtered = combinedUsers?.filter(user => {
      const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
      const department = user.department?.toLowerCase() || "";
      const query = searchQuery.toLowerCase();

      const matchesSearch = fullName.includes(query) || user.email.toLowerCase().includes(query);
      const matchesDept = departmentFilter === 'all' || department === departmentFilter;

      return matchesSearch && matchesDept;
    });

    return filtered?.sort((a, b) => {
      if (a.attendance && !b.attendance) return -1;
      if (!a.attendance && b.attendance) return 1;
      return a.lastName.localeCompare(b.lastName);
    });
  }, [allUsers, todayAttendance, searchQuery, departmentFilter]);

  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * RECORDS_PER_PAGE;
    const endIndex = startIndex + RECORDS_PER_PAGE;
    return filteredAndSortedUsers?.slice(startIndex, endIndex) || [];
  }, [filteredAndSortedUsers, currentPage]);

  const totalPages = Math.ceil((filteredAndSortedUsers?.length || 0) / RECORDS_PER_PAGE);

  return (
    <AppLayout>
      <PageHeader 
        title="Team Overview" 
        description="Monitor your team's attendance in real-time." 
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Employees</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold flex items-center">{isLoadingUsers ? <Skeleton className="h-8 w-16" /> : totalEmployees}<Users className="ml-auto h-5 w-5 text-muted-foreground" /></div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Present Today</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold flex items-center">{isLoading ? <Skeleton className="h-8 w-16" /> : presentEmployees}<CheckCircle className="ml-auto h-5 w-5 text-green-500" /></div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Absent Today</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold flex items-center">{isLoading || isLoadingUsers ? <Skeleton className="h-8 w-16" /> : absentEmployees}<XCircle className="ml-auto h-5 w-5 text-red-500" /></div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Attendance Rate</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold flex items-center">{isLoading || isLoadingUsers ? <Skeleton className="h-8 w-16" /> : `${attendanceRate}%`}<ChartBarStacked className="ml-auto h-5 w-5 text-blue-500" /></div></CardContent></Card>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
            <div>
              <CardTitle>Today's Attendance</CardTitle>
              <CardDescription>Overview of all employees' attendance status for today.</CardDescription>
            </div>
            <div className="flex space-x-2">
              <div className="relative"><Search className="h-4 w-4 absolute left-2.5 top-2.5 text-muted-foreground" /><Input type="text" placeholder="Search..." className="pl-8 w-[200px]" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} /></div>
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger className="w-[180px]"><SelectValue placeholder="Department" /></SelectTrigger>
                <SelectContent>
                  {departments.map(dep => <SelectItem key={dep} value={dep}>{dep === 'all' ? 'All Departments' : dep}</SelectItem>)}
                </SelectContent>
              </Select>
              <Button variant="outline" className="flex items-center gap-1"><Download className="h-4 w-4" /><span className="hidden sm:inline">Export</span></Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {isLoading || isLoadingUsers ? (
            <div className="space-y-2"><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /></div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader><TableRow><TableHead>Employee</TableHead><TableHead>Department</TableHead><TableHead>Status</TableHead><TableHead>Clock In</TableHead><TableHead>Clock Out</TableHead><TableHead>Duration</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {paginatedUsers.map(user => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center">
                            <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center`} style={{ backgroundColor: stringToColor(`${user.firstName} ${user.lastName}`) }}><span className="text-white font-medium text-sm">{getInitials(user.firstName, user.lastName)}</span></div>
                            <div className="ml-4"><div className="text-sm font-medium text-gray-900">{user.firstName} {user.lastName}</div><div className="text-sm text-gray-500">{user.email}</div></div>
                          </div>
                        </TableCell>
                        <TableCell><div className="text-sm text-gray-900">{user.department || "--"}</div></TableCell>
                        <TableCell>
                          {user.attendance ? (
                            user.attendance.clockOutTime ? <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Left</span> : <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Present</span>
                          ) : <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">Absent</span>}
                        </TableCell>
                        <TableCell className="text-sm text-gray-900">{user.attendance ? formatTime(user.attendance.clockInTime) : "--"}</TableCell>
                        <TableCell className="text-sm text-gray-900">{user.attendance?.clockOutTime ? formatTime(user.attendance.clockOutTime) : "--"}</TableCell>
                        <TableCell className="text-sm text-gray-900">{user.attendance ? calculateDuration(user.attendance.clockInTime, user.attendance.clockOutTime) : "--"}</TableCell>
                        <TableCell className="text-right"><Button variant="link" size="sm">Details</Button></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="mt-4 flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Page {currentPage} of {totalPages}</span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}><ChevronLeft className="h-4 w-4 mr-1" />Previous</Button>
                    <Button variant="outline" size="sm" onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>Next<ChevronRight className="h-4 w-4 ml-1" /></Button>
                  </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </AppLayout>
  );
}
