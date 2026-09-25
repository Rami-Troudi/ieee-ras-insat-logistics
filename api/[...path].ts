import { getRequestListener } from "@hono/node-server";
import { app } from "../src/worker/index";
import { createRuntimeEnv } from "../src/worker/runtime-env";

const handler = getRequestListener((incomingRequest) => {
  const requestUrl = new URL(incomingRequest.url);
  const rewrittenPath = requestUrl.searchParams.get("__api_path");
  requestUrl.searchParams.delete("__api_path");
  if (rewrittenPath !== null) requestUrl.pathname = `/api/${rewrittenPath}`;
  const headers = new Headers(incomingRequest.headers);
  const clientIp =
    incomingRequest.headers.get("x-vercel-forwarded-for") ??
    incomingRequest.headers.get("x-forwarded-for");
  headers.set("CF-Connecting-IP", clientIp?.split(",", 1)[0]?.trim() || "unknown");
  const init: RequestInit = {
    method: incomingRequest.method,
    headers,
    redirect: incomingRequest.redirect,
  };
  if (
    incomingRequest.method !== "GET" &&
    incomingRequest.method !== "HEAD" &&
    incomingRequest.body
  ) {
    Object.assign(init, { body: incomingRequest.body, duplex: "half" });
  }
  return app.fetch(new Request(requestUrl, init), createRuntimeEnv());
});

export default handler;
