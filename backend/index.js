const env = require("./src/config/env.config");
const app = require("./src/app");

const server = app.listen(env.port, () => {
  console.log(`NEXUS Jakarta backend listening on port ${env.port}`);
});

function shutdown(signal) {
  console.log(`${signal} received; shutting down`);
  server.close(() => process.exit(0));
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
