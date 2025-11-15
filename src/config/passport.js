import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import User from "../models/User.js";
import bcrypt from "bcrypt";

const { JWT_SECRET, COOKIE_NAME } = process.env;

passport.use(
  "local",
  new LocalStrategy(
    { usernameField: "email", passwordField: "password", session: false },
    async (email, password, done) => {
      try {
        const norm = String(email).toLowerCase().trim();
        const user = await User.findOne({ email: norm });
        if (!user) {
          return done(null, false, { message: "usuario no encontrado" });
        }
        const ok = await bcrypt.compare(password, user.password);
        if (!ok) {
          return done(null, false, { message: "contraseña incorrecta" });
        }
        return done(null, {
          id: String(user.id),
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          age: user.age,
          role: user.role,
        });
      } catch (error) {
        return done(error);
      }
    },
  ),
);

const bearer = ExtractJwt.fromAuthHeaderAsBearerToken();
const cookieExtractor = (req) =>
  req?.signedCookies?.[COOKIE_NAME] || req?.cookies?.[COOKIE_NAME] || null;

passport.use(
  "jwt",
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromExtractors([bearer, cookieExtractor]),
      secretOrKey: JWT_SECRET,
    },
    (payload, done) => {
      try {
        return done(null, {
          id: payload.sub,
          first_name: payload.first_name,
          last_name: payload.last_name,
          email: payload.email,
          age: payload.age,
          role: payload.role,
        });
      } catch (error) {
        return done(error, false);
      }
    },
  ),
);

export const authenticateJWT = (req, res, next) => {
  passport.authenticate("jwt", { session: false }, (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).json({ error: "Debes iniciar sesión" });
    }
    req.user = user;
    next();
  })(req, res, next);
};

export const initPassport = (app) => app.use(passport.initialize());
export default passport;
