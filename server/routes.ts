import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, requireRole, hashPassword } from "./auth";
import { UserRole, insertUserSchema, insertAttendanceSchema, insertOvertimeApprovalSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Add a health check endpoint
  app.get("/api/health", (req, res) => {
    res.status(200).json({ status: "ok", message: "Server is running", timestamp: new Date().toISOString() });
  });
  
  // Setup authentication routes
  setupAuth(app);

  // User management routes (Admin only)
  app.get("/api/users", requireRole([UserRole.ADMIN]), async (req, res) => {
    try {
      const users = await storage.getAllActiveUsers();
      // Filter out passwords
      const sanitizedUsers = users.map(({ password, ...rest }) => rest);
      res.json(sanitizedUsers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.post("/api/users", requireRole([UserRole.ADMIN]), async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      const user = await storage.createUser({
        ...userData,
        password: await hashPassword(userData.password),
      });
      
      // Log user creation
      await storage.createAuditLog({
        userId: req.user.id,
        action: "ADMIN_USER_CREATED",
        details: `Admin ${req.user.username} created user ${user.username}`,
        ipAddress: req.ip
      });
      
      // Filter out password
      const { password, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      res.status(400).json({ message: "Invalid user data" });
    }
  });

  app.put("/api/users/:id", requireRole([UserRole.ADMIN]), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const userData = req.body;
      
      // If password is provided, hash it
      if (userData.password) {
        userData.password = await hashPassword(userData.password);
      }
      
      const updatedUser = await storage.updateUser(id, userData);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Log user update
      await storage.createAuditLog({
        userId: req.user.id,
        action: "USER_UPDATED",
        details: `Admin ${req.user.username} updated user ${updatedUser.username}`,
        ipAddress: req.ip
      });
      
      // Filter out password
      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(400).json({ message: "Failed to update user" });
    }
  });

  app.delete("/api/users/:id", requireRole([UserRole.ADMIN]), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Don't allow deleting self
      if (id === req.user.id) {
        return res.status(400).json({ message: "Cannot deactivate your own account" });
      }
      
      const success = await storage.deactivateUser(id);
      
      if (!success) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Log user deactivation
      await storage.createAuditLog({
        userId: req.user.id,
        action: "USER_DEACTIVATED",
        details: `Admin ${req.user.username} deactivated user ${user.username}`,
        ipAddress: req.ip
      });
      
      res.status(200).json({ message: "User deactivated successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to deactivate user" });
    }
  });

  // Clock In/Out routes
  app.post("/api/attendance/clock-in", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      // Check if user already clocked in today
      const existingRecord = await storage.getTodayAttendanceForUser(req.user.id);
      
      if (existingRecord) {
        return res.status(400).json({ message: "Already clocked in today" });
      }
      
      const record = await storage.createAttendanceRecord({
        userId: req.user.id,
        clockInTime: new Date(),
        ipAddress: req.ip,
        overtime: false,
      });
      
      // Log clock in
      await storage.createAuditLog({
        userId: req.user.id,
        action: "CLOCK_IN",
        details: `User ${req.user.username} clocked in`,
        ipAddress: req.ip
      });
      
      res.status(201).json(record);
    } catch (error) {
      res.status(500).json({ message: "Failed to clock in" });
    }
  });

  app.post("/api/attendance/clock-out", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      // Find today's attendance record
      const existingRecord = await storage.getTodayAttendanceForUser(req.user.id);
      
      if (!existingRecord) {
        return res.status(400).json({ message: "No clock-in record found for today" });
      }
      
      if (existingRecord.clockOutTime) {
        return res.status(400).json({ message: "Already clocked out today" });
      }
      
      const clockOutTime = new Date();
      
      // Calculate hours worked
      const clockInTime = new Date(existingRecord.clockInTime);
      const hoursWorked = (clockOutTime.getTime() - clockInTime.getTime()) / (1000 * 60 * 60);
      
      // Check for overtime (over 8 hours)
      const overtime = hoursWorked > 8;
      const overtimeHours = overtime ? Math.round((hoursWorked - 8) * 100) : 0; // Store in cents for precision
      
      const updatedRecord = await storage.updateAttendanceRecord(existingRecord.id, {
        clockOutTime,
        overtime,
        overtimeHours,
      });
      
      // Create overtime approval if needed
      if (overtime) {
        await storage.createOvertimeApproval({
          attendanceId: existingRecord.id,
          userId: req.user.id,
          regularHours: 800, // 8 hours in cents
          overtimeHours,
          status: "pending",
        });
      }
      
      // Log clock out
      await storage.createAuditLog({
        userId: req.user.id,
        action: "CLOCK_OUT",
        details: `User ${req.user.username} clocked out`,
        ipAddress: req.ip
      });
      
      res.json(updatedRecord);
    } catch (error) {
      res.status(500).json({ message: "Failed to clock out" });
    }
  });

  // Get attendance status for today
  app.get("/api/attendance/status", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const record = await storage.getTodayAttendanceForUser(req.user.id);
      res.json({ 
        clockedIn: !!record,
        clockedOut: record ? !!record.clockOutTime : false, 
        record 
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to get attendance status" });
    }
  });

  // Get user's attendance records
  app.get("/api/attendance/records", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const records = await storage.getUserAttendanceRecords(req.user.id);
      res.json(records);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch attendance records" });
    }
  });

  // Get attendance records for a specific date range (Managers and Admins)
  app.get("/api/attendance/range", requireRole([UserRole.MANAGER, UserRole.ADMIN]), async (req, res) => {
    try {
      const startDate = req.query.start ? new Date(req.query.start as string) : new Date();
      const endDate = req.query.end ? new Date(req.query.end as string) : new Date();
      
      // Validate dates
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return res.status(400).json({ message: "Invalid date range" });
      }
      
      const records = await storage.getAttendanceByDateRange(startDate, endDate);
      
      // If userId is provided, filter by user
      const userId = req.query.userId ? parseInt(req.query.userId as string) : null;
      
      const filteredRecords = userId ? records.filter(record => record.userId === userId) : records;
      
      // Join with user data
      const users = await storage.getAllUsers();
      const userMap = new Map(users.map(u => [u.id, u]));

      const recordsWithUserData = filteredRecords.map(record => {
        const user = userMap.get(record.userId);
        return {
          ...record,
          user: user ? {
            id: user.id,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            department: user.department,
            role: user.role
          } : null
        };
      });
      
      res.json(recordsWithUserData);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch attendance records" });
    }
  });

  // Get today's attendance (For managers and admins)
  app.get("/api/attendance/today", requireRole([UserRole.MANAGER, UserRole.ADMIN]), async (req, res) => {
    try {
      const records = await storage.getTodayAttendanceRecords();
      
      // Join with user data
      const users = await storage.getAllUsers();
      const userMap = new Map(users.map(u => [u.id, u]));

      const recordsWithUserData = records.map(record => {
        const user = userMap.get(record.userId);
        return {
          ...record,
          user: user ? {
            id: user.id,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            department: user.department,
            role: user.role
          } : null
        };
      });
      
      res.json(recordsWithUserData);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch today's attendance" });
    }
  });

  // Overtime approval routes
  app.get("/api/overtime/pending", requireRole([UserRole.MANAGER, UserRole.ADMIN]), async (req, res) => {
    try {
      const approvals = await storage.getPendingOvertimeApprovals();
      
      // Join with user data
      const users = await storage.getAllUsers();
      const userMap = new Map(users.map(u => [u.id, u]));

      const approvalsWithUserData = approvals.map(approval => {
        const user = userMap.get(approval.userId);
        return {
          ...approval,
          user: user ? {
            id: user.id,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            department: user.department
          } : null
        };
      });
      
      res.json(approvalsWithUserData);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch pending approvals" });
    }
  });

  // Get user's pending overtime approvals
  app.get("/api/overtime/my-pending", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const approvals = await storage.getUserPendingOvertimeApprovals(req.user.id);
      res.json(approvals);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch your pending approvals" });
    }
  });

  // Approve/reject overtime
  app.put("/api/overtime/:id", requireRole([UserRole.MANAGER, UserRole.ADMIN]), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid approval ID" });
      }
      
      const { status, comments } = req.body;
      
      if (status !== "approved" && status !== "rejected") {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      const approval = await storage.getOvertimeApproval(id);
      
      if (!approval) {
        return res.status(404).json({ message: "Overtime approval not found" });
      }
      
      if (approval.status !== "pending") {
        return res.status(400).json({ message: "Overtime has already been processed" });
      }
      
      const updatedApproval = await storage.updateOvertimeApproval(id, {
        status,
        approverId: req.user.id,
        approvalDate: new Date(),
        comments: comments || ""
      });
      
      // Log approval action
      await storage.createAuditLog({
        userId: req.user.id,
        action: status === "approved" ? "OVERTIME_APPROVED" : "OVERTIME_REJECTED",
        details: `${status === "approved" ? "Approved" : "Rejected"} overtime for user ID ${approval.userId}`,
        ipAddress: req.ip
      });
      
      res.json(updatedApproval);
    } catch (error) {
      res.status(500).json({ message: "Failed to process overtime approval" });
    }
  });

  // Audit log routes (Admin only)
  app.get("/api/audit-logs", requireRole([UserRole.ADMIN]), async (req, res) => {
    try {
      const logs = await storage.getAuditLogs();
      
      // Join with user data
      const users = await storage.getAllUsers();
      const userMap = new Map(users.map(u => [u.id, u]));

      const logsWithUserData = logs.map(log => {
        const user = log.userId ? userMap.get(log.userId) : null;
        return {
          ...log,
          user: user ? {
            id: user.id,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName
          } : null
        };
      });
      
      res.json(logsWithUserData);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch audit logs" });
    }
  });

  // Stats for dashboard
  app.get("/api/stats/dashboard", requireRole([UserRole.ADMIN, UserRole.MANAGER]), async (req, res) => {
    try {
      // Get total employees count
      const users = await storage.getAllActiveUsers();
      const totalEmployees = users.length;
      
      // Get present today count
      const todayRecords = await storage.getTodayAttendanceRecords();
      const presentToday = todayRecords.length;
      
      // Get pending approvals count
      const pendingApprovals = await storage.getPendingOvertimeApprovals();
      
      // Calculate total overtime hours
      const overtimeHours = pendingApprovals.reduce((total, approval) => {
        return total + (approval.overtimeHours || 0);
      }, 0) / 100; // Convert from cents to hours
      
      // Get recent activity (audit logs)
      const auditLogs = await storage.getAuditLogs();
      const recentActivity = auditLogs.slice(0, 5);
      
      // Join user data with recent activity
      const allUsers = await storage.getAllUsers();
      const userMap = new Map(allUsers.map(u => [u.id, u]));

      const activityWithUserData = recentActivity.map(log => {
        const user = log.userId ? userMap.get(log.userId) : null;
        return {
          ...log,
          user: user ? {
            id: user.id,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName
          } : null
        };
      });
      
      res.json({
        totalEmployees,
        presentToday,
        presentPercentage: totalEmployees > 0 ? Math.round((presentToday / totalEmployees) * 100) : 0,
        pendingApprovalsCount: pendingApprovals.length,
        overtimeHours,
        recentActivity: activityWithUserData
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

// Export attendance data as CSV
  app.get("/api/export/attendance", requireRole([UserRole.MANAGER, UserRole.ADMIN]), async (req, res) => {
    try {
      const startDate = req.query.start ? new Date(req.query.start as string) : undefined;
      const endDate = req.query.end ? new Date(req.query.end as string) : undefined;

      if (!startDate || !endDate || isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return res.status(400).json({ message: "Invalid or missing date range" });
      }

      const records = await storage.getAttendanceByDateRange(startDate, endDate);
      const users = await storage.getAllUsers();
      const userMap = new Map(users.map(u => [u.id, u]));

      const recordsWithUserData = records.map(record => {
        const user = userMap.get(record.userId);
        return {
          ID: record.id,
          Employee: user ? `${user.firstName} ${user.lastName}` : 'N/A',
          Department: user ? user.department : 'N/A',
          'Clock In': record.clockInTime.toISOString(),
          'Clock Out': record.clockOutTime ? record.clockOutTime.toISOString() : 'N/A',
          Overtime: record.overtime ? 'Yes' : 'No',
          'Overtime Hours': (record.overtimeHours || 0) / 100,
        };
      });

      if (recordsWithUserData.length === 0) {
        return res.status(404).json({ message: "No attendance records found for the selected date range" });
      }

      // Convert to CSV
      const headers = Object.keys(recordsWithUserData[0]);
      const csv = [
        headers.join(','),
        ...recordsWithUserData.map(row => headers.map(header => `"${row[header]}"`).join(','))
      ].join('\n');

      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", `attachment; filename="attendance_${startDate.toISOString().split('T')[0]}_${endDate.toISOString().split('T')[0]}.csv"`);
      res.status(200).send(csv);
    } catch (error) {
      res.status(500).json({ message: "Failed to export attendance data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
