import crypto from "crypto";

export const hashKey = (string: string): string => {
  return crypto.createHash("sha256").update(string).digest("hex").slice(0, 64);
};
