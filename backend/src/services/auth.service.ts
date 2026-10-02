import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User";

interface LoginData {
  email: string;
  password: string;
}

export const loginUser = async ({ email, password }: LoginData) => {
  // Find user by email
  const user = await User.findOne({ email });

  if (!user) {
    throw new Error("Invalid email or password");
  }

  // Compare entered password with stored bcrypt hash
  const isPasswordCorrect = await bcrypt.compare(
    password,
    user.password
  );

  if (!isPasswordCorrect) {
    throw new Error("Invalid email or password");
  }

  // Get JWT secret from environment variables
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    throw new Error("JWT_SECRET is not configured");
  }

  // Create JWT
  const token = jwt.sign(
    {
      userId: user._id.toString(),
      role: user.role,
    },
    jwtSecret,
    {
      expiresIn: "1d",
    }
  );

  // Remove password before returning user
  const userObject = user.toObject();

  const { password: _, ...safeUser } = userObject;

  return {
    user: safeUser,
    token,
  };
};

interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export const registerUser = async ({
  name,
  email,
  password,
}: RegisterData) => {
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new Error("User already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role: "CUSTOMER",
  });

  const userObject = user.toObject();
  const { password: _, ...safeUser } = userObject;

  return safeUser;
};