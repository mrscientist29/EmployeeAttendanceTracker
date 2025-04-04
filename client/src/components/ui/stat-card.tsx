import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  Users,
  CheckCircle,
  AlertCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  LogIn,
  LogOut,
  XCircle
} from "lucide-react";
import { Link } from "wouter";

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: 
    | "users" 
    | "check-circle" 
    | "alert-circle" 
    | "clock" 
    | "log-in" 
    | "log-out" 
    | "x-circle";
  color?: 
    | "blue" 
    | "green" 
    | "red" 
    | "amber" 
    | "purple" 
    | "gray";
  subtitle?: string;
  change?: string;
  changeText?: string;
  actionLink?: string;
  actionText?: string;
  isLoading?: boolean;
}

export function StatCard({
  title,
  value,
  icon,
  color = "blue",
  subtitle,
  change,
  changeText,
  actionLink,
  actionText,
  isLoading = false,
}: StatCardProps) {
  const getIcon = () => {
    switch (icon) {
      case "users":
        return <Users className="h-6 w-6" />;
      case "check-circle":
        return <CheckCircle className="h-6 w-6" />;
      case "alert-circle":
        return <AlertCircle className="h-6 w-6" />;
      case "clock":
        return <Clock className="h-6 w-6" />;
      case "log-in":
        return <LogIn className="h-6 w-6" />;
      case "log-out":
        return <LogOut className="h-6 w-6" />;
      case "x-circle":
        return <XCircle className="h-6 w-6" />;
      default:
        return null;
    }
  };

  const getColorClasses = () => {
    switch (color) {
      case "blue":
        return "bg-blue-100 text-blue-600";
      case "green":
        return "bg-green-100 text-green-600";
      case "red":
        return "bg-red-100 text-red-600";
      case "amber":
        return "bg-amber-100 text-amber-600";
      case "purple":
        return "bg-purple-100 text-purple-600";
      case "gray":
        return "bg-gray-100 text-gray-600";
      default:
        return "bg-blue-100 text-blue-600";
    }
  };

  const isPositiveChange = change && change.startsWith("+");

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold">{value}</div>
            )}
            {subtitle && <div className="text-sm text-muted-foreground mt-1">{subtitle}</div>}
            {change && (
              <div className="mt-2 flex items-center text-sm">
                <span
                  className={cn(
                    "flex items-center",
                    isPositiveChange ? "text-green-500" : "text-red-500"
                  )}
                >
                  {isPositiveChange ? (
                    <TrendingUp className="h-4 w-4 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 mr-1" />
                  )}
                  {change}
                </span>
                {changeText && (
                  <span className="text-muted-foreground ml-2">{changeText}</span>
                )}
              </div>
            )}
            {actionLink && (
              <div className="mt-2">
                <Link href={actionLink}>
                  <a className="text-sm font-medium text-primary hover:underline">
                    {actionText || "View details"}
                  </a>
                </Link>
              </div>
            )}
          </div>
          {icon && <div className={cn("p-3 rounded-full", getColorClasses())}>{getIcon()}</div>}
        </div>
      </CardContent>
    </Card>
  );
}
