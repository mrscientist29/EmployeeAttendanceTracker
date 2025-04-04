import { useQuery } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/app-layout";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { AttendanceChart } from "@/components/dashboard/attendance-chart";
import { AttendanceTable } from "@/components/dashboard/attendance-table";
import { OvertimeApprovals } from "@/components/dashboard/overtime-approvals";
import { useAuth } from "@/hooks/use-auth";
import { UserRole } from "@shared/schema";

export default function Dashboard() {
  const { user } = useAuth();
  const isManager = user?.role === UserRole.MANAGER || user?.role === UserRole.ADMIN;
  
  // Fetch dashboard stats for managers and admins
  const { data: dashboardStats, isLoading: isLoadingStats } = useQuery({
    queryKey: ["/api/stats/dashboard"],
    enabled: isManager,
  });
  
  // Fetch user's current attendance status
  const { data: attendanceStatus } = useQuery({
    queryKey: ["/api/attendance/status"],
  });
  
  return (
    <AppLayout>
      <div className="flex flex-col gap-6">
        <PageHeader 
          title={isManager ? "Admin Dashboard" : "Employee Dashboard"} 
          description={
            isManager 
              ? "Manage employee attendance, approvals, and system settings." 
              : "Track your work hours and view attendance records."
          } 
        />
        
        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {isManager ? (
            // Manager/Admin dashboard cards
            <>
              <StatCard 
                title="Total Employees"
                value={dashboardStats?.totalEmployees ?? 0}
                icon="users"
                change={"+3.1%"}
                changeText="from last month"
                isLoading={isLoadingStats}
              />
              
              <StatCard 
                title="Present Today"
                value={dashboardStats?.presentToday ?? 0}
                icon="check-circle"
                subtitle={`${dashboardStats?.presentPercentage ?? 0}% attendance rate`}
                color="green"
                isLoading={isLoadingStats}
              />
              
              <StatCard 
                title="Pending Approvals"
                value={dashboardStats?.pendingApprovalsCount ?? 0}
                icon="alert-circle"
                actionLink="/approvals"
                actionText="View all"
                color="amber"
                isLoading={isLoadingStats}
              />
              
              <StatCard 
                title="Overtime Hours"
                value={dashboardStats?.overtimeHours ?? 0}
                icon="clock"
                subtitle="This week"
                color="purple"
                isLoading={isLoadingStats}
              />
            </>
          ) : (
            // Employee dashboard cards
            <>
              <StatCard 
                title="Today's Status"
                value={attendanceStatus?.clockedIn ? "Present" : "Not Clocked In"}
                icon={attendanceStatus?.clockedIn ? "check-circle" : "x-circle"}
                color={attendanceStatus?.clockedIn ? "green" : "gray"}
              />
              
              <StatCard 
                title="Clock In Time"
                value={attendanceStatus?.record?.clockInTime ? new Date(attendanceStatus.record.clockInTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "--"}
                icon="log-in"
                color="blue"
              />
              
              <StatCard 
                title="Clock Out Time"
                value={attendanceStatus?.record?.clockOutTime ? new Date(attendanceStatus.record.clockOutTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "--"}
                icon="log-out"
                color="red"
              />
              
              <StatCard 
                title="Today's Duration"
                value={attendanceStatus?.record ? calculateDuration(attendanceStatus.record) : "--"}
                icon="clock"
                color="purple"
              />
            </>
          )}
        </div>
        
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <div className="lg:col-span-1">
            <RecentActivity activity={dashboardStats?.recentActivity} isLoading={isLoadingStats} />
          </div>
          
          {/* Attendance Chart */}
          <div className="lg:col-span-2">
            <AttendanceChart />
          </div>
        </div>
        
        {/* Attendance Table */}
        {isManager && (
          <AttendanceTable />
        )}
        
        {/* Pending Overtime Approvals (Managers & Admins only) */}
        {isManager && (
          <OvertimeApprovals />
        )}
      </div>
    </AppLayout>
  );
}

// Helper function to calculate duration
function calculateDuration(record: any): string {
  if (!record) return "--";
  
  const startTime = new Date(record.clockInTime);
  const endTime = record.clockOutTime ? new Date(record.clockOutTime) : new Date();
  
  const durationMs = endTime.getTime() - startTime.getTime();
  const hours = Math.floor(durationMs / (1000 * 60 * 60));
  const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
  
  return `${hours}h ${minutes}m`;
}
