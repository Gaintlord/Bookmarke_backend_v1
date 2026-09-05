import bcrypt from "bcrypt";
import crypto from "crypto";

export const HashFunction = async (data: string) => {
  const salt = parseInt(process.env.BCRYPTSALT || "11") || 7;
  return await bcrypt.hash(data, salt);
};

export const hashVerify = async (data: string, hashedData: string) => {
  const status = await bcrypt.compare(data, hashedData);
  return status;
};
export const hashWCrypto = async (data: string) => {
  const hashedData = crypto
    .createHmac("SHA256", process.env.CRYPTOSECRET || "cryptoteri********")
    .update(data)
    .digest("hex");
  return hashedData;
};
