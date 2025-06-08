import { RepeatInterval } from "@GlobalTypes/Task";


export const convertToUTC = (localDate: string): string => {
  const [year, month, day] = localDate.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day)); // month is 0-indexed
  return date.toISOString(); // Returns UTC in the format "YYYY-MM-DDT00:00:00.000Z"
};

export const formatDueDate = (date: string | null): string | null => {
    if (!date) return null;
    const parsedDate = new Date(date);
    return parsedDate.toISOString().split("T")[0]; // Formats as YYYY-MM-DD
  };
  
  export const mapRepeatIntervalToDropdownValue = (repeatInterval: RepeatInterval | null) => {
    if (repeatInterval==null) return "None"
    if (repeatInterval.days === 1) return "Daily";
    if (repeatInterval.days === 7) return "Weekly";
    if (repeatInterval.months === 1) return "Monthly";
    return "None";
  };
  
  export const formatRepeatInterval = (repeatTask: string) => {
    switch (repeatTask) {
      case "Daily":
        return "1 day";
      case "Weekly":
        return "7 days";
      case "Monthly":
        return "1 month";
      default:
        return null;
    }
  };
  
  // Convert string back to RepeatInterval object
export const parseRepeatInterval = (repeatInterval: string | null): RepeatInterval | null => {
    if (!repeatInterval) return null;
  
    const [value, unit] = repeatInterval.split(" "); // Example: "1 day" → [1, "day"]
    const numericValue = parseInt(value, 10);
  
    if (unit.startsWith("day")) return { days: numericValue };
    if (unit.startsWith("month")) return { months: numericValue };
    
    return null;
  };
  

// Convert hours and minutes into total minutes
export const convertToMinutes = (duration: { hours: number; minutes: number } | null): number | null =>
  duration ? duration.hours * 60 + duration.minutes : null;
