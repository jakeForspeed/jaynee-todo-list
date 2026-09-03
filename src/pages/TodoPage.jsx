import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";

function TodoPage() {
  const navigate = useNavigate();
  const { date } = useParams();

  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [deleteId, setDeleteId] = useState(null);
  const [notification, setNotification] = useState(null);

  const [year, month, day] = date.split("-").map(Number);

    const selectedDate = new Date(year, month - 1, day);

  // ============================================
  // DATE HELPERS
  // ============================================

  const formatDate = (dateObject) => {
    return dateObject.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatCompletedAt = (completedAt) => {
    if (!completedAt) return "";

    const dateObject = new Date(completedAt);

    return dateObject.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const getDateString = (dateObject) => {
    const year = dateObject.getFullYear();
    const month = String(dateObject.getMonth() + 1).padStart(2, "0");
    const day = String(dateObject.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

const goToDate = (offset) => {
  const newDate = new Date(
    year,
    month - 1,
    day + offset
  );

  navigate(`/todo/${getDateString(newDate)}`);
};

  // ============================================
  // NOTIFICATION
  // ============================================

  const showNotification = (message, type = "success") => {
    setNotification({
      message,
      type,
    });

    setTimeout(() => {
      setNotification(null);
    }, 2500);
  };

  // ============================================
  // FETCH TODOS
  // ============================================

  useEffect(() => {
    fetchTodos();
  }, [date]);

  const fetchTodos = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("todos")
      .select("*")
      .eq("todo_date", date)
      .order("completed", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error loading todos:", error);

      showNotification("Unable to load todos.", "error");

      setLoading(false);
      return;
    }

    setTodos(data || []);
    setLoading(false);
  };

  // ============================================
  // ADD TODO
  // ============================================

  const addTodo = async () => {
    const title = newTodo.trim();

    if (!title || saving) return;

    setSaving(true);

    const { data, error } = await supabase
      .from("todos")
      .insert([
        {
          title,
          todo_date: date,
          completed: false,
          completed_at: null,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error adding todo:", error);

      showNotification("Unable to add todo.", "error");

      setSaving(false);
      return;
    }

    setTodos((currentTodos) => [...currentTodos, data]);

    setNewTodo("");
    setSaving(false);

    showNotification("Todo added! 💙");
  };

  // ============================================
  // TOGGLE TODO
  // ============================================

  const toggleTodo = async (todo) => {
    const newCompleted = !todo.completed;

    const newCompletedAt = newCompleted
      ? new Date().toISOString()
      : null;

    // Optimistic UI update
    setTodos((currentTodos) =>
      currentTodos.map((item) =>
        item.id === todo.id
          ? {
              ...item,
              completed: newCompleted,
              completed_at: newCompletedAt,
            }
          : item
      )
    );

    const { error } = await supabase
      .from("todos")
      .update({
        completed: newCompleted,
        completed_at: newCompletedAt,
      })
      .eq("id", todo.id);

    if (error) {
      console.error("Error updating todo:", error);

      // Revert if update fails
      setTodos((currentTodos) =>
        currentTodos.map((item) =>
          item.id === todo.id
            ? {
                ...item,
                completed: todo.completed,
                completed_at: todo.completed_at,
              }
            : item
        )
      );

      showNotification("Unable to update todo.", "error");

      return;
    }

    showNotification(
      newCompleted ? "Todo completed! 🎉" : "Todo reopened."
    );

    // Refresh so completed todos move to the correct position
    fetchTodos();
  };

  // ============================================
  // START EDITING
  // ============================================

  const startEditing = (todo) => {
    setEditingId(todo.id);
    setEditingTitle(todo.title);
  };

  // ============================================
  // CANCEL EDITING
  // ============================================

  const cancelEditing = () => {
    setEditingId(null);
    setEditingTitle("");
  };

  // ============================================
  // SAVE EDIT
  // ============================================

  const saveEdit = async (id) => {
    const title = editingTitle.trim();

    if (!title) {
      showNotification("Todo cannot be empty.", "error");
      return;
    }

    const previousTodos = todos;

    setTodos((currentTodos) =>
      currentTodos.map((todo) =>
        todo.id === id
          ? {
              ...todo,
              title,
            }
          : todo
      )
    );

    const { error } = await supabase
      .from("todos")
      .update({
        title,
      })
      .eq("id", id);

    if (error) {
      console.error("Error editing todo:", error);

      setTodos(previousTodos);

      showNotification("Unable to edit todo.", "error");

      return;
    }

    setEditingId(null);
    setEditingTitle("");

    showNotification("Todo updated! ✏️");
  };

  // ============================================
  // DELETE TODO
  // ============================================

  const confirmDelete = (id) => {
    setDeleteId(id);
  };

  const cancelDelete = () => {
    setDeleteId(null);
  };

  const deleteTodo = async () => {
    if (!deleteId) return;

    const id = deleteId;
    const previousTodos = todos;

    setTodos((currentTodos) =>
      currentTodos.filter((todo) => todo.id !== id)
    );

    setDeleteId(null);

    const { error } = await supabase
      .from("todos")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting todo:", error);

      setTodos(previousTodos);

      showNotification("Unable to delete todo.", "error");

      return;
    }

    showNotification("Todo deleted.");
  };

  // ============================================
  // KEYBOARD HANDLERS
  // ============================================

  const handleAddKeyDown = (event) => {
    if (event.key === "Enter") {
      addTodo();
    }
  };

  const handleEditKeyDown = (event, id) => {
    if (event.key === "Enter") {
      saveEdit(id);
    }

    if (event.key === "Escape") {
      cancelEditing();
    }
  };

  // ============================================
  // PROGRESS
  // ============================================

  const completedCount = todos.filter(
    (todo) => todo.completed
  ).length;

  const progress =
    todos.length > 0
      ? Math.round((completedCount / todos.length) * 100)
      : 0;

  const deleteTodoItem = todos.find(
    (todo) => todo.id === deleteId
  );

  // ============================================
  // RENDER
  // ============================================

  return (
    <main className="min-h-screen overflow-hidden bg-blue-50 px-4 py-5 sm:py-6">
      <div className="mx-auto w-full max-w-lg">

        {/* ============================================
            NOTIFICATION
        ============================================ */}

        {notification && (
          <div
            className={`fixed left-1/2 top-4 z-50 flex -translate-x-1/2 items-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold shadow-xl ${
              notification.type === "error"
                ? "border border-red-100 bg-white text-red-500"
                : "border border-blue-100 bg-white text-blue-600"
            }`}
          >
            <span>
              {notification.type === "error" ? "⚠️" : "♥"}
            </span>

            {notification.message}
          </div>
        )}

        {/* ============================================
            HEADER
        ============================================ */}

        <header className="mb-4">
          <div className="flex items-center gap-3">

            <button
              type="button"
              onClick={() => navigate("/")}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-lg text-blue-500 shadow-md shadow-blue-100 transition hover:-translate-y-0.5 hover:bg-blue-50"
              aria-label="Back to calendar"
            >
              ←
            </button>

            <div className="min-w-0">
              <h1 className="text-xl font-bold tracking-tight text-blue-950 sm:text-2xl">
                Jaynee's Todo
              </h1>

              <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
                Plan your day, one step at a time.
              </p>
            </div>

          </div>
        </header>

        {/* ============================================
            MAIN CARD
        ============================================ */}

        <section className="rounded-3xl border border-blue-100 bg-white p-4 shadow-xl shadow-blue-100/50 sm:p-5">

          {/* DATE HEADER */}

          <div className="mb-4 flex items-center gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-3">

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-lg shadow-sm">
              📅
            </div>

            <div className="min-w-0">
              <span className="block text-[10px] font-medium text-slate-500 sm:text-xs">
                Your todos for
              </span>

              <strong className="block truncate text-sm font-semibold text-blue-800 sm:text-base">
                {formatDate(selectedDate)}
              </strong>
            </div>

          </div>

          {/* ============================================
              PREVIOUS / TODAY / NEXT
          ============================================ */}

          <div className="mb-4 flex items-center gap-2">

            <button
              type="button"
              onClick={() => goToDate(-1)}
              className="flex h-10 flex-1 items-center justify-center gap-1 rounded-xl border border-blue-100 bg-white text-xs font-semibold text-blue-600 transition hover:bg-blue-50"
            >
              ← Previous
            </button>

            <button
              type="button"
              onClick={() => {
                const today = new Date();

                navigate(`/todo/${getDateString(today)}`);
                }}
              className="flex h-10 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 px-4 text-xs font-semibold text-blue-600 transition hover:bg-blue-100"
            >
              Today
            </button>

            <button
              type="button"
              onClick={() => goToDate(1)}
              className="flex h-10 flex-1 items-center justify-center gap-1 rounded-xl border border-blue-100 bg-white text-xs font-semibold text-blue-600 transition hover:bg-blue-50"
            >
              Next →
            </button>

          </div>

          {/* ============================================
              PROGRESS
          ============================================ */}

          {todos.length > 0 && (
            <div className="mb-4">

              <div className="mb-1.5 flex items-center justify-between px-1">

                <span className="text-xs font-medium text-slate-500">
                  {completedCount} of {todos.length} completed
                </span>

                <span className="text-xs font-bold text-blue-500">
                  {progress}%
                </span>

              </div>

              <div className="h-2.5 overflow-hidden rounded-full bg-blue-50">

                <div
                  className="h-full rounded-full bg-blue-500 transition-all duration-500"
                  style={{
                    width: `${progress}%`,
                  }}
                />

              </div>

              {progress === 100 && (
                <p className="mt-2 text-center text-xs font-semibold text-blue-500">
                  Everything is done! 🎉💙
                </p>
              )}

            </div>
          )}

          {/* ============================================
              ADD TODO
          ============================================ */}

          <div className="mb-5 flex gap-2">

            <input
              type="text"
              value={newTodo}
              onChange={(event) =>
                setNewTodo(event.target.value)
              }
              onKeyDown={handleAddKeyDown}
              placeholder="What do you need to do?"
              disabled={saving}
              className="min-w-0 flex-1 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-100 disabled:opacity-60"
            />

            <button
              type="button"
              onClick={addTodo}
              disabled={saving || !newTodo.trim()}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-500 text-xl font-bold text-white shadow-lg shadow-blue-200 transition hover:-translate-y-0.5 hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Add todo"
            >
              {saving ? "…" : "+"}
            </button>

          </div>

          {/* ============================================
              LOADING
          ============================================ */}

          {loading ? (
            <div className="py-10 text-center">

              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-blue-100 border-t-blue-500" />

              <p className="mt-3 text-sm text-slate-400">
                Loading your todos...
              </p>

            </div>
          ) : todos.length > 0 ? (

            /* ============================================
               TODO LIST
            ============================================ */

            <div className="space-y-2">

              {todos.map((todo) => (

                <div
                  key={todo.id}
                  className={`group rounded-2xl border p-3 transition ${
                    todo.completed
                      ? "border-blue-100 bg-blue-50"
                      : "border-slate-100 bg-white hover:border-blue-100 hover:bg-blue-50/40"
                  }`}
                >

                  {editingId === todo.id ? (

                    /* ====================================
                       EDIT MODE
                    ==================================== */

                    <div className="flex gap-2">

                      <input
                        type="text"
                        value={editingTitle}
                        onChange={(event) =>
                          setEditingTitle(event.target.value)
                        }
                        onKeyDown={(event) =>
                          handleEditKeyDown(event, todo.id)
                        }
                        autoFocus
                        className="min-w-0 flex-1 rounded-xl border border-blue-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                      />

                      <button
                        type="button"
                        onClick={() => saveEdit(todo.id)}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-500 text-sm font-bold text-white transition hover:bg-blue-600"
                        aria-label="Save edit"
                      >
                        ✓
                      </button>

                      <button
                        type="button"
                        onClick={cancelEditing}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-sm font-bold text-slate-500 transition hover:bg-slate-200"
                        aria-label="Cancel edit"
                      >
                        ×
                      </button>

                    </div>

                  ) : (

                    /* ====================================
                       NORMAL MODE
                    ==================================== */

                    <div className="flex items-center gap-3">

                      {/* CHECKBOX */}

                      <button
                        type="button"
                        onClick={() => toggleTodo(todo)}
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border-2 text-xs font-bold transition ${
                          todo.completed
                            ? "border-blue-500 bg-blue-500 text-white"
                            : "border-blue-200 bg-white text-transparent hover:border-blue-400"
                        }`}
                        aria-label={
                          todo.completed
                            ? "Mark as incomplete"
                            : "Mark as complete"
                        }
                      >
                        ✓
                      </button>

                      {/* TITLE */}

                      <button
                        type="button"
                        onClick={() => toggleTodo(todo)}
                        className="min-w-0 flex-1 text-left"
                      >

                        <span
                          className={`block text-sm font-medium transition ${
                            todo.completed
                              ? "text-slate-400 line-through"
                              : "text-slate-700"
                          }`}
                        >
                          {todo.title}
                        </span>

                        {todo.completed &&
                          todo.completed_at && (
                            <span className="mt-0.5 block text-[10px] text-blue-400">
                              Completed{" "}
                              {formatCompletedAt(
                                todo.completed_at
                              )}
                            </span>
                          )}

                      </button>

                      {/* ACTIONS */}

                      <div className="flex shrink-0 items-center gap-1">

                        <button
                          type="button"
                          onClick={() => startEditing(todo)}
                          className="flex h-8 w-8 items-center justify-center rounded-xl text-sm text-slate-300 transition hover:bg-blue-50 hover:text-blue-500"
                          aria-label={`Edit ${todo.title}`}
                        >
                          ✏️
                        </button>

                        <button
                          type="button"
                          onClick={() => confirmDelete(todo.id)}
                          className="flex h-8 w-8 items-center justify-center rounded-xl text-sm text-slate-300 transition hover:bg-red-50 hover:text-red-400"
                          aria-label={`Delete ${todo.title}`}
                        >
                          🗑️
                        </button>

                      </div>

                    </div>

                  )}

                </div>

              ))}

            </div>

          ) : (

            /* ============================================
               EMPTY STATE
            ============================================ */

            <div className="py-8 text-center">

              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-2xl">
                📝
              </div>

              <h2 className="text-lg font-bold text-blue-950">
                No todos yet
              </h2>

              <p className="mx-auto mt-1 max-w-xs text-sm text-slate-500">
                Add something you want to accomplish today.
              </p>

              <p className="mt-3 text-xs text-blue-400">
                A fresh day is a fresh start. 💙
              </p>

            </div>

          )}

        </section>

        {/* ============================================
            FOOTER
        ============================================ */}

        <footer className="mt-3 text-center text-[11px] text-slate-400 sm:text-xs">
          Made with <span className="text-blue-500">♥</span> for Jaynee
        </footer>

      </div>

      {/* ================================================
          DELETE CONFIRMATION MODAL
      ================================================ */}

      {deleteId && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-blue-950/20 px-4 backdrop-blur-sm">

          <div className="w-full max-w-sm rounded-3xl border border-blue-100 bg-white p-5 shadow-2xl">

            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-2xl">
              🗑️
            </div>

            <h2 className="text-center text-lg font-bold text-blue-950">
              Delete this todo?
            </h2>

            <p className="mt-2 text-center text-sm text-slate-500">
              This action cannot be undone.
            </p>

            {deleteTodoItem && (
              <div className="mt-4 rounded-2xl bg-blue-50 p-3 text-center text-sm font-medium text-blue-800">
                {deleteTodoItem.title}
              </div>
            )}

            <div className="mt-5 flex gap-2">

              <button
                type="button"
                onClick={cancelDelete}
                className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={deleteTodo}
                className="flex-1 rounded-2xl bg-red-500 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-red-100 transition hover:bg-red-600"
              >
                Delete
              </button>

            </div>

          </div>

        </div>
      )}

    </main>
  );
}

export default TodoPage;