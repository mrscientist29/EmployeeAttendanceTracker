import { AppLayout } from "@/components/layout/app-layout";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate, getInitials, stringToColor } from "@/lib/utils";
import { Clock, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export default function Approvals() {
  const { toast } = useToast();
  const [selectedApproval, setSelectedApproval] = useState<any>(null);
  const [comments, setComments] = useState("");
  const [commentDialogOpen, setCommentDialogOpen] = useState(false);
  const [approvalAction, setApprovalAction] = useState<"approved" | "rejected">("approved");
  
  // Fetch pending overtime approvals
  const { data: pendingApprovals, isLoading } = useQuery({
    queryKey: ["/api/overtime/pending"],
  });
  
  // Mutation for approving/rejecting overtime
  const approvalMutation = useMutation({
    mutationFn: async ({ id, status, comments }: { id: number; status: string; comments: string }) => {
      const res = await apiRequest("PUT", `/api/overtime/${id}`, { status, comments });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/overtime/pending"] });
      toast({
        title: `Overtime ${approvalAction}`,
        description: `The overtime request has been ${approvalAction} successfully.`,
        variant: approvalAction === "approved" ? "default" : "destructive",
      });
      setCommentDialogOpen(false);
      setComments("");
    },
    onError: (error: Error) => {
      toast({
        title: "Action failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const handleApprovalAction = (approval: any, action: "approved" | "rejected") => {
    setSelectedApproval(approval);
    setApprovalAction(action);
    setCommentDialogOpen(true);
  };
  
  const submitApproval = () => {
    if (!selectedApproval) return;
    
    approvalMutation.mutate({
      id: selectedApproval.id,
      status: approvalAction,
      comments: comments,
    });
  };
  
  return (
    <AppLayout>
      <PageHeader 
        title="Overtime Approvals" 
        description="Review and approve overtime requests from your team." 
      />
      
      {/* Overtime Approvals Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center">
            <Clock className="h-5 w-5 mr-2 text-primary" />
            <CardTitle>Pending Overtime Approvals</CardTitle>
          </div>
          <CardDescription>
            Overtime hours that require your approval.
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : pendingApprovals?.length === 0 ? (
            <div className="text-center py-10">
              <AlertTriangle className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No pending approvals</h3>
              <p className="text-sm text-muted-foreground mt-1">
                There are no overtime requests waiting for your approval.
              </p>
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
                  {pendingApprovals?.map((approval) => (
                    <TableRow key={approval.id}>
                      <TableCell>
                        <div className="flex items-center">
                          <div className={`flex-shrink-0 h-8 w-8 rounded-full ${stringToColor(`${approval.user?.firstName} ${approval.user?.lastName}`)} flex items-center justify-center`}>
                            <span className="text-white font-medium text-sm">
                              {getInitials(approval.user?.firstName, approval.user?.lastName)}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {approval.user?.firstName} {approval.user?.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {approval.user?.department}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell className="text-sm text-gray-900">
                        {formatDate(approval.requestDate)}
                      </TableCell>
                      
                      <TableCell className="text-sm text-gray-900">
                        {(approval.regularHours / 100).toFixed(1)}h
                      </TableCell>
                      
                      <TableCell className="text-sm text-gray-900">
                        {(approval.overtimeHours / 100).toFixed(1)}h
                      </TableCell>
                      
                      <TableCell>
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          Pending
                        </span>
                      </TableCell>
                      
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleApprovalAction(approval, "approved")}
                            disabled={approvalMutation.isPending}
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleApprovalAction(approval, "rejected")}
                            disabled={approvalMutation.isPending}
                          >
                            Reject
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Comments Dialog */}
      <Dialog open={commentDialogOpen} onOpenChange={setCommentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center">
              {approvalAction === "approved" ? (
                <CheckCircle2 className="h-5 w-5 mr-2 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 mr-2 text-red-500" />
              )}
              {approvalAction === "approved" ? "Approve Overtime" : "Reject Overtime"}
            </DialogTitle>
            <DialogDescription>
              {approvalAction === "approved"
                ? "This will approve the overtime request."
                : "This will reject the overtime request."}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label htmlFor="comments" className="text-sm font-medium">
                Comments (Optional)
              </label>
              <Textarea
                id="comments"
                placeholder="Add any comments about this decision..."
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCommentDialogOpen(false)}
              disabled={approvalMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={submitApproval}
              disabled={approvalMutation.isPending}
              className={approvalAction === "approved" ? "bg-green-600 hover:bg-green-700" : ""}
              variant={approvalAction === "rejected" ? "destructive" : "default"}
            >
              {approvalMutation.isPending ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </div>
              ) : (
                `Confirm ${approvalAction === "approved" ? "Approval" : "Rejection"}`
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
