import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts";

// Sample data for the chart (This would normally come from API)
const weeklyData = [
  { day: "Mon", attendance: 87 },
  { day: "Tue", attendance: 92 },
  { day: "Wed", attendance: 84 },
  { day: "Thu", attendance: 79 },
  { day: "Fri", attendance: 76 },
  { day: "Sat", attendance: 38 },
  { day: "Sun", attendance: 12 },
];

const monthlyData = [
  { day: "Week 1", attendance: 82 },
  { day: "Week 2", attendance: 78 },
  { day: "Week 3", attendance: 85 },
  { day: "Week 4", attendance: 80 },
];

const quarterlyData = [
  { day: "Jan", attendance: 80 },
  { day: "Feb", attendance: 82 },
  { day: "Mar", attendance: 78 },
];

export function AttendanceChart() {
  const [timeRange, setTimeRange] = useState("week");
  
  // Select the data based on the selected time range
  const chartData = 
    timeRange === "week" ? weeklyData :
    timeRange === "month" ? monthlyData :
    quarterlyData;

  return (
    <Card>
      <CardHeader className="border-b border-border flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>Weekly Attendance Report</CardTitle>
          <CardDescription>Attendance percentage by day</CardDescription>
        </div>
        <div className="mt-2 sm:mt-0">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select a time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="h-[300px] mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="day" />
              <YAxis
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
                width={45}
              />
              <Tooltip
                formatter={(value) => [`${value}%`, "Attendance"]}
                labelFormatter={(label) => `Day: ${label}`}
              />
              <Bar
                dataKey="attendance"
                fill="#3B82F6"
                radius={[4, 4, 0, 0]}
                barSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-2 grid grid-cols-7 gap-2 text-center">
          {weeklyData.map((item) => (
            <div key={item.day}>
              <div className="text-xs font-medium text-muted-foreground">{item.day}</div>
              <div className="mt-1 text-sm font-semibold">{item.attendance}%</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
