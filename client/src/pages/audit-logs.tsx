import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/app-layout";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate, formatTime } from "@/lib/utils";
import { Search, Download, History, FileDown } from "lucide-react";

export default function AuditLogs() {
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().substring(0, 10),
    end: new Date().toISOString().substring(0, 10),
  });
  
  // Fetch audit logs
  const { data: auditLogs, isLoading } = useQuery({
    queryKey: ["/api/audit-logs"],
  });
  
  // Filter logs based on search query, action, and date range
  const filteredLogs = auditLogs?.filter(log => {
    // Filter by search query
    const searchMatch = 
      !searchQuery || 
      log.details?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.user?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.user?.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.user?.username?.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filter by action
    const actionMatch = actionFilter === "all" || log.action === actionFilter;
    
    // Filter by date range
    const logDate = new Date(log.timestamp);
    const startDate = new Date(dateRange.start);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(dateRange.end);
    endDate.setHours(23, 59, 59, 999);
    
    const dateMatch = logDate >= startDate && logDate <= endDate;
    
    return searchMatch && actionMatch && dateMatch;
  });
  
  // Extract unique actions for the filter dropdown
  const uniqueActions = auditLogs
    ? Array.from(new Set(auditLogs.map(log => log.action)))
    : [];
  
  // Function to get color for action badges
  const getActionColor = (action: string) => {
    switch (action) {
      case "CLOCK_IN":
        return "bg-blue-100 text-blue-800";
      case "CLOCK_OUT":
        return "bg-red-100 text-red-800";
      case "OVERTIME_APPROVED":
        return "bg-green-100 text-green-800";
      case "OVERTIME_REJECTED":
        return "bg-orange-100 text-orange-800";
      case "USER_CREATED":
      case "ADMIN_USER_CREATED":
        return "bg-purple-100 text-purple-800";
      case "USER_UPDATED":
        return "bg-amber-100 text-amber-800";
      case "USER_DEACTIVATED":
        return "bg-red-100 text-red-800";
      case "USER_LOGIN":
      case "USER_LOGOUT":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <AppLayout>
      <PageHeader 
        title="Audit Logs" 
        description="Track and monitor all system activities." 
        actions={
          <Button variant="outline" className="flex items-center gap-2">
            <FileDown className="h-4 w-4" />
            Export Logs
          </Button>
        }
      />
      
      <Card>
        <CardHeader className="border-b border-border">
          <CardTitle className="flex items-center">
            <History className="h-5 w-5 mr-2 text-primary" />
            System Activity Logs
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {/* Filter Controls */}
          <div className="p-4 border-b border-border grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-2.5 top-2.5 text-muted-foreground" />
              <Input
                placeholder="Search logs..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div>
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  {uniqueActions.map(action => (
                    <SelectItem key={action} value={action}>
                      {action.replace(/_/g, " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              />
            </div>
            
            <div>
              <Input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              />
            </div>
          </div>
          
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
                    <TableHead>Timestamp</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead>IP Address</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                        No audit logs found matching your criteria.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredLogs?.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="whitespace-nowrap">
                          <div className="font-medium">{formatDate(log.timestamp)}</div>
                          <div className="text-sm text-muted-foreground">{formatTime(log.timestamp)}</div>
                        </TableCell>
                        
                        <TableCell>
                          {log.user ? (
                            <>
                              <div className="font-medium">{log.user.firstName} {log.user.lastName}</div>
                              <div className="text-sm text-muted-foreground">{log.user.username}</div>
                            </>
                          ) : (
                            <span className="text-muted-foreground">System</span>
                          )}
                        </TableCell>
                        
                        <TableCell>
                          <span className={`px-2 py-1 text-xs rounded-full ${getActionColor(log.action)}`}>
                            {log.action.replace(/_/g, " ")}
                          </span>
                        </TableCell>
                        
                        <TableCell>
                          <div className="max-w-md truncate">{log.details}</div>
                        </TableCell>
                        
                        <TableCell>
                          <code className="text-xs bg-muted p-1 rounded">{log.ipAddress}</code>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
          
          {/* Pagination */}
          <div className="p-4 border-t border-border flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {filteredLogs && `Showing ${filteredLogs.length} of ${auditLogs?.length || 0} logs`}
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <Button variant="outline" size="sm" className="bg-primary text-primary-foreground">
                1
              </Button>
              <Button variant="outline" size="sm" disabled>
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </AppLayout>
  );
}
