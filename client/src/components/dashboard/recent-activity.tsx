import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatRelativeTime } from "@/lib/utils";
import { Link } from "wouter";
import {
  LogIn,
  LogOut,
  CheckCircle,
  XCircle,
  UserPlus,
  Clock,
  Activity
} from "lucide-react";

interface ActivityItem {
  id: number;
  action: string;
  timestamp: string;
  details: string;
  user?: {
    id: number;
    username: string;
    firstName: string;
    lastName: string;
  };
}

interface RecentActivityProps {
  activity?: ActivityItem[];
  isLoading?: boolean;
}

export function RecentActivity({ activity, isLoading = false }: RecentActivityProps) {
  const getActivityIcon = (action: string) => {
    switch (action) {
      case "CLOCK_IN":
        return (
          <div className="flex-shrink-0 bg-blue-100 rounded-full p-1">
            <LogIn className="h-5 w-5 text-blue-600" />
          </div>
        );
      case "CLOCK_OUT":
        return (
          <div className="flex-shrink-0 bg-red-100 rounded-full p-1">
            <LogOut className="h-5 w-5 text-red-600" />
          </div>
        );
      case "OVERTIME_APPROVED":
        return (
          <div className="flex-shrink-0 bg-green-100 rounded-full p-1">
            <CheckCircle className="h-5 w-5 text-green-600" />
          </div>
        );
      case "OVERTIME_REJECTED":
        return (
          <div className="flex-shrink-0 bg-red-100 rounded-full p-1">
            <XCircle className="h-5 w-5 text-red-600" />
          </div>
        );
      case "USER_CREATED":
      case "ADMIN_USER_CREATED":
        return (
          <div className="flex-shrink-0 bg-purple-100 rounded-full p-1">
            <UserPlus className="h-5 w-5 text-purple-600" />
          </div>
        );
      case "USER_LOGIN":
      case "USER_LOGOUT":
        return (
          <div className="flex-shrink-0 bg-gray-100 rounded-full p-1">
            <Activity className="h-5 w-5 text-gray-600" />
          </div>
        );
      default:
        return (
          <div className="flex-shrink-0 bg-gray-100 rounded-full p-1">
            <Clock className="h-5 w-5 text-gray-600" />
          </div>
        );
    }
  };

  const formatActivityText = (activity: ActivityItem) => {
    const userName = activity.user ? `${activity.user.firstName} ${activity.user.lastName}` : "A user";
    
    switch (activity.action) {
      case "CLOCK_IN":
        return `${userName} clocked in`;
      case "CLOCK_OUT":
        return `${userName} clocked out`;
      case "OVERTIME_APPROVED":
        return `${userName} approved overtime`;
      case "OVERTIME_REJECTED":
        return `${userName} rejected overtime`;
      case "USER_CREATED":
      case "ADMIN_USER_CREATED":
        return activity.details || `${userName} was added`;
      case "USER_LOGIN":
        return `${userName} logged in`;
      case "USER_LOGOUT":
        return `${userName} logged out`;
      default:
        return activity.details || "Activity recorded";
    }
  };

  return (
    <Card>
      <CardHeader className="border-b border-border">
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="p-5 space-y-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : !activity || activity.length === 0 ? (
          <div className="p-5 text-center text-muted-foreground">
            No recent activity found
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {activity.map((item) => (
              <li key={item.id} className="flex items-start space-x-3 p-5">
                {getActivityIcon(item.action)}
                <div>
                  <p className="text-sm font-medium">{formatActivityText(item)}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatRelativeTime(item.timestamp)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
        <div className="p-4 border-t border-border">
          <Link href="/audit-logs">
            <a className="text-sm font-medium text-primary hover:text-primary-focus">
              View all activity →
            </a>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
