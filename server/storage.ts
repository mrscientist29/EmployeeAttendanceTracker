import { 
  users, User, InsertUser, 
  attendanceRecords, AttendanceRecord, InsertAttendanceRecord,
  overtimeApprovals, OvertimeApproval, InsertOvertimeApproval,
  auditLogs, AuditLog, InsertAuditLog, UserRole
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import { db, pool } from "./db";
import { eq, and, gte, lte, desc, lt } from "drizzle-orm";
import connectPg from "connect-pg-simple";

const MemoryStore = createMemoryStore(session);
const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User | undefined>;
  deactivateUser(id: number): Promise<boolean>;
  getAllUsers(): Promise<User[]>;
  getAllActiveUsers(): Promise<User[]>;
  getUsersByRole(role: UserRole): Promise<User[]>;
  
  // Attendance methods
  createAttendanceRecord(record: InsertAttendanceRecord): Promise<AttendanceRecord>;
  getAttendanceRecord(id: number): Promise<AttendanceRecord | undefined>;
  updateAttendanceRecord(id: number, record: Partial<AttendanceRecord>): Promise<AttendanceRecord | undefined>;
  getUserAttendanceRecords(userId: number): Promise<AttendanceRecord[]>;
  getTodayAttendanceRecords(): Promise<AttendanceRecord[]>;
  getTodayAttendanceForUser(userId: number): Promise<AttendanceRecord | undefined>;
  getAttendanceByDateRange(startDate: Date, endDate: Date): Promise<AttendanceRecord[]>;
  
  // Overtime approval methods
  createOvertimeApproval(approval: InsertOvertimeApproval): Promise<OvertimeApproval>;
  getOvertimeApproval(id: number): Promise<OvertimeApproval | undefined>;
  updateOvertimeApproval(id: number, approval: Partial<OvertimeApproval>): Promise<OvertimeApproval | undefined>;
  getPendingOvertimeApprovals(): Promise<OvertimeApproval[]>;
  getUserPendingOvertimeApprovals(userId: number): Promise<OvertimeApproval[]>;
  
  // Audit log methods
  createAuditLog(log: InsertAuditLog): Promise<AuditLog>;
  getAuditLogs(): Promise<AuditLog[]>;
  getAuditLogsByUser(userId: number): Promise<AuditLog[]>;
  
  // Session store
  sessionStore: any; // Using any for session store type
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private attendanceRecords: Map<number, AttendanceRecord>;
  private overtimeApprovals: Map<number, OvertimeApproval>;
  private auditLogs: Map<number, AuditLog>;
  private userIdCounter: number;
  private attendanceIdCounter: number;
  private overtimeApprovalIdCounter: number;
  private auditLogIdCounter: number;
  public sessionStore: any; // Using any for session store

  constructor() {
    this.users = new Map();
    this.attendanceRecords = new Map();
    this.overtimeApprovals = new Map();
    this.auditLogs = new Map();
    this.userIdCounter = 1;
    this.attendanceIdCounter = 1;
    this.overtimeApprovalIdCounter = 1;
    this.auditLogIdCounter = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // 24 hours
    });
    
    // Seed admin user
    this.createUser({
      username: "admin",
      password: "$2b$10$HfzIhGCCaxqyaIdGgjARSuOKAcm1Uy82YfLuNaajn6JrjLWy9Sj/W", // "password"
      email: "admin@example.com",
      firstName: "Admin",
      lastName: "User",
      role: UserRole.ADMIN,
      department: "Administration",
      active: true
    });
    
    // Seed manager user
    this.createUser({
      username: "manager",
      password: "$2b$10$HfzIhGCCaxqyaIdGgjARSuOKAcm1Uy82YfLuNaajn6JrjLWy9Sj/W", // "password"
      email: "manager@example.com",
      firstName: "Manager",
      lastName: "User",
      role: UserRole.MANAGER,
      department: "Engineering",
      active: true
    });
    
    // Seed employee user
    this.createUser({
      username: "employee",
      password: "$2b$10$HfzIhGCCaxqyaIdGgjARSuOKAcm1Uy82YfLuNaajn6JrjLWy9Sj/W", // "password"
      email: "employee@example.com",
      firstName: "Employee",
      lastName: "User",
      role: UserRole.EMPLOYEE,
      department: "Engineering",
      active: true
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase()
    );
  }

  async createUser(userData: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...userData, id };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async deactivateUser(id: number): Promise<boolean> {
    const user = this.users.get(id);
    if (!user) return false;
    
    user.active = false;
    this.users.set(id, user);
    return true;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async getAllActiveUsers(): Promise<User[]> {
    return Array.from(this.users.values()).filter(user => user.active);
  }

  async getUsersByRole(role: UserRole): Promise<User[]> {
    return Array.from(this.users.values()).filter(user => user.role === role && user.active);
  }

  // Attendance methods
  async createAttendanceRecord(recordData: InsertAttendanceRecord): Promise<AttendanceRecord> {
    const id = this.attendanceIdCounter++;
    const record: AttendanceRecord = { ...recordData, id };
    this.attendanceRecords.set(id, record);
    return record;
  }

  async getAttendanceRecord(id: number): Promise<AttendanceRecord | undefined> {
    return this.attendanceRecords.get(id);
  }

  async updateAttendanceRecord(
    id: number, 
    recordData: Partial<AttendanceRecord>
  ): Promise<AttendanceRecord | undefined> {
    const record = this.attendanceRecords.get(id);
    if (!record) return undefined;
    
    const updatedRecord = { ...record, ...recordData };
    this.attendanceRecords.set(id, updatedRecord);
    return updatedRecord;
  }

  async getUserAttendanceRecords(userId: number): Promise<AttendanceRecord[]> {
    return Array.from(this.attendanceRecords.values())
      .filter(record => record.userId === userId)
      .sort((a, b) => new Date(b.clockInTime).getTime() - new Date(a.clockInTime).getTime());
  }

  async getTodayAttendanceRecords(): Promise<AttendanceRecord[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return Array.from(this.attendanceRecords.values())
      .filter(record => {
        const recordDate = new Date(record.clockInTime);
        recordDate.setHours(0, 0, 0, 0);
        return recordDate.getTime() === today.getTime();
      });
  }

  async getTodayAttendanceForUser(userId: number): Promise<AttendanceRecord | undefined> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return Array.from(this.attendanceRecords.values())
      .find(record => {
        const recordDate = new Date(record.clockInTime);
        recordDate.setHours(0, 0, 0, 0);
        return record.userId === userId && recordDate.getTime() === today.getTime();
      });
  }

  async getAttendanceByDateRange(startDate: Date, endDate: Date): Promise<AttendanceRecord[]> {
    return Array.from(this.attendanceRecords.values())
      .filter(record => {
        const recordDate = new Date(record.clockInTime);
        return recordDate >= startDate && recordDate <= endDate;
      })
      .sort((a, b) => new Date(b.clockInTime).getTime() - new Date(a.clockInTime).getTime());
  }

  // Overtime approval methods
  async createOvertimeApproval(approvalData: InsertOvertimeApproval): Promise<OvertimeApproval> {
    const id = this.overtimeApprovalIdCounter++;
    const approval: OvertimeApproval = { 
      ...approvalData, 
      id, 
      requestDate: new Date() 
    };
    this.overtimeApprovals.set(id, approval);
    return approval;
  }

  async getOvertimeApproval(id: number): Promise<OvertimeApproval | undefined> {
    return this.overtimeApprovals.get(id);
  }

  async updateOvertimeApproval(
    id: number, 
    approvalData: Partial<OvertimeApproval>
  ): Promise<OvertimeApproval | undefined> {
    const approval = this.overtimeApprovals.get(id);
    if (!approval) return undefined;
    
    const updatedApproval = { ...approval, ...approvalData };
    this.overtimeApprovals.set(id, updatedApproval);
    return updatedApproval;
  }

  async getPendingOvertimeApprovals(): Promise<OvertimeApproval[]> {
    return Array.from(this.overtimeApprovals.values())
      .filter(approval => approval.status === "pending")
      .sort((a, b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime());
  }

  async getUserPendingOvertimeApprovals(userId: number): Promise<OvertimeApproval[]> {
    return Array.from(this.overtimeApprovals.values())
      .filter(approval => approval.userId === userId && approval.status === "pending")
      .sort((a, b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime());
  }

  // Audit log methods
  async createAuditLog(logData: InsertAuditLog): Promise<AuditLog> {
    const id = this.auditLogIdCounter++;
    const log: AuditLog = { ...logData, id, timestamp: new Date() };
    this.auditLogs.set(id, log);
    return log;
  }

  async getAuditLogs(): Promise<AuditLog[]> {
    return Array.from(this.auditLogs.values())
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  async getAuditLogsByUser(userId: number): Promise<AuditLog[]> {
    return Array.from(this.auditLogs.values())
      .filter(log => log.userId === userId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }
}

export class DatabaseStorage implements IStorage {
  public sessionStore: any; // Session store type

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async createUser(userData: InsertUser): Promise<User> {
    const result = await db.insert(users).values(userData).returning();
    return result[0];
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const result = await db.update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    
    return result[0];
  }

  async deactivateUser(id: number): Promise<boolean> {
    const result = await db.update(users)
      .set({ active: false })
      .where(eq(users.id, id))
      .returning();
    
    return result.length > 0;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async getAllActiveUsers(): Promise<User[]> {
    return await db.select().from(users).where(eq(users.active, true));
  }

  async getUsersByRole(role: UserRole): Promise<User[]> {
    return await db.select().from(users).where(eq(users.role, role));
  }

  // Attendance methods
  async createAttendanceRecord(recordData: InsertAttendanceRecord): Promise<AttendanceRecord> {
    const result = await db.insert(attendanceRecords).values(recordData).returning();
    return result[0];
  }

  async getAttendanceRecord(id: number): Promise<AttendanceRecord | undefined> {
    const result = await db.select().from(attendanceRecords).where(eq(attendanceRecords.id, id));
    return result[0];
  }

  async updateAttendanceRecord(
    id: number, 
    recordData: Partial<AttendanceRecord>
  ): Promise<AttendanceRecord | undefined> {
    const result = await db.update(attendanceRecords)
      .set(recordData)
      .where(eq(attendanceRecords.id, id))
      .returning();
    
    return result[0];
  }

  async getUserAttendanceRecords(userId: number): Promise<AttendanceRecord[]> {
    return await db.select()
      .from(attendanceRecords)
      .where(eq(attendanceRecords.userId, userId))
      .orderBy(desc(attendanceRecords.clockInTime));
  }

  async getTodayAttendanceRecords(): Promise<AttendanceRecord[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return await db.select()
      .from(attendanceRecords)
      .where(
        and(
          gte(attendanceRecords.clockInTime, today),
          lt(attendanceRecords.clockInTime, tomorrow)
        )
      );
  }

  async getTodayAttendanceForUser(userId: number): Promise<AttendanceRecord | undefined> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const result = await db.select()
      .from(attendanceRecords)
      .where(
        and(
          eq(attendanceRecords.userId, userId),
          gte(attendanceRecords.clockInTime, today),
          lt(attendanceRecords.clockInTime, tomorrow)
        )
      );
    
    return result[0];
  }

  async getAttendanceByDateRange(startDate: Date, endDate: Date): Promise<AttendanceRecord[]> {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    
    return await db.select()
      .from(attendanceRecords)
      .where(
        and(
          gte(attendanceRecords.clockInTime, start),
          lte(attendanceRecords.clockInTime, end)
        )
      )
      .orderBy(attendanceRecords.clockInTime);
  }

  // Overtime approval methods
  async createOvertimeApproval(approvalData: InsertOvertimeApproval): Promise<OvertimeApproval> {
    // Ensure status is set if not provided
    const dataWithDefaults = {
      ...approvalData,
      status: approvalData.status || "pending",
      requestDate: approvalData.requestDate || new Date()
    };
    
    const result = await db.insert(overtimeApprovals).values(dataWithDefaults).returning();
    return result[0];
  }

  async getOvertimeApproval(id: number): Promise<OvertimeApproval | undefined> {
    const result = await db.select().from(overtimeApprovals).where(eq(overtimeApprovals.id, id));
    return result[0];
  }

  async updateOvertimeApproval(
    id: number, 
    approvalData: Partial<OvertimeApproval>
  ): Promise<OvertimeApproval | undefined> {
    const result = await db.update(overtimeApprovals)
      .set(approvalData)
      .where(eq(overtimeApprovals.id, id))
      .returning();
    
    return result[0];
  }

  async getPendingOvertimeApprovals(): Promise<OvertimeApproval[]> {
    return await db.select()
      .from(overtimeApprovals)
      .where(eq(overtimeApprovals.status, "pending"))
      .orderBy(desc(overtimeApprovals.requestDate));
  }

  async getUserPendingOvertimeApprovals(userId: number): Promise<OvertimeApproval[]> {
    return await db.select()
      .from(overtimeApprovals)
      .where(
        and(
          eq(overtimeApprovals.userId, userId),
          eq(overtimeApprovals.status, "pending")
        )
      )
      .orderBy(desc(overtimeApprovals.requestDate));
  }

  // Audit log methods
  async createAuditLog(logData: InsertAuditLog): Promise<AuditLog> {
    // Set timestamp to current time if not provided
    const dataWithTimestamp = {
      ...logData,
      timestamp: new Date()
    };
    
    const result = await db.insert(auditLogs).values(dataWithTimestamp).returning();
    return result[0];
  }

  async getAuditLogs(): Promise<AuditLog[]> {
    return await db.select()
      .from(auditLogs)
      .orderBy(desc(auditLogs.timestamp));
  }

  async getAuditLogsByUser(userId: number): Promise<AuditLog[]> {
    return await db.select()
      .from(auditLogs)
      .where(eq(auditLogs.userId, userId))
      .orderBy(desc(auditLogs.timestamp));
  }
}

// Create and export the database storage instead of memory storage
export const storage = new DatabaseStorage();
