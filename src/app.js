import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";

import errorMW from "./middlewares/error.js";
import { attachUserFromCookie } from "./middlewares/auth-cookie.js";

import { initPassport } from "./config/passport.js";
import privateRoutes from "./routes/private.routes.js";
import ticketsRoutes from "./routes/tickets.routes.js";
import usersRoutes from "./routes/users.routes.js";
import notificationRoutes from "./routes/notification.routes.js";

const app = express();

app.use(helmet({
  contentSecurityPolicy: false, 
}));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "../public")));

app.get("/reset-password.html", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/reset-password.html"));
});
app.use(cors({ origin: true, credentials: true }));
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.COOKIE_SECRET));

initPassport(app);
app.use(attachUserFromCookie);

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api/private", privateRoutes);
app.use("/api/tickets", ticketsRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/users", notificationRoutes);

app.use((_req, res) => {
  res.status(404).json({ message: "Ruta no encontrada" });
});

app.use(errorMW);

export default app;
