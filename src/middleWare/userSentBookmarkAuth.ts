import { Request, Response } from "express";
import { userSentBokmarke } from "../models/zodDataModel";
import { addUserBookmarkeToDb } from "../controllers/userBokmarkeController";
import { getDomainName } from "../utils/hostNameSanitize";
import { getYtVideoID } from "../utils/getYTVideoId";

export const userSentBookmarkeAuth = async (req: Request, res: Response) => {
  console.log("!!!!!!!! reached at usersentBokmark !!!!!");
  // @ts-ignore
  const userId = parseInt(req.userid);
  console.log(userId);
  console.log(req.body);
  const validatedBokmarke = userSentBokmarke.safeParse(req.body);

  if (!validatedBokmarke.success) {
    res.status(401).json({ status: "unsanitized data" });
  } else {
    let { image, link, hostName } = validatedBokmarke.data?.userBokmarke;
    const realHostname = getDomainName(hostName);
    if (realHostname != null) {
      console.log(" !!!!! was not null");
      if (realHostname === "youtube.com") {
        let vidId = getYtVideoID(link);

        let thumnail = `https://img.youtube.com/vi/${vidId}/hqdefault.jpg`;
        console.log(thumnail);
        await addUserBookmarkeToDb(thumnail, link, realHostname, userId);
      } else {
        await addUserBookmarkeToDb(image, link, realHostname, userId);
      }
      res.status(201).json({ status: "Bokmarke stored" });
    } else {
      res.status(500).json({ status: "Unable to bookmark" });
    }
  }
};
