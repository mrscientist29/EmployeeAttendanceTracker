import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { formatTime, calculateDuration, getInitials, stringToColor } from "@/lib/utils";
import { Download, Search } from "lucide-react";

export function AttendanceTable() {
  const [searchQuery, setSearchQuery] = useState("");
  
  // Fetch today's attendance
  const { data: todayAttendance, isLoading } = useQuery({
    queryKey: ["/api/attendance/today"],
  });
  
  // Filter attendance records based on search
  const filteredAttendance = todayAttendance?.filter(record => {
    if (!searchQuery) return true;
    
    const fullName = `${record.user?.firstName} ${record.user?.lastName}`.toLowerCase();
    const email = record.user?.email?.toLowerCase() || "";
    const department = record.user?.department?.toLowerCase() || "";
    const query = searchQuery.toLowerCase();
    
    return fullName.includes(query) || email.includes(query) || department.includes(query);
  });

  return (
    <Card>
      <CardHeader className="border-b border-border">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
          <CardTitle>Today's Attendance</CardTitle>
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
            
            <Button variant="outline" size="icon">
              <Download className="h-4 w-4" />
              <span className="sr-only">Export</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="p-4 space-y-2">
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
                {filteredAttendance?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                      No attendance records found for today.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAttendance?.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>
                        <div className="flex items-center">
                          <div className={`flex-shrink-0 h-8 w-8 rounded-full ${stringToColor(`${record.user?.firstName} ${record.user?.lastName}`)} flex items-center justify-center`}>
                            <span className="text-white font-medium text-sm">
                              {getInitials(record.user?.firstName, record.user?.lastName)}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium">
                              {record.user?.firstName} {record.user?.lastName}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {record.user?.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>{record.user?.department || "--"}</TableCell>
                      
                      <TableCell>
                        {record.clockOutTime ? (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                            Left
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                            Present
                          </span>
                        )}
                      </TableCell>
                      
                      <TableCell>{formatTime(record.clockInTime)}</TableCell>
                      
                      <TableCell>
                        {record.clockOutTime ? formatTime(record.clockOutTime) : "--"}
                      </TableCell>
                      
                      <TableCell>
                        {calculateDuration(record.clockInTime, record.clockOutTime)}
                      </TableCell>
                      
                      <TableCell className="text-right">
                        <Button variant="link" size="sm">
                          Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
        
        <div className="p-4 border-t border-border flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {filteredAttendance && `Showing ${filteredAttendance.length} ${filteredAttendance.length === 1 ? 'entry' : 'entries'}`}
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <Button variant="outline" size="sm" className="bg-primary text-primary-foreground" disabled>
              1
            </Button>
            <Button variant="outline" size="sm" disabled>
              Next
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
