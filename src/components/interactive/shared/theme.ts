export const statusColors = {
  success: {
    bg: "bg-emerald-500",
    text: "text-emerald-700 dark:text-emerald-400",
    hex: "#22c55e",
    border: "border-emerald-500",
  },
  warning: {
    bg: "bg-amber-500",
    text: "text-amber-700 dark:text-amber-400",
    hex: "#f59e0b",
    border: "border-amber-500",
  },
  error: {
    bg: "bg-red-500",
    text: "text-red-700 dark:text-red-400",
    hex: "#ef4444",
    border: "border-red-500",
  },
  info: {
    bg: "bg-blue-500",
    text: "text-blue-700 dark:text-blue-400",
    hex: "#3b82f6",
    border: "border-blue-500",
  },
  neutral: {
    bg: "bg-gray-500",
    text: "text-gray-700 dark:text-gray-400",
    hex: "#6b7280",
    border: "border-gray-500",
  },
} as const;

export type StatusType = keyof typeof statusColors;

export const versionColors = {
  old: { bg: "bg-blue-500", text: "text-blue-700 dark:text-blue-400", hex: "#3b82f6" },
  new: { bg: "bg-emerald-500", text: "text-emerald-700 dark:text-emerald-400", hex: "#22c55e" },
} as const;
