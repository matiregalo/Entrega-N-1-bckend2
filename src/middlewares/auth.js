import passport from "passport";

export const requireRole = (role) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "No autenticado" });
    }
    if (req.user.role !== role && req.user.role !== "admin") {
      return res.status(403).json({ error: "Permisos insuficientes" });
    }
    next();
  };
};

export const authenticateJWT = (req, res, next) => {
  passport.authenticate("jwt", { session: false }, (err, user) => {
    if (err) return next(err);
    if (!user) return res.status(401).json({ error: "Debes iniciar sesión" });
    req.user = user;
    next();
  })(req, res, next);
};
