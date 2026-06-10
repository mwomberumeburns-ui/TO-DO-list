import { FormEvent, useState } from "react";

interface TaskFormProps {
  disabled: boolean;
  onCreate: (title: string) => Promise<void>;
}

function TaskForm({ disabled, onCreate }: TaskFormProps) {
  const [title, setTitle] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      return;
    }

    await onCreate(trimmedTitle);
    setTitle("");
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
      <input
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        disabled={disabled}
        placeholder="Add a new task"
        className="min-h-12 flex-1 rounded-xl border border-slate-200 bg-white px-4 text-base text-slate-900 shadow-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100 disabled:cursor-not-allowed disabled:bg-slate-100"
      />
      <button
        type="submit"
        disabled={disabled || !title.trim()}
        className="min-h-12 rounded-xl bg-teal-600 px-5 font-semibold text-white shadow-md transition hover:scale-105 hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:hover:scale-100"
      >
        Add Task
      </button>
    </form>
  );
}

export default TaskForm;
