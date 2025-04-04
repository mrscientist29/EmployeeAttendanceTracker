import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { UserRole } from "@shared/schema";
import { Link } from "wouter";
import { BellIcon, ChevronDown, Clock, LogOut, User, Settings } from "lucide-react";
import { getInitials, stringToColor } from "@/lib/utils";

export function Header() {
  const { user, logoutMutation } = useAuth();
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  const roleBadge = () => {
    switch (user?.role) {
      case UserRole.ADMIN:
        return "bg-blue-100 text-blue-800";
      case UserRole.MANAGER:
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <header className="bg-background border-b h-16 flex items-center px-4 md:px-6">
      <div className="flex-1 flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/">
            <a className="flex items-center">
              <Clock className="h-6 w-6 text-primary mr-2" />
              <h1 className="text-xl font-semibold hidden md:block">Employee Attendance System</h1>
              <h1 className="text-xl font-semibold md:hidden">EAS</h1>
            </a>
          </Link>
        </div>
        
        {user && (
          <div className="flex items-center space-x-4">
            {/* Notifications Bell */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <BellIcon className="h-5 w-5" />
                  <span className="absolute top-1 right-1 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </span>
                  <span className="sr-only">Notifications</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="py-2 px-4 text-sm text-center text-muted-foreground">
                  No new notifications
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="p-1 relative">
                  <div className="flex items-center">
                    <div className={`h-8 w-8 rounded-full ${user ? stringToColor(`${user.firstName} ${user.lastName}`) : 'bg-primary'} flex items-center justify-center text-white mr-2`}>
                      {user ? getInitials(user.firstName, user.lastName) : 'U'}
                    </div>
                    <div className="hidden md:block text-left mr-1">
                      <div className="text-sm font-medium">
                        {user ? `${user.firstName} ${user.lastName}` : 'User'}
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center">
                        <span className={`inline-block rounded-full px-2 mr-1 ${roleBadge()}`}>
                          {user?.role}
                        </span>
                      </div>
                    </div>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer">
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="cursor-pointer" 
                  onClick={handleLogout}
                  disabled={logoutMutation.isPending}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  {logoutMutation.isPending ? "Logging out..." : "Log out"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </header>
  );
}
