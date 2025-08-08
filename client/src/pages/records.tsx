import { AppLayout } from "@/components/layout/app-layout";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { formatDate, formatTime, calculateDuration } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Filter, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useMemo } from "react";
import { ExportDropdown } from "@/components/ui/export-dropdown";
import { useAuth } from "@/hooks/use-auth";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { DateRange } from "react-day-picker";

import { AttendanceRecord } from "@shared/schema";

const RECORDS_PER_PAGE = 10;

export default function Records() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date(),
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  
  const { data: attendanceRecords = [], isLoading } = useQuery<AttendanceRecord[]>({
    queryKey: ["/api/attendance/records"],
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
  
  const totalHours = useMemo(() => attendanceRecords?.reduce((total, record) => {
    if (!record.clockOutTime) return total;
    const start = new Date(record.clockInTime);
    const end = new Date(record.clockOutTime);
    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    return total + hours;
  }, 0) || 0, [attendanceRecords]);
  
  const totalOvertime = useMemo(() => attendanceRecords?.reduce((total, record) => {
    return total + (record.overtimeHours || 0);
  }, 0) || 0, [attendanceRecords]);
  
  const filteredRecords = useMemo(() => attendanceRecords?.filter(record => {
    const recordDate = new Date(record.clockInTime);
    const startDate = dateRange?.from ? new Date(dateRange.from) : new Date(0);
    const endDate = dateRange?.to ? new Date(dateRange.to) : new Date();
    endDate.setHours(23, 59, 59);
    
    return recordDate >= startDate && recordDate <= endDate;
  }), [attendanceRecords, dateRange]);

  const paginatedRecords = useMemo(() => {
    const startIndex = (currentPage - 1) * RECORDS_PER_PAGE;
    const endIndex = startIndex + RECORDS_PER_PAGE;
    return filteredRecords.slice(startIndex, endIndex);
  }, [filteredRecords, currentPage]);

  const totalPages = Math.ceil(filteredRecords.length / RECORDS_PER_PAGE);

  return (
    <AppLayout>
      <PageHeader 
        title="My Records" 
        description="View and export your attendance history." 
      />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Records</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{isLoading ? <Skeleton className="h-8 w-16" /> : attendanceRecords?.length || 0}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Hours</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{isLoading ? <Skeleton className="h-8 w-16" /> : `${totalHours.toFixed(1)}h`}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Overtime</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{isLoading ? <Skeleton className="h-8 w-16" /> : `${(totalOvertime / 100).toFixed(1)}h`}</div></CardContent></Card>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
            <div>
              <CardTitle className="flex items-center"><Calendar className="h-5 w-5 mr-2 text-primary" />Attendance Records</CardTitle>
              <CardDescription>Your complete attendance history.</CardDescription>
            </div>
            
            {!isLoading && filteredRecords && (
              <ExportDropdown 
                data={filteredRecords}
                filename={`attendance-records-${new Date().toISOString().slice(0, 10)}`}
                title="Attendance Records"
                subtitle={`${dateRange?.from?.toLocaleDateString()} to ${dateRange?.to?.toLocaleDateString()}`}
              />
            )}
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="flex-1">
                <label htmlFor="date-range" className="text-sm font-medium">Date Range</label>
                <DateRangePicker onUpdate={({ range }) => setDateRange(range)} />
            </div>
            <div className="w-full sm:w-auto flex items-end">
              <div className="space-y-1 w-full">
                <label className="text-sm font-medium">Show</label>
                <Select defaultValue="all">
                  <SelectTrigger className="min-w-[150px]"><SelectValue placeholder="Show" /></SelectTrigger>
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
              <Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" />
            </div>
          ) : filteredRecords?.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">No records found for the selected date range.</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Clock In</TableHead><TableHead>Clock Out</TableHead><TableHead>Duration</TableHead><TableHead>Overtime</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {paginatedRecords.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>{formatDate(record.clockInTime)}</TableCell>
                        <TableCell>{formatTime(record.clockInTime)}</TableCell>
                        <TableCell>{record.clockOutTime ? formatTime(record.clockOutTime) : "--"}</TableCell>
                        <TableCell>{calculateDuration(record.clockInTime, record.clockOutTime || undefined)}</TableCell>
                        <TableCell>{record.overtime ? <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">{record.overtimeHours ? `${record.overtimeHours / 100}h` : "Yes"}</span> : "No"}</TableCell>
                        <TableCell>{!record.clockOutTime ? <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">In Progress</span> : record.overtime ? <span className="px-2 py-1 text-xs rounded-full bg-amber-100 text-amber-800">Pending Approval</span> : <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Completed</span>}</TableCell>
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
