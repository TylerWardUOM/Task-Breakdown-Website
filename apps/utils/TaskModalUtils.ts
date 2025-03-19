export const formatDueDate = (date: string | null): string | null => {
    if (!date) return null;
    const parsedDate = new Date(date);
    return parsedDate.toISOString().split("T")[0]; // Formats as YYYY-MM-DD
  };
  
  export const mapRepeatIntervalToDropdownValue = (repeatInterval: any) => {
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
  