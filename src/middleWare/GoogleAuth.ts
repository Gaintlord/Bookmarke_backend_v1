import { Request, Response } from "express";
import { decodeRefreshToken } from "../utils/tokenManager";

const GoogleAuth = async (req: Request, res: Response) => {
  let { code, state } = req.query;
  let userState = req.cookies.KMTE_STE;

  if (state === userState) {
    //@ts-ignore
    let body = new URLSearchParams({
      code: code,
      client_id: process.env.GOOGLE_C_ID,
      client_secret: process.env.GOOGLE_C_SECRET,
      redirect_uri: process.env.GOOGLE_REDIRECT,
      grant_type: "authorization_code",
    });
    let response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
    });

    let userDetail = await response.json();
    console.log(await decodeRefreshToken(userDetail.id_token));
    userDetail = await decodeRefreshToken(userDetail.id_token);
  } else {
    console.log(`potential CSRF at ${new Date(Date.now())}`);
    res.status(403).json({ err: "unsanitized request" });
  }
};

export default GoogleAuth;

/* 
{
  iss: "https://accounts.google.com",
  azp: "271039964613-j6k26gvcir8isklvnifsc356pl45i4b1.apps.googleusercontent.com",
  aud: "271039964613-j6k26gvcir8isklvnifsc356pl45i4b1.apps.googleusercontent.com",
  sub: "114531828388616498548",
  email: "icha.icha.taishi@gmail.com",
  email_verified: true,
  at_hash: "5GS9rTOfSJ_vCc5LAAovmQ",
  name: "Twi light",
  picture: "https://lh3.googleusercontent.com/a/ACg8ocITTZpovuM8hFnBtaF5ENfry2mXW_n9upX164s2EFSt36juhyle=s96-c",
  given_name: "Twi",
  family_name: "light",
  iat: 1764842557,
  exp: 1764846157,
}
*/
