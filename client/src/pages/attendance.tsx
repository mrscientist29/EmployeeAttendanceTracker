import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays, Clock, History, Loader2 } from "lucide-react";
import { formatDate, formatTime, calculateDuration } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useState } from "react";
import { AttendanceRecord } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { ClockInOut } from "@/components/attendance/clock-in-out";
import { useAuth } from "@/hooks/use-auth";
import { AppLayout } from "@/components/layout/app-layout";

// Simple page header component that matches the format in the rest of the app
function MyPageHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-semibold">{title}</h1>
      {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
    </div>
  );
}

interface AttendanceStatus {
  clockedIn: boolean;
  clockedOut: boolean;
  record?: {
    id: number;
    userId: number;
    clockInTime: string;
    clockOutTime: string | null;
    overtime: boolean;
    overtimeHours: number;
  };
}

export default function Attendance() {
  const [viewAll, setViewAll] = useState(false);
  const { user } = useAuth();
  
  // Fetch attendance status for today
  const { data: attendanceStatus, isLoading: isStatusLoading } = useQuery<AttendanceStatus>({
    queryKey: ["/api/attendance/status"],
    retry: false,
    staleTime: 30 * 1000, // 30 seconds
  });
  
  // Fetch attendance records
  const { data: attendanceRecords = [], isLoading: isRecordsLoading } = useQuery<AttendanceRecord[]>({
    queryKey: ["/api/attendance/records"],
    retry: false,
    staleTime: 60 * 1000, // 1 minute
  });
  
  // Filter records to show only the most recent few unless viewAll is true
  const displayedRecords = viewAll 
    ? attendanceRecords 
    : attendanceRecords.slice(0, 5);
  
  return (
    <AppLayout>
      <MyPageHeader 
        title="Attendance" 
        description="Track and manage your work hours"
      />
      
      <div className="flex flex-col gap-6">
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
              <ClockInOut
                attendanceStatus={attendanceStatus}
                isLoading={isStatusLoading}
              />
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
              {isStatusLoading ? (
                <div className="flex justify-center py-6">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
                            attendanceStatus.record.clockOutTime || undefined
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
            {isRecordsLoading ? (
              <div className="flex justify-center py-6">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : attendanceRecords.length === 0 ? (
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
                          {calculateDuration(record.clockInTime, record.clockOutTime || undefined)}
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
                
                {attendanceRecords.length > 5 && (
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
      </div>
    </AppLayout>
  );
}
