import { AppLayout } from "@/components/layout/app-layout";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { formatDate, formatTime, calculateDuration } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Filter, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { ExportDropdown } from "@/components/ui/export-dropdown";
import { useAuth } from "@/hooks/use-auth";

import { AttendanceRecord } from "@shared/schema";

export default function Records() {
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().substring(0, 10),
    end: new Date().toISOString().substring(0, 10),
  });
  const [searchQuery, setSearchQuery] = useState("");
  
  // Fetch user's attendance records
  const { data: attendanceRecords = [], isLoading } = useQuery<AttendanceRecord[]>({
    queryKey: ["/api/attendance/records"],
    retry: false,
    // Add staleTime to avoid frequent refetches
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Get summary stats
  const totalHours = attendanceRecords?.reduce((total, record) => {
    if (!record.clockOutTime) return total;
    
    const start = new Date(record.clockInTime);
    const end = new Date(record.clockOutTime);
    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    return total + hours;
  }, 0) || 0;
  
  const totalOvertime = attendanceRecords?.reduce((total, record) => {
    return total + (record.overtimeHours || 0);
  }, 0) || 0;
  
  const filteredRecords = attendanceRecords?.filter(record => {
    const recordDate = new Date(record.clockInTime);
    const startDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);
    endDate.setHours(23, 59, 59); // Include the entire end day
    
    return recordDate >= startDate && recordDate <= endDate;
  });
  
  return (
    <AppLayout>
      <PageHeader 
        title="My Records" 
        description="View and export your attendance history." 
      />
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Records</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? <Skeleton className="h-8 w-16" /> : attendanceRecords?.length || 0}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? <Skeleton className="h-8 w-16" /> : `${totalHours.toFixed(1)}h`}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Overtime</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? <Skeleton className="h-8 w-16" /> : `${(totalOvertime / 100).toFixed(1)}h`}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Records Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
            <div>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-primary" />
                Attendance Records
              </CardTitle>
              <CardDescription>
                Your complete attendance history.
              </CardDescription>
            </div>
            
            {!isLoading && filteredRecords && (
              <ExportDropdown 
                data={filteredRecords}
                filename={`attendance-records-${new Date().toISOString().slice(0, 10)}`}
                title="Attendance Records"
                subtitle={`${dateRange.start} to ${dateRange.end}`}
              />
            )}
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="flex-1 flex items-center space-x-2">
              <div className="grid grid-cols-2 gap-2 flex-1">
                <div className="space-y-1">
                  <label htmlFor="start-date" className="text-sm font-medium">
                    Start Date
                  </label>
                  <Input
                    id="start-date"
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="end-date" className="text-sm font-medium">
                    End Date
                  </label>
                  <Input
                    id="end-date"
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                  />
                </div>
              </div>
            </div>
            
            <div className="w-full sm:w-auto flex items-end">
              <div className="space-y-1 w-full">
                <label className="text-sm font-medium">Show</label>
                <Select defaultValue="all">
                  <SelectTrigger className="min-w-[150px]">
                    <SelectValue placeholder="Show" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Records</SelectItem>
                    <SelectItem value="overtime">Overtime Only</SelectItem>
                    <SelectItem value="this-week">This Week</SelectItem>
                    <SelectItem value="this-month">This Month</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : filteredRecords?.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              No records found for the selected date range.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Clock In</TableHead>
                    <TableHead>Clock Out</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Overtime</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords?.map((record) => (
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
                      <TableCell>
                        {!record.clockOutTime ? (
                          <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                            In Progress
                          </span>
                        ) : record.overtime ? (
                          <span className="px-2 py-1 text-xs rounded-full bg-amber-100 text-amber-800">
                            Pending Approval
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                            Completed
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          
          {/* Pagination could be added here */}
        </CardContent>
      </Card>
    </AppLayout>
  );
}
