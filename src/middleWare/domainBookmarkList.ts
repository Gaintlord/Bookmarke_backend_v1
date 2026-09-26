import { Request, Response } from "express";
import { domainBookmarkQuery } from "../models/zodDataModel";
import { getUserBookmarksByDomain } from "../controllers/userBokmarkeController";
import { getDomainName } from "../utils/hostNameSanitize";

export const domainBookmarkList = async (req: Request, res: Response) => {
  const userId = Number((req as Request & { userid?: string }).userid);
  if (!Number.isSafeInteger(userId) || userId < 1) {
    return res.status(401).json({ err: "Invalid authenticated user" });
  }

  const validatedQuery = domainBookmarkQuery.safeParse(req.query);
  if (!validatedQuery.success) {
    return res.status(400).json({ err: "Missing or invalid domain" });
  }

  const hostName = getDomainName(validatedQuery.data.domain);
  if (hostName === null) {
    return res.status(400).json({ err: "Missing or invalid domain" });
  }

  try {
    const bookmarks = await getUserBookmarksByDomain(userId, hostName);
    return res.status(200).json(bookmarks);
  } catch {
    return res.status(500).json({ err: "Unable to load bookmarks" });
  }
};
