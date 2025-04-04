import { storage } from './storage';
import { UserRole } from '@shared/schema';
import { hashPassword } from './auth';

async function seedDatabase() {
  console.log('Starting database seeding...');
  
  try {
    // Check if admin user already exists to prevent duplicate seeding
    const existingAdmin = await storage.getUserByUsername('admin');
    if (existingAdmin) {
      console.log('Database already seeded, skipping...');
      return;
    }

    // Create admin user
    const adminUser = await storage.createUser({
      username: "admin",
      password: await hashPassword("password"),
      email: "admin@example.com",
      firstName: "Admin",
      lastName: "User",
      role: UserRole.ADMIN,
      department: "Administration",
      active: true
    });
    console.log('Created admin user:', adminUser.username);

    // Create manager user
    const managerUser = await storage.createUser({
      username: "manager",
      password: await hashPassword("password"),
      email: "manager@example.com",
      firstName: "Manager",
      lastName: "User",
      role: UserRole.MANAGER,
      department: "Engineering",
      active: true
    });
    console.log('Created manager user:', managerUser.username);

    // Create employee user
    const employeeUser = await storage.createUser({
      username: "employee",
      password: await hashPassword("password"),
      email: "employee@example.com",
      firstName: "Employee",
      lastName: "User",
      role: UserRole.EMPLOYEE,
      department: "Engineering",
      active: true
    });
    console.log('Created employee user:', employeeUser.username);

    // Create audit log for seeding
    await storage.createAuditLog({
      userId: adminUser.id,
      action: "SYSTEM",
      details: "Database seeded with initial data",
      ipAddress: "127.0.0.1"
    });

    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}

export { seedDatabase };