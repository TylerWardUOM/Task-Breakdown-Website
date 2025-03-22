export const getSizeClasses = (size: "sm" | "md" | "lg" = "md") => {
    switch (size) {
      case "sm":
        return { button: "w-8 h-8 text-xs", icon: "h-4 w-4" };
      case "lg":
        return { button: "w-12 h-12 text-base", icon: "h-6 w-6" };
      default:
        return { button: "w-10 h-10 text-sm", icon: "h-5 w-5" };
    }
  };
  