import z, { email } from "zod";

export const zoduserSignUp = z.object({
  userEmail: z.email(),
  userPassword: z
    .string()
    .min(9, "Password must be greater than 9")
    .regex(/[a-z]/, "Password must contain a Capital Letter")
    .regex(/[A-Z]/, "Password must contain a Small Letter")
    .regex(/[0-9]/, "Password must contain a Number")
    .regex(
      /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
      "Password must contain a Special Character"
    ),
});

export const emailVerify = z.object({
  userEmail: z.email(),
  otp: z.string().length(6),
});

export const userSentBokmarke = z.object({
  userBokmarke: z.object({
    image: z.string().max(1024),
    link: z.url(),
    hostName: z.string().max(512),
  }),
});

export const domainBookmarkQuery = z.object({
  domain: z.string().trim().min(1).max(512),
});
