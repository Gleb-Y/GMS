import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "./utils";

export type CalendarProps = {
  mode?: "single";
  selected?: Date;
  onSelect?: (date: Date | undefined) => void;
  className?: string;
};

function Calendar({ mode = "single", selected, onSelect, className }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState(
    selected ? new Date(selected.getFullYear(), selected.getMonth(), 1) : new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  );

  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  ).getDate();

  const firstDayOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  ).getDay();

  const daysInPrevMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    0
  ).getDate();

  const today = new Date();
  const isToday = (day: number, month: number, year: number) => {
    return (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    );
  };

  const isSelected = (day: number, month: number, year: number) => {
    if (!selected) return false;
    return (
      day === selected.getDate() &&
      month === selected.getMonth() &&
      year === selected.getFullYear()
    );
  };

  const handlePrevMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    );
  };

  const handleDayClick = (day: number, isCurrentMonth: boolean, isPrevMonth: boolean) => {
    if (!onSelect) return;
    
    let month = currentMonth.getMonth();
    let year = currentMonth.getFullYear();
    
    if (isPrevMonth) {
      month = month - 1;
      if (month < 0) {
        month = 11;
        year = year - 1;
      }
    } else if (!isCurrentMonth) {
      month = month + 1;
      if (month > 11) {
        month = 0;
        year = year + 1;
      }
    }
    
    onSelect(new Date(year, month, day));
  };

  const days: any[] = [];
  const dayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  // Previous month days
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;
    days.push({
      day,
      isCurrentMonth: false,
      isPrevMonth: true,
      key: `prev-${day}`,
    });
  }

  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    days.push({
      day,
      isCurrentMonth: true,
      isPrevMonth: false,
      key: `current-${day}`,
    });
  }

  // Next month days
  const remainingDays = 42 - days.length;
  for (let day = 1; day <= remainingDays; day++) {
    days.push({
      day,
      isCurrentMonth: false,
      isPrevMonth: false,
      key: `next-${day}`,
    });
  }

  const monthYear = currentMonth.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className={cn("p-3", className)}>
      <div className="flex flex-col gap-4">
        {/* Header */}
        <div className="flex justify-center pt-1 relative items-center w-full">
          <button
            onClick={handlePrevMonth}
            className="size-7 bg-transparent p-0 opacity-50 hover:opacity-100 text-white border border-zinc-700 rounded-md absolute left-1 inline-flex items-center justify-center"
            type="button"
          >
            <ChevronLeft className="size-4" />
          </button>
          <div className="text-sm font-medium text-white">{monthYear}</div>
          <button
            onClick={handleNextMonth}
            className="size-7 bg-transparent p-0 opacity-50 hover:opacity-100 text-white border border-zinc-700 rounded-md absolute right-1 inline-flex items-center justify-center"
            type="button"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="w-full">
          {/* Day names */}
          <div className="flex w-full">
            {dayNames.map((name) => (
              <div
                key={name}
                className="text-gray-300 rounded-md w-8 font-normal text-xs flex items-center justify-center flex-1"
              >
                {name}
              </div>
            ))}
          </div>

          {/* Days */}
          <div className="mt-2">
            {Array.from({ length: Math.ceil(days.length / 7) }).map((_, weekIndex) => (
              <div key={weekIndex} className="flex w-full mt-2">
                {days.slice(weekIndex * 7, (weekIndex + 1) * 7).map((dayObj) => {
                  const { day, isCurrentMonth, isPrevMonth, key } = dayObj;
                  const month = isPrevMonth
                    ? currentMonth.getMonth() - 1
                    : isCurrentMonth
                    ? currentMonth.getMonth()
                    : currentMonth.getMonth() + 1;
                  const year = currentMonth.getFullYear();
                  
                  const isTodayDay = isToday(day, month, year);
                  const isSelectedDay = isSelected(day, month, year);

                  return (
                    <div key={key} className="relative p-0 text-center text-sm flex-1">
                      <button
                        onClick={() => handleDayClick(day, isCurrentMonth, isPrevMonth)}
                        type="button"
                        className={cn(
                          "size-8 p-0 font-normal rounded-md inline-flex items-center justify-center w-full",
                          isCurrentMonth
                            ? "text-white hover:bg-zinc-700"
                            : "text-black hover:opacity-80",
                          !isCurrentMonth && "bg-orange-500 bg-opacity-20",
                          isTodayDay && "bg-white text-black hover:bg-white",
                          isSelectedDay && !isTodayDay && "bg-orange-500 text-white hover:bg-orange-600"
                        )}
                      >
                        {day}
                      </button>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

Calendar.displayName = "Calendar";

export { Calendar };
