import { hash, compare } from 'bcryptjs';
import { prisma } from './db';

type UserCreateInput = {
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  licenseNumber: string;
  password: string;
};

export async function createUser(userData: UserCreateInput) {
  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: userData.email }
  });

  if (existingUser) {
    throw new Error('User with this email already exists');
  }

  // Check if license number is already registered
  const existingLicense = await prisma.user.findUnique({
    where: { licenseNumber: userData.licenseNumber }
  });

  if (existingLicense) {
    throw new Error('License number is already registered');
  }

  // Hash password
  const hashedPassword = await hash(userData.password, 12);

  // Create new user
  const newUser = await prisma.user.create({
    data: {
      ...userData,
      password: hashedPassword,
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phoneNumber: true,
      licenseNumber: true,
      createdAt: true,
    }
  });

  return newUser;
}

export async function validateUser(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    throw new Error('Invalid email or password');
  }

  if (!user.emailVerified) {
    throw new Error('Please verify your email before logging in');
  }

  const isValid = await compare(password, user.password);
  if (!isValid) {
    throw new Error('Invalid email or password');
  }

  // Return user without password
  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

export async function getUserById(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phoneNumber: true,
      licenseNumber: true,
      createdAt: true,
    }
  });

  return user;
}

export async function getUserByEmail(email: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phoneNumber: true,
      licenseNumber: true,
      createdAt: true,
    }
  });

  return user;
}

export async function verifyPassword(password: string, hashedPassword: string) {
  return compare(password, hashedPassword);
}
