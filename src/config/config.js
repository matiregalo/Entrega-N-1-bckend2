import dotenv from "dotenv";
import fs from "fs";

const modeArg = (() => {
  const i = process.argv.indexOf("--mode");
  return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : null;
})();
const MODE = modeArg || process.env.NODE_ENV || "development";

const modePath = `.env.${MODE}`;
if (fs.existsSync(modePath)) {
  dotenv.config({ path: modePath });
} else {
  dotenv.config({ path: ".env" });
}

const parseList = (csv) =>
  csv
    ? csv
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

export const config = {
  mode: MODE,
  isProd: MODE === "production",

  PORT: Number(process.env.PORT),
  MONGO_URI: process.env.MONGO_URI,
  MONGO_DB: process.env.MONGO_DB,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES: process.env.JWT_EXPIRES,
  COOKIE_NAME: process.env.COOKIE_NAME,
  COOKIE_SECRET: process.env.COOKIE_SECRET,
};
