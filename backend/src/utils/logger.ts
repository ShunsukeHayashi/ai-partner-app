/**
 * Logger utility using Winston
 */

import winston from 'winston';

const logLevel = process.env.LOG_LEVEL || 'info';

export function createLogger(service: string) {
  return winston.createLogger({
    level: logLevel,
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.json()
    ),
    defaultMeta: { service },
    transports: [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.printf(({ timestamp, level, message, service, ...meta }) => {
            let msg = `${timestamp} [${service}] ${level}: ${message}`;
            if (Object.keys(meta).length > 0) {
              msg += ` ${JSON.stringify(meta)}`;
            }
            return msg;
          })
        ),
      }),
    ],
  });
}
