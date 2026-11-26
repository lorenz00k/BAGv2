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
import ready from "./routes/ready.js";
import { secureHeaders } from "hono/secure-headers";


const app = new Hono(); //create app-instance

//security header for all routes
app.use(secureHeaders());

//probes
app.route("/health", health);
app.route("/ready", ready);

// Order matters: Request → Logger → CORS → Route (middleware before routing)

// middleware
app.use(logger);
app.use(corsMiddleware);
app.route("/api/auth", auth);
app.use(globalRateLimiter);

app.options("/api/*", (c) => c.body(null, 204));

app.route("/api/user", user);
app.route("/api/checks", checksRouter);
app.route("/api/checker", checkerRouter);
app.route("/api/account", account);

app.route("/api/viennagis", viennagis);

//error handel
app.onError(errorHandler);

app.get("/", (c) => {
  return c.text("Backend läuft hoffentlich...");
});

export default app;
