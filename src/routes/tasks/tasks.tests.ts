import { testClient } from "hono/testing";
import { execSync } from "node:child_process";
import fs from "node:fs";
import { afterAll, beforeAll, describe, expect, expectTypeOf, it } from "vitest";

import { ZOD_ERROR_MESSAGES } from "@/lib/constants";
import createApp, { createTestApp } from "@/lib/create-app";

import router from "./tasks.index";

const client = testClient(createApp().route("/", router));

describe("tasks list", () => {
  beforeAll(async () => {
    execSync("pnpm drizzle-kit push");
  });

  afterAll(async () => {
    fs.rmSync("test.db", { force: true });
  });

  it("responds with an array", async () => {
    const testRouter = createTestApp(router);
    const response = await testRouter.request("/tasks");
    const result = await response.json();
    // @ts-expect-error TODO: fix this
    expectTypeOf(result).toBeArray();
  });

  it("responds with an array again", async () => {
    const response = await client.tasks.$get();
    const json = await response.json();
    expectTypeOf(json).toBeArray();
  });

  it("validates the id param", async () => {
    const response = await client.tasks[":id"].$get({
      param: {
        id: "wat",
      },
    });
    expect(response.status).toBe(422);
  });

  it("validates the body when creating", async () => {
    const response = await client.tasks.$post({
      // @ts-expect-error TODO: fix this
      json: {
        done: false,
      },
    });
    expect(response.status).toBe(422);
    if (response.status === 422) {
      const json = await response.json();
      expect(json.error.issues[0].path[0]).toBe("name");
      expect(json.error.issues[0].message).toBe(ZOD_ERROR_MESSAGES.REQUIRED);
    }
  });
});
