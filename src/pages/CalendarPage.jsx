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

  const [timeOfDay, setTimeOfDay] = useState(
    getTimeOfDay()
  );

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
      message:
        "Let's see what you accomplished today.",
    };
  };

  const welcome = getWelcomeMessage();

  // ============================================
  // THEMES
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
  // FLOATING DECORATIONS
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
        size: 18 + Math.random() * 20,
        duration: 10 + Math.random() * 9,
        delay: Math.random() * -18,
      });
    }

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
        size: 15 + Math.random() * 18,
        duration: 9 + Math.random() * 9,
        delay: Math.random() * -15,
      });
    }

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
        size: 10 + Math.random() * 12,
        duration: 7 + Math.random() * 8,
        delay: Math.random() * -15,
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
  // FETCH TODOS
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

  const selectedDateString =
    getDateString(selectedDate);

  const selectedTodoInfo =
    todoDates[selectedDateString];

  // ============================================
  // RENDER
  // ============================================

  return (
    <main
      className={`
        relative
        min-h-screen
        overflow-x-hidden
        px-4
        py-6
        transition-all
        duration-[2000ms]
        ease-in-out
        sm:px-6
        sm:py-8
        md:px-8
        md:py-10
        ${theme.page}
      `}
    >
      {/* ============================================
          FLOATING DECORATIONS
      ============================================ */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          fixed
          inset-0
          z-0
          overflow-hidden
        "
      >
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

      <div
        className="
          relative
          z-10
          mx-auto
          flex
          w-full
          max-w-2xl
          flex-col
        "
      >
        {/* ============================================
            WELCOME
        ============================================ */}

        <header
          key={timeOfDay}
          className="
            welcome-fade
            mb-7
            sm:mb-8
            md:mb-10
          "
        >
          <div className="flex items-center gap-4 sm:gap-5">
            <div
              className={`
                flex
                h-14
                w-14
                shrink-0
                items-center
                justify-center
                rounded-2xl
                text-2xl
                text-white
                shadow-lg
                transition-all
                duration-[1500ms]
                sm:h-16
                sm:w-16
                sm:rounded-3xl
                sm:text-3xl
                ${theme.logo}
              `}
            >
              <span className="animate-pulse">
                ♥
              </span>
            </div>

            <div className="min-w-0">
              <h1
                className="
                  text-2xl
                  font-bold
                  tracking-tight
                  text-blue-950
                  sm:text-3xl
                  md:text-4xl
                "
              >
                {welcome.greeting}
              </h1>

              <p
                className="
                  mt-1.5
                  text-sm
                  text-slate-500
                  sm:text-base
                  md:text-lg
                "
              >
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
            rounded-[2rem]
            border
            p-6
            shadow-2xl
            backdrop-blur-sm
            transition-all
            duration-[2000ms]
            sm:rounded-[2.25rem]
            sm:p-8
            md:p-10
            ${theme.card}
          `}
        >
          <div className="mb-6 sm:mb-8">
            <h2
              className="
                text-2xl
                font-bold
                text-blue-950
                sm:text-3xl
                md:text-4xl
              "
            >
              My Calendar
            </h2>

            <p
              className="
                mt-1.5
                text-sm
                text-slate-500
                sm:text-base
                md:text-lg
              "
            >
              Select a date to view your todos.
            </p>
          </div>

          {/* CALENDAR */}

          <Calendar
            selectedDate={selectedDate}
            onSelectDate={handleSelectDate}
            todoDates={todoDates}
          />

          {/* ============================================
              LEGEND
          ============================================ */}

          <div
            className="
              mt-7
              flex
              flex-wrap
              items-center
              justify-center
              gap-5
              text-xs
              text-slate-400
              sm:mt-8
              sm:gap-8
              sm:text-sm
              md:text-base
            "
          >
            <div className="flex items-center gap-2.5">
              <span
                className="
                  h-2.5
                  w-2.5
                  rounded-full
                  bg-blue-400
                  sm:h-3
                  sm:w-3
                "
              />

              <span>
                Has todos
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              <span
                className="
                  flex
                  h-5
                  w-5
                  items-center
                  justify-center
                  rounded-full
                  bg-blue-500
                  text-[10px]
                  font-bold
                  text-white
                  sm:h-6
                  sm:w-6
                  sm:text-xs
                "
              >
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
                mt-6
                flex
                items-center
                gap-4
                rounded-3xl
                border
                p-4
                transition-all
                duration-[1500ms]
                sm:mt-7
                sm:gap-5
                sm:p-5
                ${theme.selected}
              `}
            >
              <div
                className="
                  flex
                  h-12
                  w-12
                  shrink-0
                  items-center
                  justify-center
                  rounded-2xl
                  bg-white
                  text-xl
                  shadow-sm
                  sm:h-14
                  sm:w-14
                  sm:text-2xl
                "
              >
                📅
              </div>

              <div className="min-w-0 flex-1">
                <span
                  className="
                    block
                    text-xs
                    font-medium
                    text-slate-500
                    sm:text-sm
                  "
                >
                  Selected date
                </span>

                <strong
                  className="
                    mt-0.5
                    block
                    truncate
                    text-base
                    font-semibold
                    text-blue-800
                    sm:text-lg
                    md:text-xl
                  "
                >
                  {formatSelectedDate(
                    selectedDate
                  )}
                </strong>

                {selectedTodoInfo && (
                  <span
                    className="
                      mt-1
                      block
                      text-sm
                      text-blue-400
                      sm:text-base
                    "
                  >
                    {selectedTodoInfo.total}{" "}
                    {selectedTodoInfo.total === 1
                      ? "todo"
                      : "todos"}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* ============================================
              LOADING
          ============================================ */}

          {loading && (
            <p
              className="
                mt-3
                text-center
                text-sm
                text-slate-400
                sm:text-base
              "
            >
              Loading your calendar...
            </p>
          )}

          {/* ============================================
              VIEW TODOS BUTTON
          ============================================ */}

          <button
            type="button"
            onClick={() =>
              navigate(
                `/todo/${selectedDateString}`
              )
            }
            className={`
              mt-6
              flex
              w-full
              items-center
              justify-center
              gap-3
              rounded-3xl
              px-6
              py-4
              text-lg
              font-bold
              text-white
              shadow-xl
              transition-all
              duration-300
              hover:-translate-y-1
              active:translate-y-0
              sm:mt-7
              sm:py-5
              sm:text-xl
              ${theme.button}
            `}
          >
            View Todos

            <span className="text-2xl sm:text-3xl">
              →
            </span>
          </button>
        </section>

        {/* ============================================
            FOOTER
        ============================================ */}

        <footer
          className="
            py-7
            text-center
            text-sm
            text-slate-400
            sm:py-8
            sm:text-base
          "
        >
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
