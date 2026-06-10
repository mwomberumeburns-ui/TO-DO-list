import { useCallback, useEffect, useMemo, useState } from "react";
import {
  clearToken,
  createTask,
  deleteTask,
  fetchTasks,
  getApiError,
  updateTask,
  validateToken,
} from "../api/client";
import TaskForm from "../components/TaskForm";
import TaskItem from "../components/TaskItem";
import type { Task } from "../types";

interface DashboardProps {
  onLogout: () => void;
}

function Dashboard({ onLogout }: DashboardProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const completedCount = useMemo(
    () => tasks.filter((task) => task.completed).length,
    [tasks]
  );

  const loadTasks = useCallback(async () => {
    setError("");
    setIsLoading(true);

    try {
      await validateToken();
      const data = await fetchTasks();
      setTasks(data);
    } catch (requestError) {
      if (getApiError(requestError).toLowerCase().includes("token")) {
        clearToken();
        onLogout();
        return;
      }

      setError(getApiError(requestError));
    } finally {
      setIsLoading(false);
    }
  }, [onLogout]);

  async function handleCreate(title: string) {
    setIsSaving(true);
    setError("");
    setMessage("");

    try {
      await createTask(title);
      setMessage("Task created");
      await loadTasks();
    } catch (requestError) {
      setError(getApiError(requestError));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleToggle(task: Task) {
    setIsSaving(true);
    setError("");
    setMessage("");

    try {
      await updateTask(task.id, { completed: !task.completed });
      await loadTasks();
    } catch (requestError) {
      setError(getApiError(requestError));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleRename(task: Task, title: string) {
    setIsSaving(true);
    setError("");
    setMessage("");

    try {
      await updateTask(task.id, { title });
      setMessage("Task updated");
      await loadTasks();
    } catch (requestError) {
      setError(getApiError(requestError));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(task: Task) {
    setIsSaving(true);
    setError("");
    setMessage("");

    try {
      await deleteTask(task.id);
      setMessage("Task deleted");
      await loadTasks();
    } catch (requestError) {
      setError(getApiError(requestError));
    } finally {
      setIsSaving(false);
    }
  }

  function handleLogout() {
    clearToken();
    onLogout();
  }

  useEffect(() => {
    void loadTasks();
  }, [loadTasks]);

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-6 text-slate-950 sm:py-10">
      <div className="mx-auto max-w-3xl rounded-xl bg-white p-5 shadow-lg sm:p-8">
        <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-teal-600">My workspace</p>
            <h1 className="mt-2 text-3xl font-bold">Tasks</h1>
            <p className="mt-2 text-sm text-slate-500">
              {completedCount} of {tasks.length} completed
            </p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="min-h-11 rounded-xl bg-slate-900 px-5 font-semibold text-white shadow-md transition hover:scale-105 hover:bg-slate-700"
          >
            Logout
          </button>
        </header>

        <TaskForm disabled={isLoading || isSaving} onCreate={handleCreate} />

        {message ? <p className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">{message}</p> : null}
        {error ? <p className="mt-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</p> : null}

        <section className="mt-6 space-y-3">
          {isLoading ? (
            <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-slate-500">
              Loading tasks...
            </div>
          ) : tasks.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center">
              <p className="font-semibold text-slate-700">No tasks yet</p>
              <p className="mt-1 text-sm text-slate-500">Add your first task to start the list.</p>
            </div>
          ) : (
            tasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                disabled={isSaving}
                onToggle={handleToggle}
                onRename={handleRename}
                onDelete={handleDelete}
              />
            ))
          )}
        </section>
      </div>
    </main>
  );
}

export default Dashboard;
