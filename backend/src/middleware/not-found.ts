/**
 * 404 Not Found handler
 */

import { Request, Response } from 'express';

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({
    error: {
      message: 'Route not found',
      statusCode: 404,
      path: req.path,
    },
  });
}
