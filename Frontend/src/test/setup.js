import "@testing-library/jest-dom/vitest";
import { beforeAll, afterEach, afterAll } from "vitest";
import axios from "axios";
import { server } from "./server.js";

axios.defaults.adapter = "fetch";

beforeAll(() => server.listen({ onUnhandledRequest: "warn" }));
afterEach(() => {
  server.resetHandlers();
  axios.defaults.adapter = "fetch";
});
afterAll(() => server.close());
