// Valid values for every required variable, shared by the unit and integration configs
export const testEnv = {
  NODE_ENV: "test",
  PORT: "3000",
  DATABASE_URL: "postgres://test:test@localhost:5434/bag_test",
  FRONTEND_URL: "http://localhost:3001",
  RESEND_API_KEY: "re_test",
  RESEND_FROM_EMAIL: "noreply@example.com",
};
