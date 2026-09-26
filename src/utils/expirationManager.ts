import dotenv from "dotenv";
dotenv.config();

const readPositiveMs = (value: string | undefined, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback;
};

// Fallbacks match the intended production TTLs (24h / 14d).
export const accessTokenExp = readPositiveMs(
  process.env.ACCESS_TOKEN_EXP,
  24 * 60 * 60 * 1000
);
export const refreshTokenExp = readPositiveMs(
  process.env.REFRESH_TOKEN_EXP,
  14 * 24 * 60 * 60 * 1000
);
