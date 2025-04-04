import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery, useMutation } from "@tanstack/react-query";
import { formatDate, getInitials, stringToColor } from "@/lib/utils";
import { Link } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function OvertimeApprovals() {
  const { toast } = useToast();
  
  // Fetch pending overtime approvals
  const { data: pendingApprovals, isLoading } = useQuery({
    queryKey: ["/api/overtime/pending"],
    select: (data) => data.slice(0, 2), // Only showing first 2 for dashboard
  });
  
  // Mutations for approving/rejecting overtime
  const approveMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("PUT", `/api/overtime/${id}`, { 
        status: "approved", 
        comments: "Approved from dashboard" 
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/overtime/pending"] });
      toast({
        title: "Overtime approved",
        description: "The overtime request has been approved.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const rejectMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("PUT", `/api/overtime/${id}`, { 
        status: "rejected",
        comments: "Rejected from dashboard" 
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/overtime/pending"] });
      toast({
        title: "Overtime rejected",
        description: "The overtime request has been rejected.",
        variant: "destructive",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <Card>
      <CardHeader className="border-b border-border">
        <CardTitle>Pending Overtime Approvals</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="p-4 space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Regular Hours</TableHead>
                  <TableHead>Overtime Hours</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingApprovals?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                      No pending overtime approvals.
                    </TableCell>
                  </TableRow>
                ) : (
                  pendingApprovals?.map((approval) => (
                    <TableRow key={approval.id}>
                      <TableCell>
                        <div className="flex items-center">
                          <div className={`flex-shrink-0 h-8 w-8 rounded-full ${stringToColor(`${approval.user?.firstName} ${approval.user?.lastName}`)} flex items-center justify-center`}>
                            <span className="text-white font-medium text-sm">
                              {getInitials(approval.user?.firstName, approval.user?.lastName)}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium">
                              {approval.user?.firstName} {approval.user?.lastName}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {approval.user?.department}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>{formatDate(approval.requestDate)}</TableCell>
                      
                      <TableCell>{(approval.regularHours / 100).toFixed(1)}h</TableCell>
                      
                      <TableCell>{(approval.overtimeHours / 100).toFixed(1)}h</TableCell>
                      
                      <TableCell>
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                          Pending
                        </span>
                      </TableCell>
                      
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => approveMutation.mutate(approval.id)}
                            disabled={approveMutation.isPending || rejectMutation.isPending}
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => rejectMutation.mutate(approval.id)}
                            disabled={approveMutation.isPending || rejectMutation.isPending}
                          >
                            Reject
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
        
        <div className="p-4 border-t border-border">
          <Link href="/approvals">
            <a className="text-sm font-medium text-primary hover:text-primary-focus">
              View all pending approvals →
            </a>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
