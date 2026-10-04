import { Request, Response } from "express";

export const sessionCheck = (_req: Request, res: Response) => {
  return res.status(200).json({ status: true });
};
