import axios, { AxiosError } from "axios";
import type { ApiErrorResponse, AuthResponse, RegisterResponse, Task } from "../types";

const TOKEN_KEY = "todo_token";

export const api = axios.create({
  baseURL: "http://127.0.0.1:8000",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function getApiError(error: unknown) {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    return axiosError.response?.data?.detail ?? axiosError.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong";
}

export async function registerUser(username: string, password: string) {
  const response = await api.post<RegisterResponse>("/register", { username, password });
  return response.data;
}

export async function loginUser(username: string, password: string) {
  const response = await api.post<AuthResponse>("/login", { username, password });
  return response.data;
}

export async function validateToken() {
  await api.get("/protected");
}

export async function fetchTasks() {
  const response = await api.get<Task[]>("/tasks");
  return response.data;
}

export async function createTask(title: string) {
  const response = await api.post<Task>("/tasks", { title });
  return response.data;
}

export async function updateTask(id: number, updates: Partial<Pick<Task, "title" | "completed">>) {
  const response = await api.put<Task>(`/tasks/${id}`, updates);
  return response.data;
}

export async function deleteTask(id: number) {
  await api.delete(`/tasks/${id}`);
}
