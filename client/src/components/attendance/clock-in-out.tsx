import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { LogIn, LogOut, Loader2 } from "lucide-react";

interface ClockInOutProps {
  attendanceStatus?: {
    clockedIn: boolean;
    clockedOut: boolean;
    record?: any;
  };
  isLoading?: boolean;
}

export function ClockInOut({ attendanceStatus, isLoading = false }: ClockInOutProps) {
  const { toast } = useToast();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [elapsedTime, setElapsedTime] = useState<string>("00:00:00");
  
  // Clock in mutation
  const clockInMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/attendance/clock-in");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/attendance/status"] });
      toast({
        title: "Clocked in",
        description: "You have successfully clocked in for today.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Clock in failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Clock out mutation
  const clockOutMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/attendance/clock-out");
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/attendance/status"] });
      
      // Check if overtime was recorded
      if (data.overtime) {
        toast({
          title: "Overtime recorded",
          description: "You've worked overtime today. It will be reviewed by your manager.",
          variant: "default",
        });
      } else {
        toast({
          title: "Clocked out",
          description: "You have successfully clocked out for today.",
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Clock out failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  // Calculate elapsed time if clocked in
  useEffect(() => {
    if (attendanceStatus?.clockedIn && !attendanceStatus?.clockedOut && attendanceStatus?.record) {
      const timer = setInterval(() => {
        const startTime = new Date(attendanceStatus.record.clockInTime);
        const now = new Date();
        const diff = now.getTime() - startTime.getTime();
        
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        setElapsedTime(
          `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
        );
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [attendanceStatus]);

  const formatCurrentTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  };

  const formatCurrentDate = (date: Date) => {
    return date.toLocaleDateString([], { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center">
              <div className="text-4xl font-bold mb-1">{formatCurrentTime(currentTime)}</div>
              <div className="text-sm text-muted-foreground">{formatCurrentDate(currentTime)}</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center">
              <div className="text-sm text-muted-foreground mb-1">Current Session</div>
              <div className="text-3xl font-bold clock-animation">
                {attendanceStatus?.clockedIn && !attendanceStatus?.clockedOut ? elapsedTime : "00:00:00"}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button
          size="lg"
          className="flex-1 h-16 text-lg gap-2"
          onClick={() => clockInMutation.mutate()}
          disabled={
            isLoading || 
            clockInMutation.isPending || 
            clockOutMutation.isPending || 
            (attendanceStatus?.clockedIn && !attendanceStatus?.clockedOut)
          }
        >
          {clockInMutation.isPending ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            <LogIn className="h-5 w-5" />
          )}
          Clock In
        </Button>
        
        <Button
          size="lg"
          variant="destructive"
          className="flex-1 h-16 text-lg gap-2"
          onClick={() => clockOutMutation.mutate()}
          disabled={
            isLoading || 
            clockInMutation.isPending || 
            clockOutMutation.isPending || 
            !attendanceStatus?.clockedIn || 
            attendanceStatus?.clockedOut
          }
        >
          {clockOutMutation.isPending ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            <LogOut className="h-5 w-5" />
          )}
          Clock Out
        </Button>
      </div>
      
      <div className="text-center text-sm text-muted-foreground">
        {isLoading ? (
          <div className="flex justify-center">
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Checking attendance status...
          </div>
        ) : attendanceStatus?.clockedIn ? (
          attendanceStatus?.clockedOut ? (
            <div className="text-green-600">You have completed your shift for today.</div>
          ) : (
            <div>You are currently clocked in. Don't forget to clock out at the end of your shift.</div>
          ) 
        ) : (
          <div>You have not clocked in yet today.</div>
        )}
      </div>
    </div>
  );
}
