import { useState } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Save, Clock, Shield, Building, Bell } from "lucide-react";

export default function Settings() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("general");
  
  // General settings
  const [companyName, setCompanyName] = useState("Acme Corporation");
  const [timeZone, setTimeZone] = useState("UTC");
  const [emailNotifications, setEmailNotifications] = useState(true);
  
  // Attendance settings
  const [workdayStart, setWorkdayStart] = useState("09:00");
  const [workdayEnd, setWorkdayEnd] = useState("17:00");
  const [workdayHours, setWorkdayHours] = useState("8");
  const [weekendDays, setWeekendDays] = useState("saturday,sunday");
  const [gracePeriod, setGracePeriod] = useState("15");
  
  // Notification settings
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [clockInReminders, setClockInReminders] = useState(true);
  const [overtimeAlerts, setOvertimeAlerts] = useState(true);
  
  const handleSaveSettings = () => {
    // In a real implementation, this would make an API call to save the settings
    toast({
      title: "Settings saved",
      description: "Your changes have been saved successfully.",
    });
  };

  return (
    <AppLayout>
      <PageHeader 
        title="System Settings" 
        description="Configure application preferences and system settings." 
      />
      
      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
          <CardDescription>
            Manage your system preferences and configurations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6 grid grid-cols-3 w-full max-w-md">
              <TabsTrigger value="general" className="flex items-center gap-2">
                <Building className="h-4 w-4" />
                <span>General</span>
              </TabsTrigger>
              <TabsTrigger value="attendance" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>Attendance</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                <span>Notifications</span>
              </TabsTrigger>
            </TabsList>
            
            {/* General Settings */}
            <TabsContent value="general" className="space-y-6">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company-name">Company Name</Label>
                  <Input 
                    id="company-name" 
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="timezone">Time Zone</Label>
                  <Select value={timeZone} onValueChange={setTimeZone}>
                    <SelectTrigger id="timezone">
                      <SelectValue placeholder="Select time zone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC">UTC (Coordinated Universal Time)</SelectItem>
                      <SelectItem value="EST">EST (Eastern Standard Time)</SelectItem>
                      <SelectItem value="CST">CST (Central Standard Time)</SelectItem>
                      <SelectItem value="MST">MST (Mountain Standard Time)</SelectItem>
                      <SelectItem value="PST">PST (Pacific Standard Time)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="email-notifications">Email Notifications</Label>
                    <Switch 
                      id="email-notifications" 
                      checked={emailNotifications}
                      onCheckedChange={setEmailNotifications}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Receive email notifications for important events.
                  </p>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button onClick={handleSaveSettings} className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </TabsContent>
            
            {/* Attendance Settings */}
            <TabsContent value="attendance" className="space-y-6">
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="workday-start">Workday Start Time</Label>
                    <Input 
                      id="workday-start" 
                      type="time"
                      value={workdayStart}
                      onChange={(e) => setWorkdayStart(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="workday-end">Workday End Time</Label>
                    <Input 
                      id="workday-end" 
                      type="time"
                      value={workdayEnd}
                      onChange={(e) => setWorkdayEnd(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="workday-hours">Standard Workday Hours</Label>
                  <Input 
                    id="workday-hours" 
                    type="number"
                    min="1"
                    max="24"
                    value={workdayHours}
                    onChange={(e) => setWorkdayHours(e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">
                    Hours worked beyond this will be counted as overtime.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="weekend-days">Weekend Days</Label>
                  <Select value={weekendDays} onValueChange={setWeekendDays}>
                    <SelectTrigger id="weekend-days">
                      <SelectValue placeholder="Select weekend days" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="saturday,sunday">Saturday, Sunday</SelectItem>
                      <SelectItem value="friday,saturday">Friday, Saturday</SelectItem>
                      <SelectItem value="sunday">Sunday only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="grace-period">Clock In Grace Period (minutes)</Label>
                  <Input 
                    id="grace-period" 
                    type="number"
                    min="0"
                    max="60"
                    value={gracePeriod}
                    onChange={(e) => setGracePeriod(e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">
                    Employees will not be marked late if they clock in within this grace period.
                  </p>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button onClick={handleSaveSettings} className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </TabsContent>
            
            {/* Notification Settings */}
            <TabsContent value="notifications" className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Email Notifications</h3>
                <Separator />
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="email-alerts">Daily Attendance Alerts</Label>
                    <Switch 
                      id="email-alerts" 
                      checked={emailAlerts}
                      onCheckedChange={setEmailAlerts}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Send daily emails with attendance summaries to managers.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="clock-in-reminders">Clock In Reminders</Label>
                    <Switch 
                      id="clock-in-reminders" 
                      checked={clockInReminders}
                      onCheckedChange={setClockInReminders}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Remind employees who haven't clocked in by a certain time.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="overtime-alerts">Overtime Alerts</Label>
                    <Switch 
                      id="overtime-alerts" 
                      checked={overtimeAlerts}
                      onCheckedChange={setOvertimeAlerts}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Alert managers when employees are approaching overtime.
                  </p>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button onClick={handleSaveSettings} className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </AppLayout>
  );
}
