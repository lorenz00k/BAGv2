import { config } from "dotenv";
import { Hono } from "hono";

import { logger } from "./middleware/logger.js";
import { corsMiddleware } from "./middleware/cors.js";
import auth from "./routes/auth.js";
import { globalRateLimiter } from "./middleware/rate-limit.js";
import user from "./routes/user.js";
import checksRouter from "./routes/checks.js";
import checkerRouter from "./routes/checker.js";
import account from "./routes/accounts.js";
import viennagis from "./routes/viennagis.js";
import { errorHandler } from "./middleware/error-handler.js";
import health from "./routes/health.js";
config();

// Order matters: Request → Logger → CORS → Route (middleware before routing)
const app = new Hono(); //create app-instance

// middleware 
app.use(logger);
app.use(corsMiddleware);
app.route("/api/auth", auth);
app.use(globalRateLimiter);

app.options("/api/*", (c) => c.body(null, 204));

app.route("/api/user", user);
app.route("/api/checks", checksRouter);
app.route("/api/checker", checkerRouter)
app.route("/api/account", account);

app.route("/api/viennagis", viennagis);

//error handel
app.onError(errorHandler);

//Alles in health.ts ist jetzt unter /health erreichbar
app.route("/health", health);


app.get("/", (c) => {
  return c.text("Backend läuft hoffentlich...");
});

export default app;