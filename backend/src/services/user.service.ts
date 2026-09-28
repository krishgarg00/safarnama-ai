import bcrypt from "bcrypt";
import User from "../models/User";

interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role?: "CUSTOMER" | "HOST" | "DRIVER" | "ADMIN";
}

export const getAllUsers = async () => {
  const users = await User.find().select("-password");

  return users;
};

export const createUser = async (userData: CreateUserData) => {
  const { name, email, password, role } = userData;

  // Check if user already exists
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new Error("User with this email already exists");
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role: role || "CUSTOMER",
  });

  // Remove password before returning user
  const userObject = user.toObject();

  const { password: _, ...safeUser } = userObject;

  return safeUser;
};