import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Role enum for user roles
export enum UserRole {
  EMPLOYEE = "employee",
  MANAGER = "manager",
  ADMIN = "admin",
}

// Main user table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  role: text("role").$type<UserRole>().notNull().default(UserRole.EMPLOYEE),
  department: text("department"),
  active: boolean("active").notNull().default(true),
});

// Attendance records table
export const attendanceRecords = pgTable("attendance_records", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  clockInTime: timestamp("clock_in_time").notNull(),
  clockOutTime: timestamp("clock_out_time"),
  ipAddress: text("ip_address"),
  overtime: boolean("overtime").default(false),
  overtimeHours: integer("overtime_hours"),
});

// Overtime approvals table
export const overtimeApprovals = pgTable("overtime_approvals", {
  id: serial("id").primaryKey(),
  attendanceId: integer("attendance_id").notNull(),
  userId: integer("user_id").notNull(),
  approverId: integer("approver_id"),
  requestDate: timestamp("request_date").notNull().defaultNow(),
  regularHours: integer("regular_hours").notNull(),
  overtimeHours: integer("overtime_hours").notNull(),
  status: text("status").notNull().default("pending"), // pending, approved, rejected
  approvalDate: timestamp("approval_date"),
  comments: text("comments"),
});

// Audit logs table
export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  action: text("action").notNull(),
  details: text("details"),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  ipAddress: text("ip_address"),
});

// Create Zod schemas for insert operations
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

export const insertAttendanceSchema = createInsertSchema(attendanceRecords).omit({
  id: true,
});

export const insertOvertimeApprovalSchema = createInsertSchema(overtimeApprovals).omit({
  id: true,
  requestDate: true,
  approvalDate: true,
});

export const insertAuditLogSchema = createInsertSchema(auditLogs).omit({
  id: true,
  timestamp: true,
});

// Define types based on the schemas
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type AttendanceRecord = typeof attendanceRecords.$inferSelect;
export type InsertAttendanceRecord = z.infer<typeof insertAttendanceSchema>;

export type OvertimeApproval = typeof overtimeApprovals.$inferSelect;
export type InsertOvertimeApproval = z.infer<typeof insertOvertimeApprovalSchema>;

export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;

// Authentication types
export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export type LoginData = z.infer<typeof loginSchema>;
