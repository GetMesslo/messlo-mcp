/**
 * HTTP client for Messlo REST API (API key auth).
 */

import fs from "node:fs";
import path from "node:path";

export class MessloApiError extends Error {
  constructor(message, { status, body } = {}) {
    super(message);
    this.name = "MessloApiError";
    this.status = status;
    this.body = body;
  }
}

export function createMessloClient(config) {
  const { apiKey, baseUrl } = config;

  async function request(method, path, body) {
    const url = `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;
    const init = {
      method: method.toUpperCase(),
      headers: {
        "X-API-Key": apiKey,
        Accept: "application/json",
      },
    };

    if (body !== undefined && method.toUpperCase() !== "GET") {
      init.headers["Content-Type"] = "application/json";
      init.body = JSON.stringify(body);
    }

    let res;
    try {
      res = await fetch(url, init);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Network request failed";
      throw new MessloApiError(
        `${msg} (URL: ${url}). Check network connectivity to Messlo API.`,
        { status: 0 }
      );
    }

    const text = await res.text();
    let data = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = text;
    }

    if (!res.ok) {
      const message =
        (data && typeof data === "object" && (data.message || data.error)) ||
        res.statusText ||
        `HTTP ${res.status}`;
      throw new MessloApiError(String(message), {
        status: res.status,
        body: data,
      });
    }

    return data;
  }

  async function uploadFile(apiPath, filePath, fieldName = "file") {
    const resolved = path.resolve(filePath);
    if (!fs.existsSync(resolved)) {
      throw new MessloApiError(`File not found: ${resolved}`, { status: 0 });
    }
    const buffer = fs.readFileSync(resolved);
    const form = new FormData();
    const blob = new Blob([buffer]);
    form.append(fieldName, blob, path.basename(resolved));

    const url = `${baseUrl}${apiPath.startsWith("/") ? apiPath : `/${apiPath}`}`;
    let res;
    try {
      res = await fetch(url, {
        method: "POST",
        headers: {
          "X-API-Key": apiKey,
          Accept: "application/json",
        },
        body: form,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Upload failed";
      throw new MessloApiError(`${msg} (URL: ${url})`, { status: 0 });
    }

    const text = await res.text();
    let data = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = text;
    }
    if (!res.ok) {
      const message =
        (data && typeof data === "object" && (data.message || data.error)) ||
        res.statusText ||
        `HTTP ${res.status}`;
      throw new MessloApiError(String(message), { status: res.status, body: data });
    }
    return data;
  }

  return {
    get: (path) => request("GET", path),
    post: (path, body) => request("POST", path, body),
    put: (path, body) => request("PUT", path, body),
    patch: (path, body) => request("PATCH", path, body),
    delete: (path, body) => request("DELETE", path, body),
    uploadFile,
    request,
  };
}
