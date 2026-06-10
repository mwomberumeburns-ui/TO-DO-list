import { FormEvent, useState } from "react";
import type { Task } from "../types";

interface TaskItemProps {
  task: Task;
  disabled: boolean;
  onToggle: (task: Task) => Promise<void>;
  onRename: (task: Task, title: string) => Promise<void>;
  onDelete: (task: Task) => Promise<void>;
}

function TaskItem({ task, disabled, onToggle, onRename, onDelete }: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(task.title);

  async function handleRename(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const title = draftTitle.trim();

    if (!title) {
      return;
    }

    await onRename(task, title);
    setIsEditing(false);
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-md transition hover:scale-[1.01] hover:shadow-lg">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <label className="flex flex-1 items-start gap-3">
          <input
            type="checkbox"
            checked={task.completed}
            disabled={disabled}
            onChange={() => {
              void onToggle(task);
            }}
            className="mt-1 h-5 w-5 rounded border-slate-300 text-teal-600 focus:ring-teal-500 disabled:cursor-not-allowed"
          />
          {isEditing ? (
            <form onSubmit={handleRename} className="flex flex-1 flex-col gap-2 sm:flex-row">
              <input
                value={draftTitle}
                onChange={(event) => setDraftTitle(event.target.value)}
                className="min-h-10 flex-1 rounded-xl border border-slate-200 px-3 text-slate-900 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
              />
              <button
                type="submit"
                disabled={disabled || !draftTitle.trim()}
                className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:scale-105 hover:bg-slate-700 disabled:bg-slate-300 disabled:hover:scale-100"
              >
                Save
              </button>
            </form>
          ) : (
            <span
              className={`text-base leading-6 ${
                task.completed ? "text-slate-400 line-through" : "text-slate-900"
              }`}
            >
              {task.title}
            </span>
          )}
        </label>

        <div className="flex gap-2 sm:self-start">
          <button
            type="button"
            disabled={disabled}
            onClick={() => {
              setDraftTitle(task.title);
              setIsEditing((current) => !current);
            }}
            className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:scale-105 hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
          >
            {isEditing ? "Cancel" : "Edit"}
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={() => {
              void onDelete(task);
            }}
            className="rounded-xl bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:scale-105 hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default TaskItem;
