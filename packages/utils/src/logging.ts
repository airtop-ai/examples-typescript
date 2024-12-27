import { LogLayer, LoggerType, type PluginShouldSendToLoggerParams } from "loglayer";

const logger = new LogLayer({
  logger: {
    instance: console,
    type: LoggerType.CONSOLE,
  },
  plugins: [
    {
      shouldSendToLogger(params: PluginShouldSendToLoggerParams) {
        // This would be empty on the client side; client-side logging is fine
        if (!process.env.NODE_ENV) {
          return true;
        }

        // server-side
        // Do not log anything in production if the log level is not error
        // This is to avoid logging sensitive information in production
        return !(process.env.NODE_ENV === "production" && params.logLevel !== "error");
      },
    },
  ],
});

export function getLogger(): LogLayer {
  return logger;
}
