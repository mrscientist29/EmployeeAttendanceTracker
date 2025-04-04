import { AppLayout } from "@/components/layout/app-layout";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatTime, calculateDuration, getInitials, stringToColor } from "@/lib/utils";
import { ChartBarStacked, CheckCircle, XCircle, Search, Download, Users } from "lucide-react";

export default function TeamOverview() {
  const [searchQuery, setSearchQuery] = useState("");
  
  // Fetch today's attendance
  const { data: todayAttendance, isLoading } = useQuery({
    queryKey: ["/api/attendance/today"],
  });
  
  // Fetch all users
  const { data: allUsers, isLoading: isLoadingUsers } = useQuery({
    queryKey: ["/api/users"],
  });
  
  // Calculate stats
  const totalEmployees = allUsers?.length || 0;
  const presentEmployees = todayAttendance?.length || 0;
  const absentEmployees = totalEmployees - presentEmployees;
  const attendanceRate = totalEmployees > 0 ? Math.round((presentEmployees / totalEmployees) * 100) : 0;
  
  // Filter attendance based on search query
  const filteredAttendance = todayAttendance?.filter(record => {
    const fullName = `${record.user?.firstName} ${record.user?.lastName}`.toLowerCase();
    const department = record.user?.department?.toLowerCase() || "";
    const query = searchQuery.toLowerCase();
    
    return fullName.includes(query) || department.includes(query);
  });
  
  return (
    <AppLayout>
      <PageHeader 
        title="Team Overview" 
        description="Monitor your team's attendance in real-time." 
      />
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Employees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center">
              {isLoadingUsers ? <Skeleton className="h-8 w-16" /> : totalEmployees}
              <Users className="ml-2 h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Present Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center">
              {isLoading ? <Skeleton className="h-8 w-16" /> : presentEmployees}
              <CheckCircle className="ml-2 h-5 w-5 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Absent Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center">
              {isLoading || isLoadingUsers ? <Skeleton className="h-8 w-16" /> : absentEmployees}
              <XCircle className="ml-2 h-5 w-5 text-red-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Attendance Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center">
              {isLoading || isLoadingUsers ? <Skeleton className="h-8 w-16" /> : `${attendanceRate}%`}
              <ChartBarStacked className="ml-2 h-5 w-5 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Team Attendance Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
            <div>
              <CardTitle>Today's Attendance</CardTitle>
              <CardDescription>
                Overview of all employees' attendance status for today.
              </CardDescription>
            </div>
            
            <div className="flex space-x-2">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-2.5 top-2.5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search employees..."
                  className="pl-8 w-[200px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <Button variant="outline" className="flex items-center gap-1">
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Export</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Clock In</TableHead>
                    <TableHead>Clock Out</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAttendance?.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>
                        <div className="flex items-center">
                          <div className={`flex-shrink-0 h-8 w-8 rounded-full ${stringToColor(`${record.user?.firstName} ${record.user?.lastName}`)} flex items-center justify-center`}>
                            <span className="text-white font-medium text-sm">
                              {getInitials(record.user?.firstName, record.user?.lastName)}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {record.user?.firstName} {record.user?.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {record.user?.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="text-sm text-gray-900">
                          {record.user?.department || "--"}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        {record.clockOutTime ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                            Left
                          </span>
                        ) : (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Present
                          </span>
                        )}
                      </TableCell>
                      
                      <TableCell className="text-sm text-gray-900">
                        {formatTime(record.clockInTime)}
                      </TableCell>
                      
                      <TableCell className="text-sm text-gray-900">
                        {record.clockOutTime ? formatTime(record.clockOutTime) : "--"}
                      </TableCell>
                      
                      <TableCell className="text-sm text-gray-900">
                        {calculateDuration(record.clockInTime, record.clockOutTime)}
                      </TableCell>
                      
                      <TableCell className="text-right">
                        <Button variant="link" size="sm">
                          Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  
                  {/* Show absent employees */}
                  {allUsers
                    ?.filter(user => 
                      !todayAttendance?.some(record => record.userId === user.id) &&
                      (`${user.firstName} ${user.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      user.department?.toLowerCase().includes(searchQuery.toLowerCase()))
                    )
                    .map(user => (
                      <TableRow key={`absent-${user.id}`}>
                        <TableCell>
                          <div className="flex items-center">
                            <div className={`flex-shrink-0 h-8 w-8 rounded-full ${stringToColor(`${user.firstName} ${user.lastName}`)} flex items-center justify-center`}>
                              <span className="text-white font-medium text-sm">
                                {getInitials(user.firstName, user.lastName)}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {user.firstName} {user.lastName}
                              </div>
                              <div className="text-sm text-gray-500">
                                {user.email}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="text-sm text-gray-900">
                            {user.department || "--"}
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                            Absent
                          </span>
                        </TableCell>
                        
                        <TableCell className="text-sm text-gray-900">--</TableCell>
                        <TableCell className="text-sm text-gray-900">--</TableCell>
                        <TableCell className="text-sm text-gray-900">--</TableCell>
                        
                        <TableCell className="text-right">
                          <Button variant="link" size="sm">
                            Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          )}
          
          {/* Pagination component could be added here */}
        </CardContent>
      </Card>
    </AppLayout>
  );
}
