export interface AuthenticatedUser {
  userId: string;
  role: "CUSTOMER" | "HOST" | "DRIVER" | "ADMIN";
}