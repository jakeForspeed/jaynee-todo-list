import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";

function Calendar({
  selectedDate,
  onSelectDate,
  todoDates = {},
}) {
  // ============================================
  // CREATE DATE ARRAYS FOR DAY PICKER
  // ============================================

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
    <div className="w-full">
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
            "flex items-center justify-between mb-2 px-1",

          caption_label:
            "text-base font-bold text-blue-900 sm:text-lg",

          nav:
            "flex items-center gap-1",

          button_previous:
            "flex h-8 w-8 items-center justify-center rounded-xl text-blue-500 transition hover:bg-blue-50 sm:h-9 sm:w-9",

          button_next:
            "flex h-8 w-8 items-center justify-center rounded-xl text-blue-500 transition hover:bg-blue-50 sm:h-9 sm:w-9",

          month_grid:
            "w-full",

          weekdays:
            "grid grid-cols-7 mb-1",

          weekday:
            "text-center text-[10px] font-semibold text-slate-400 sm:text-xs",

          week:
            "grid grid-cols-7",

          day:
            "relative flex items-center justify-center py-0.5",

          day_button:
            "relative flex h-9 w-9 items-center justify-center rounded-xl text-xs font-medium text-slate-700 transition hover:bg-blue-50 hover:text-blue-600 sm:h-10 sm:w-10 sm:text-sm",

          selected:
            "rounded-xl bg-blue-500 text-white shadow-md shadow-blue-200",

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
                className={`${props.className || ""} relative`}
              >
                {day.date.getDate()}

                {hasTodos && (
                  <span
                    className={`absolute bottom-0.5 left-1/2 flex -translate-x-1/2 items-center justify-center ${
                      allCompleted
                        ? "h-3.5 w-3.5 rounded-full bg-white text-[8px] font-bold text-blue-500"
                        : "h-1.5 w-1.5 rounded-full bg-blue-300"
                    }`}
                  >
                    {allCompleted ? "✓" : ""}
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