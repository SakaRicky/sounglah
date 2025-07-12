import api from "@/api/axios";
import type { User } from "@/types";

export async function getUsers(role?: string): Promise<{ users: User[] }> {
  const response = await api.get<{ users: User[] }>("/users/list", {
    params: role ? { role } : undefined,
  });
  return response.data;
} 