import "dotenv/config";
import mongoose from "mongoose";
import app from "./src/app.js";

const { MONGO_URI, MONGO_DB = "interactive_practice", PORT } = process.env;

await mongoose.connect(MONGO_URI, { dbName: MONGO_DB });
console.log(`Mongo Conectado ${MONGO_DB}`);

const server = app.listen(PORT, () => {
  console.log(`API escuchando en ${PORT}`);
});

process.on("SIGINT", async () => {
  await mongoose.disconnect();
  console.log("Cerrando");
  server.close(() => process.exit(0));
});
