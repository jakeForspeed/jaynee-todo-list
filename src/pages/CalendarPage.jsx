import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Calendar from "../components/Calendar";
import { supabase } from "../lib/supabase";

function CalendarPage() {
  const navigate = useNavigate();

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [todoDates, setTodoDates] = useState({});
  const [loading, setLoading] = useState(true);

  // ============================================
  // WELCOME MESSAGE
  // ============================================

  const getWelcomeMessage = () => {
    const hour = new Date().getHours();

    if (hour >= 5 && hour < 12) {
      return {
        greeting: "Good morning, Jaynee! 🌅",
        message: "Ready to make today a good one?",
      };
    }

    if (hour >= 12 && hour < 18) {
      return {
        greeting: "Good afternoon, Jaynee! ☀️",
        message: "How's your day going?",
      };
    }

    return {
      greeting: "Good evening, Jaynee! 🌙",
      message: "Let's see what you accomplished today.",
    };
  };

  const welcome = getWelcomeMessage();

  // ============================================
  // DATE HELPERS
  // ============================================

  const getDateString = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const formatSelectedDate = (date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  // ============================================
  // FETCH TODO DATES
  // ============================================

  useEffect(() => {
    fetchTodoDates();
  }, []);

  const fetchTodoDates = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("todos")
      .select("todo_date, completed");

    if (error) {
      console.error("Error loading todo dates:", error);
      setLoading(false);
      return;
    }

    const dateMap = {};

    (data || []).forEach((todo) => {
      if (!dateMap[todo.todo_date]) {
        dateMap[todo.todo_date] = {
          total: 0,
          completed: 0,
        };
      }

      dateMap[todo.todo_date].total += 1;

      if (todo.completed) {
        dateMap[todo.todo_date].completed += 1;
      }
    });

    setTodoDates(dateMap);
    setLoading(false);
  };

  // ============================================
  // SELECT DATE
  // ============================================

  const handleSelectDate = (date) => {
    if (!date) return;

    setSelectedDate(date);
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <main className="min-h-screen overflow-hidden bg-blue-50 px-4 py-5 sm:py-6">
      <div className="mx-auto w-full max-w-lg">

        {/* ============================================
            PERSONAL WELCOME HEADER
        ============================================ */}

        <header className="mb-5">
          <div className="flex items-center gap-3">

            {/* Logo */}
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-500 text-lg text-white shadow-lg shadow-blue-200">
              ♥
            </div>

            <div>
              <h1 className="text-xl font-bold tracking-tight text-blue-950 sm:text-2xl">
                {welcome.greeting}
              </h1>

              <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
                {welcome.message}
              </p>
            </div>

          </div>
        </header>

        {/* ============================================
            CALENDAR CARD
        ============================================ */}

        <section className="rounded-3xl border border-blue-100 bg-white p-4 shadow-xl shadow-blue-100/50 sm:p-5">

          {/* Title */}
          <div className="mb-3">
            <h2 className="text-base font-bold text-blue-950 sm:text-lg">
              My Calendar
            </h2>

            <p className="mt-1 text-xs text-slate-500 sm:text-sm">
              Select a date to view your todos.
            </p>
          </div>

          {/* Calendar */}
          <Calendar
            selectedDate={selectedDate}
            onSelectDate={handleSelectDate}
            todoDates={todoDates}
          />

          {/* ============================================
              LEGEND
          ============================================ */}

          <div className="mt-3 flex items-center justify-center gap-4 text-[10px] text-slate-400 sm:text-xs">

            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
              <span>Has todos</span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-blue-500 text-[8px] font-bold text-white">
                ✓
              </span>
              <span>Completed</span>
            </div>

          </div>

          {/* ============================================
              SELECTED DATE
          ============================================ */}

          {selectedDate && (
            <div className="mt-3 flex items-center gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-3">

              {/* Calendar Icon */}
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-base shadow-sm">
                📅
              </div>

              <div className="min-w-0 flex-1">

                <span className="block text-[10px] font-medium text-slate-500 sm:text-xs">
                  Selected date
                </span>

                <strong className="block truncate text-xs font-semibold text-blue-800 sm:text-sm">
                  {formatSelectedDate(selectedDate)}
                </strong>

                {todoDates[getDateString(selectedDate)] && (
                  <span className="mt-0.5 block text-[10px] text-blue-400 sm:text-xs">
                    {todoDates[getDateString(selectedDate)].total}{" "}
                    {todoDates[getDateString(selectedDate)].total === 1
                      ? "todo"
                      : "todos"}
                  </span>
                )}

              </div>

            </div>
          )}

          {/* Loading indicator */}
          {loading && (
            <p className="mt-2 text-center text-[10px] text-slate-400">
              Loading your calendar...
            </p>
          )}

          {/* ============================================
              VIEW TODOS BUTTON
          ============================================ */}

          <button
            type="button"
            onClick={() =>
              navigate(`/todo/${getDateString(selectedDate)}`)
            }
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-200 transition hover:-translate-y-0.5 hover:bg-blue-600 hover:shadow-blue-300 active:translate-y-0"
          >
            View Todos
            <span className="text-lg">→</span>
          </button>

        </section>

        {/* ============================================
            FOOTER
        ============================================ */}

        <footer className="mt-3 text-center text-[11px] text-slate-400 sm:text-xs">
          Made with{" "}
          <span className="text-blue-500">♥</span>{" "}
          for Jaynee
        </footer>

      </div>
    </main>
  );
}

export default CalendarPage;