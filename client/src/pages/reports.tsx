import { useState } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { Loader2, FileDown, FileUp, ChartBarStacked, PieChart as PieChartIcon, TrendingUp } from "lucide-react";

// Sample data for charts (would normally come from API)
const attendanceData = [
  { name: "Monday", present: 85, absent: 15, late: 5 },
  { name: "Tuesday", present: 90, absent: 10, late: 3 },
  { name: "Wednesday", present: 82, absent: 18, late: 7 },
  { name: "Thursday", present: 78, absent: 22, late: 5 },
  { name: "Friday", present: 75, absent: 25, late: 10 },
];

const overtimeData = [
  { name: "Week 1", hours: 23 },
  { name: "Week 2", hours: 17 },
  { name: "Week 3", hours: 32 },
  { name: "Week 4", hours: 27 },
];

const departmentData = [
  { name: "Engineering", value: 32 },
  { name: "Marketing", value: 18 },
  { name: "Sales", value: 24 },
  { name: "HR", value: 10 },
  { name: "Finance", value: 16 },
];

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

export default function Reports() {
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().substring(0, 10),
    end: new Date().toISOString().substring(0, 10),
  });
  const [department, setDepartment] = useState("all");
  const [reportType, setReportType] = useState("attendance");
  
  // This would be an actual API call in a real implementation
  const { isLoading } = useQuery({
    queryKey: ["/api/reports", reportType, dateRange, department],
    enabled: false, // Disable the query for this demo
  });
  
  const handleGenerateReport = () => {
    // This would trigger the API query in a real implementation
    console.log("Generating report with:", { reportType, dateRange, department });
  };
  
  const handleExportReport = (format: "csv" | "pdf") => {
    // In a real implementation, this would make an API call to export the data
    console.log(`Exporting ${reportType} report as ${format}`);
  };

  return (
    <AppLayout>
      <PageHeader 
        title="Reports" 
        description="Generate and export attendance and overtime reports." 
      />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Report Controls */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Report Options</CardTitle>
            <CardDescription>
              Configure and generate reports.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="report-type">Report Type</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger id="report-type">
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="attendance">Attendance Report</SelectItem>
                  <SelectItem value="overtime">Overtime Report</SelectItem>
                  <SelectItem value="department">Department Report</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="start-date">Start Date</Label>
              <Input
                id="start-date"
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="end-date">End Date</Label>
              <Input
                id="end-date"
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Select value={department} onValueChange={setDepartment}>
                <SelectTrigger id="department">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  <SelectItem value="engineering">Engineering</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="sales">Sales</SelectItem>
                  <SelectItem value="hr">Human Resources</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button 
              className="w-full mt-6" 
              onClick={handleGenerateReport}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate Report"
              )}
            </Button>
            
            <div className="pt-4 flex space-x-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => handleExportReport("csv")}
              >
                <FileDown className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => handleExportReport("pdf")}
              >
                <FileUp className="mr-2 h-4 w-4" />
                Export PDF
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Report Visualizations */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Report Visualizations</CardTitle>
            <CardDescription>
              Visual representation of the selected report data.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="charts" className="space-y-4">
              <TabsList>
                <TabsTrigger value="charts" className="flex items-center gap-2">
                  <ChartBarStacked className="h-4 w-4" />
                  <span>Charts</span>
                </TabsTrigger>
                <TabsTrigger value="trends" className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  <span>Trends</span>
                </TabsTrigger>
                <TabsTrigger value="summary" className="flex items-center gap-2">
                  <PieChartIcon className="h-4 w-4" />
                  <span>Summary</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="charts" className="pt-4">
                <div className="h-[350px]">
                  {reportType === "attendance" && (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={attendanceData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="present" fill="#3B82F6" name="Present" />
                        <Bar dataKey="absent" fill="#EF4444" name="Absent" />
                        <Bar dataKey="late" fill="#F59E0B" name="Late" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                  
                  {reportType === "overtime" && (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={overtimeData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="hours" stroke="#3B82F6" name="Overtime Hours" />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                  
                  {reportType === "department" && (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <Pie
                          data={departmentData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={120}
                          fill="#8884d8"
                          dataKey="value"
                          nameKey="name"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {departmentData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="trends" className="pt-4">
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={attendanceData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="present" stroke="#3B82F6" name="Present %" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>
              
              <TabsContent value="summary" className="pt-4">
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <Pie
                        data={[
                          { name: "Present", value: 82 },
                          { name: "Absent", value: 18 },
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        <Cell fill="#3B82F6" />
                        <Cell fill="#EF4444" />
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
