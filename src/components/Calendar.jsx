import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";

function Calendar({
  selectedDate,
  onSelectDate,
  todoDates = {},
}) {
  const todoDays = [];
  const completedDays = [];

  Object.entries(todoDates).forEach(([dateString, info]) => {
    const [year, month, day] = dateString.split("-").map(Number);

    const date = new Date(year, month - 1, day);

    todoDays.push(date);

    if (info.total > 0 && info.completed === info.total) {
      completedDays.push(date);
    }
  });

  return (
    <div className="calendar-responsive w-full">
      <DayPicker
        mode="single"
        selected={selectedDate}
        onSelect={onSelectDate}
        showOutsideDays
        fixedWeeks
        weekStartsOn={0}
        modifiers={{
          hasTodo: todoDays,
          allCompleted: completedDays,
        }}
        modifiersClassNames={{
          hasTodo: "has-todo",
          allCompleted: "all-completed",
        }}
        classNames={{
          root: "w-full",
          months: "w-full",
          month: "w-full",

          month_caption:
            "mb-6 flex items-center justify-between px-1 sm:mb-7",

          caption_label:
            "text-2xl font-bold text-blue-950 sm:text-3xl md:text-4xl",

          nav:
            "flex items-center gap-2",

          button_previous:
            "calendar-nav flex h-12 w-12 items-center justify-center rounded-2xl text-blue-500 transition-all duration-200 hover:bg-blue-50 hover:text-blue-600 active:scale-95 sm:h-14 sm:w-14",

          button_next:
            "calendar-nav flex h-12 w-12 items-center justify-center rounded-2xl text-blue-500 transition-all duration-200 hover:bg-blue-50 hover:text-blue-600 active:scale-95 sm:h-14 sm:w-14",

          month_grid:
            "w-full",

          weekdays:
            "mb-4 grid grid-cols-7",

          weekday:
            "calendar-weekday text-center text-xs font-bold uppercase tracking-wide text-slate-400 sm:text-sm md:text-base",

          week:
            "grid grid-cols-7",

          day:
            "relative flex items-center justify-center py-1.5 sm:py-2 md:py-2.5",

          day_button:
            "calendar-day-button flex flex-col items-center justify-center rounded-2xl text-sm font-semibold text-slate-700 transition-all duration-200 hover:bg-blue-50 hover:text-blue-600 active:scale-95 sm:text-base md:text-lg",

          selected:
            "rounded-2xl bg-blue-500 text-white shadow-lg shadow-blue-200 hover:bg-blue-500 hover:text-white",

          today:
            "font-bold text-blue-600",

          outside:
            "opacity-30",
        }}
        components={{
          DayButton: ({
            day,
            modifiers,
            ...props
          }) => {
            const dateString = `${day.date.getFullYear()}-${String(
              day.date.getMonth() + 1
            ).padStart(2, "0")}-${String(
              day.date.getDate()
            ).padStart(2, "0")}`;

            const todoInfo = todoDates[dateString];

            const hasTodos = todoInfo?.total > 0;

            const allCompleted =
              hasTodos &&
              todoInfo.completed === todoInfo.total;

            return (
              <button
                {...props}
                className={`${props.className || ""} calendar-day-button`}
              >
                {/* DATE NUMBER */}
                <span className="leading-none">
                  {day.date.getDate()}
                </span>

                {/* STATUS INDICATOR */}
                {hasTodos && (
                  <span
                    aria-hidden="true"
                    className={`
                      mt-1.5
                      flex
                      shrink-0
                      items-center
                      justify-center
                      ${
                        allCompleted
                          ? `
                            h-4
                            w-4
                            rounded-full
                            bg-white
                            text-[9px]
                            font-black
                            leading-none
                            text-blue-500
                            sm:h-5
                            sm:w-5
                            sm:text-[10px]
                          `
                          : `
                            h-2
                            w-2
                            rounded-full
                            bg-blue-300
                            sm:h-2.5
                            sm:w-2.5
                          `
                      }
                    `}
                  >
                    {allCompleted && "✓"}
                  </span>
                )}
              </button>
            );
          },
        }}
      />
    </div>
  );
}

export default Calendar;
