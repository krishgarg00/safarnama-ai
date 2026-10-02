import { apiRequest } from "./client";

export const getMyRides = async () => {
  return apiRequest("/rides/my");
};