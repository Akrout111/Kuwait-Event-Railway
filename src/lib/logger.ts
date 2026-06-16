type LogLevel = "debug" | "info" | "warn" | "error";

const isDev = process.env.NODE_ENV === "development";

function formatMessage(level: LogLevel, context: string, message: string): string {
  return `[${level.toUpperCase()}] [${context}] ${message}`;
}

export const logger = {
  debug(context: string, message: string, ...data: unknown[]) {
    if (isDev) {
      console.log(formatMessage("debug", context, message), ...data);
    }
  },

  info(context: string, message: string, ...data: unknown[]) {
    if (isDev) {
      console.info(formatMessage("info", context, message), ...data);
    }
  },

  warn(context: string, message: string, ...data: unknown[]) {
    console.warn(formatMessage("warn", context, message), ...data);
  },

  error(context: string, message: string, ...data: unknown[]) {
    console.error(formatMessage("error", context, message), ...data);
  },
};
