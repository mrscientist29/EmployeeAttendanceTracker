import { AppLayout } from "@/components/layout/app-layout";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ClockInOut } from "@/components/attendance/clock-in-out";
import { CalendarDays, Clock, History } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { formatDate, formatTime, calculateDuration } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function Attendance() {
  const [viewAll, setViewAll] = useState(false);
  
  // Fetch user's current attendance status
  const { data: attendanceStatus, isLoading: isLoadingStatus } = useQuery({
    queryKey: ["/api/attendance/status"],
  });
  
  // Fetch user's recent attendance records
  const { data: attendanceRecords, isLoading: isLoadingRecords } = useQuery({
    queryKey: ["/api/attendance/records"],
  });
  
  // Filter records to show only the most recent few unless viewAll is true
  const displayedRecords = viewAll 
    ? attendanceRecords 
    : attendanceRecords?.slice(0, 5);
  
  return (
    <AppLayout>
      <PageHeader 
        title="Attendance" 
        description="Clock in and out to record your work hours." 
      />
      
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
            <ClockInOut attendanceStatus={attendanceStatus} isLoading={isLoadingStatus} />
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
            {isLoadingStatus ? (
              <div className="space-y-2">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-3/4" />
              </div>
            ) : (
              <>
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
              </>
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
          {isLoadingRecords ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : attendanceRecords?.length === 0 ? (
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
                  {displayedRecords?.map((record) => (
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
              
              {attendanceRecords && attendanceRecords.length > 5 && (
                <div className="mt-4 flex justify-center">
                  <Button
                    variant="outline"
                    onClick={() => setViewAll(!viewAll)}
                  >
                    {viewAll ? "Show Less" : `View All (${attendanceRecords.length})`}
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </AppLayout>
  );
}
