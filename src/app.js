import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import errorMW from "./middlewares/error.js";
import { attachUserFromCookie } from "./middlewares/auth-cookie.js";

import { initPassport } from "./config/passport.js";
import sessionRoutes from "./routes/sessions.routes.js";
import privateRoutes from "./routes/private.routes.js";
import productsRoutes from "./routes/products.routes.js";
import ticketsRoutes from "./routes/tickets.routes.js";
import usersRoutes from "./routes/users.routes.js";
import { config } from "./config/config.js";

const app = express();

app.use(helmet());
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

app.use("/api/sessions", sessionRoutes);
app.use("/api/private", privateRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/tickets", ticketsRoutes);
app.use("/api/users", usersRoutes);

app.use((_req, res) => {
  res.status(404).json({ message: "Ruta no encontrada" });
});

app.use(errorMW);

export default app;
