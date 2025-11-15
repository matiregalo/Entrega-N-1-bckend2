export default (error, _req, res, _next) => {
  console.error("Error middleware:", error);
  const status = error.status;
  res.status(status).json({ error: error.message || "Error interno" });
};
