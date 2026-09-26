import { Request, Response } from "express";
import { getBookmarkDashboard } from "../controllers/dashboardController";

export const dashboardBookmarkSummary = async (req: Request, res: Response) => {
  const userId = Number((req as Request & { userid?: string }).userid);
  if (!Number.isSafeInteger(userId) || userId < 1) {
    return res.status(401).json({ err: "Invalid authenticated user" });
  }

  try {
    const groups = await getBookmarkDashboard(userId);
    return res.status(200).json(groups);
  } catch {
    return res.status(500).json({ err: "Unable to load dashboard bookmarks" });
  }
};
