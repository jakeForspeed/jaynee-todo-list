import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Calendar from "../components/Calendar";
import { supabase } from "../lib/supabase";

function CalendarPage() {
  const navigate = useNavigate();

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [todoDates, setTodoDates] = useState({});
  const [loading, setLoading] = useState(true);

  // ============================================
  // TIME OF DAY
  // ============================================

  const getTimeOfDay = () => {
    const hour = new Date().getHours();

    if (hour >= 5 && hour < 12) {
      return "morning";
    }

    if (hour >= 12 && hour < 18) {
      return "afternoon";
    }

    return "evening";
  };

  const [timeOfDay, setTimeOfDay] = useState(getTimeOfDay());

  // ============================================
  // LIVE TIME CHECK
  // ============================================

  useEffect(() => {
    const updateTimeOfDay = () => {
      const currentTimeOfDay = getTimeOfDay();

      setTimeOfDay((previousTimeOfDay) => {
        if (previousTimeOfDay !== currentTimeOfDay) {
          return currentTimeOfDay;
        }

        return previousTimeOfDay;
      });
    };

    updateTimeOfDay();

    const interval = setInterval(updateTimeOfDay, 30000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  // ============================================
  // WELCOME MESSAGE
  // ============================================

  const getWelcomeMessage = () => {
    if (timeOfDay === "morning") {
      return {
        greeting: "Good morning, Jaynee! 🌅",
        message: "Ready to make today a good one?",
      };
    }

    if (timeOfDay === "afternoon") {
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
  // TIME-BASED THEME
  // ============================================

  const backgroundStyles = {
    morning: {
      page:
        "bg-gradient-to-br from-sky-100 via-blue-50 to-indigo-100",

      card:
        "border-blue-100 bg-white/95 shadow-blue-200/60",

      selected:
        "border-blue-100 bg-blue-50",

      button:
        "bg-blue-500 shadow-blue-200 hover:bg-blue-600 hover:shadow-blue-300",

      logo:
        "bg-blue-500 shadow-blue-200",
    },

    afternoon: {
      page:
        "bg-gradient-to-br from-blue-100 via-sky-50 to-cyan-100",

      card:
        "border-sky-100 bg-white/95 shadow-sky-200/60",

      selected:
        "border-sky-100 bg-sky-50",

      button:
        "bg-sky-500 shadow-sky-200 hover:bg-sky-600 hover:shadow-sky-300",

      logo:
        "bg-sky-500 shadow-sky-200",
    },

    evening: {
      page:
        "bg-gradient-to-br from-indigo-200 via-blue-100 to-slate-200",

      card:
        "border-indigo-100 bg-white/95 shadow-indigo-200/60",

      selected:
        "border-indigo-100 bg-indigo-50",

      button:
        "bg-indigo-500 shadow-indigo-200 hover:bg-indigo-600 hover:shadow-indigo-300",

      logo:
        "bg-indigo-500 shadow-indigo-200",
    },
  };

  const theme = backgroundStyles[timeOfDay];

  // ============================================
  // RANDOM DECORATIONS
  // ============================================

  const decorations = useMemo(() => {
    const flowers = [
      "✿",
      "❀",
      "❁",
      "✾",
      "✽",
      "❋",
    ];

    const hearts = [
      "♥",
      "♡",
      "♥",
      "♡",
    ];

    const sparkles = [
      "✦",
      "✧",
      "⋆",
      "✦",
      "✧",
    ];

    const items = [];

    // --------------------------------------------
    // FLOWERS
    // --------------------------------------------

    for (let i = 0; i < 14; i++) {
      items.push({
        id: `flower-${i}`,

        type:
          i % 2 === 0
            ? "flower"
            : "flower-soft",

        symbol:
          flowers[
            Math.floor(
              Math.random() * flowers.length
            )
          ],

        left: Math.random() * 100,

        size:
          18 + Math.random() * 20,

        duration:
          10 + Math.random() * 9,

        delay:
          Math.random() * -18,
      });
    }

    // --------------------------------------------
    // HEARTS
    // --------------------------------------------

    for (let i = 0; i < 8; i++) {
      items.push({
        id: `heart-${i}`,

        type:
          i % 2 === 0
            ? "heart"
            : "heart-soft",

        symbol:
          hearts[
            Math.floor(
              Math.random() * hearts.length
            )
          ],

        left: Math.random() * 100,

        size:
          15 + Math.random() * 18,

        duration:
          9 + Math.random() * 9,

        delay:
          Math.random() * -15,
      });
    }

    // --------------------------------------------
    // SPARKLES
    // --------------------------------------------

    for (let i = 0; i < 10; i++) {
      items.push({
        id: `sparkle-${i}`,

        type: "sparkle",

        symbol:
          sparkles[
            Math.floor(
              Math.random() * sparkles.length
            )
          ],

        left: Math.random() * 100,

        size:
          10 + Math.random() * 12,

        duration:
          7 + Math.random() * 8,

        delay:
          Math.random() * -15,
      });
    }

    return items;
  }, []);

  // ============================================
  // DATE HELPERS
  // ============================================

  const getDateString = (date) => {
    const year = date.getFullYear();

    const month = String(
      date.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
      date.getDate()
    ).padStart(2, "0");

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
      console.error(
        "Error loading todo dates:",
        error
      );

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
    <main
      className={`
        relative
        min-h-screen
        overflow-hidden
        px-4
        py-5
        transition-all
        duration-[2000ms]
        ease-in-out
        sm:py-6
        ${theme.page}
      `}
    >
      {/* ============================================
          FLOATING BACKGROUND
      ============================================ */}

      <div aria-hidden="true">
        {decorations.map((item) => {
          let decorationClass =
            "floating-decoration";

          if (item.type === "flower") {
            decorationClass +=
              " floating-flower";
          }

          if (item.type === "flower-soft") {
            decorationClass +=
              " floating-flower-soft";
          }

          if (item.type === "heart") {
            decorationClass +=
              " floating-heart";
          }

          if (item.type === "heart-soft") {
            decorationClass +=
              " floating-heart-soft";
          }

          if (item.type === "sparkle") {
            decorationClass +=
              " floating-sparkle";
          }

          return (
            <span
              key={item.id}
              className={decorationClass}
              style={{
                left: `${item.left}%`,

                fontSize: `${item.size}px`,

                animationDuration: `${item.duration}s`,

                animationDelay: `${item.delay}s`,
              }}
            >
              {item.symbol}
            </span>
          );
        })}
      </div>

      {/* ============================================
          MAIN CONTENT
      ============================================ */}

      <div className="relative z-10 mx-auto w-full max-w-lg">

        {/* ============================================
            WELCOME
        ============================================ */}

        <header
          key={timeOfDay}
          className="welcome-fade mb-5"
        >
          <div className="flex items-center gap-3">

            {/* Logo */}
            <div
              className={`
                flex
                h-11
                w-11
                shrink-0
                items-center
                justify-center
                rounded-2xl
                text-lg
                text-white
                shadow-lg
                transition-all
                duration-[1500ms]
                ${theme.logo}
              `}
            >
              <span className="animate-pulse">
                ♥
              </span>
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

        <section
          className={`
            rounded-3xl
            border
            p-4
            shadow-xl
            backdrop-blur-sm
            transition-all
            duration-[2000ms]
            ${theme.card}
            sm:p-5
          `}
        >

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

              <span>
                Completed
              </span>
            </div>

          </div>

          {/* ============================================
              SELECTED DATE
          ============================================ */}

          {selectedDate && (
            <div
              className={`
                mt-3
                flex
                items-center
                gap-3
                rounded-2xl
                border
                p-3
                transition-all
                duration-[1500ms]
                ${theme.selected}
              `}
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-base shadow-sm">
                📅
              </div>

              <div className="min-w-0 flex-1">

                <span className="block text-[10px] font-medium text-slate-500 sm:text-xs">
                  Selected date
                </span>

                <strong className="block truncate text-xs font-semibold text-blue-800 sm:text-sm">
                  {formatSelectedDate(
                    selectedDate
                  )}
                </strong>

                {todoDates[
                  getDateString(selectedDate)
                ] && (
                  <span className="mt-0.5 block text-[10px] text-blue-400 sm:text-xs">
                    {
                      todoDates[
                        getDateString(
                          selectedDate
                        )
                      ].total
                    }{" "}
                    {todoDates[
                      getDateString(
                        selectedDate
                      )
                    ].total === 1
                      ? "todo"
                      : "todos"}
                  </span>
                )}

              </div>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <p className="mt-2 text-center text-[10px] text-slate-400">
              Loading your calendar...
            </p>
          )}

          {/* ============================================
              VIEW TODOS
          ============================================ */}

          <button
            type="button"
            onClick={() =>
              navigate(
                `/todo/${getDateString(
                  selectedDate
                )}`
              )
            }
            className={`
              mt-3
              flex
              w-full
              items-center
              justify-center
              gap-2
              rounded-2xl
              px-5
              py-3
              text-sm
              font-bold
              text-white
              shadow-lg
              transition-all
              duration-[1500ms]
              hover:-translate-y-0.5
              active:translate-y-0
              ${theme.button}
            `}
          >
            View Todos

            <span className="text-lg">
              →
            </span>
          </button>

        </section>

        {/* ============================================
            FOOTER
        ============================================ */}

        <footer className="mt-3 text-center text-[11px] text-slate-400 sm:text-xs">
          Made with{" "}
          <span className="text-blue-500">
            ♥
          </span>{" "}
          for Jaynee
        </footer>

      </div>
    </main>
  );
}

export default CalendarPage;