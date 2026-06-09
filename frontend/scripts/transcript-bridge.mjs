#!/usr/bin/env node

import http from "node:http";

const PORT = Number(process.env.TRANSCRIPT_BRIDGE_PORT || 4317);
const TOKEN = process.env.TRANSCRIPT_BRIDGE_TOKEN || "tulip-local-bridge";
const ALLOW_ORIGIN = process.env.TRANSCRIPT_BRIDGE_ORIGIN || "*";

function extractVideoId(url) {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const pattern of patterns) {
    const match = String(url || "").match(pattern);
    if (match) return match[1];
  }
  return null;
}

function formatTimestamp(ms) {
  const total = Math.floor(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return h > 0
    ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
    : `${m}:${String(s).padStart(2, "0")}`;
}

function sendJson(res, status, body) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": ALLOW_ORIGIN,
    "Access-Control-Allow-Methods": "POST, OPTIONS, GET",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Transcript-Bridge-Token",
    "Access-Control-Max-Age": "86400",
  });
  res.end(JSON.stringify(body));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.setEncoding("utf8");
    req.on("data", chunk => {
      raw += chunk;
      if (raw.length > 1024 * 1024) {
        reject(new Error("Request body too large"));
        req.destroy();
      }
    });
    req.on("end", () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        reject(new Error("Invalid JSON body"));
      }
    });
    req.on("error", reject);
  });
}

function isAuthorized(req) {
  const bearer = req.headers.authorization?.replace(/^Bearer\s+/i, "").trim();
  const custom = req.headers["x-transcript-bridge-token"];
  return bearer === TOKEN || custom === TOKEN;
}

async function fetchTitle(videoId) {
  try {
    const res = await fetch(
      `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.title || null;
  } catch {
    return null;
  }
}

async function fetchTranscript(videoId) {
  const { YoutubeTranscript } = await import("youtube-transcript");
  const raw = await YoutubeTranscript.fetchTranscript(videoId);
  if (!Array.isArray(raw) || raw.length === 0) return null;

  const transcript = raw
    .map(item => {
      const text = String(item.text || "").trim();
      if (!text) return null;
      return `[${formatTimestamp(Number(item.offset || 0))}] ${text}`;
    })
    .filter(Boolean)
    .join("\n");

  return transcript.length > 100 ? transcript : null;
}

const server = http.createServer(async (req, res) => {
  if (req.method === "OPTIONS") {
    return sendJson(res, 204, {});
  }

  if (req.method === "GET" && req.url === "/health") {
    return sendJson(res, 200, {
      ok: true,
      service: "Tulip Local Transcript Bridge",
      port: PORT,
    });
  }

  if (req.method !== "POST" || req.url !== "/transcript") {
    return sendJson(res, 404, { error: "Use POST /transcript" });
  }

  if (!isAuthorized(req)) {
    return sendJson(res, 401, { error: "Unauthorized transcript bridge request." });
  }

  try {
    const body = await readBody(req);
    const rawUrl = String(body.url || "").trim();
    const videoId = extractVideoId(rawUrl);
    if (!videoId) {
      return sendJson(res, 400, { error: "Could not find a YouTube video ID in this URL." });
    }

    const [transcript, title] = await Promise.all([
      fetchTranscript(videoId),
      fetchTitle(videoId),
    ]);

    if (!transcript) {
      return sendJson(res, 422, {
        videoId,
        error: "Local bridge could not fetch this transcript.",
      });
    }

    return sendJson(res, 200, {
      videoId,
      title,
      transcript,
      method: "local-transcript-bridge",
    });
  } catch (error) {
    return sendJson(res, 500, {
      error: error instanceof Error ? error.message : "Transcript bridge failed.",
    });
  }
});

server.listen(PORT, "0.0.0.0", () => {
  console.log("");
  console.log("Tulip Local Transcript Bridge is running");
  console.log(`URL: http://localhost:${PORT}/transcript`);
  console.log(`Health: http://localhost:${PORT}/health`);
  console.log(`Token: ${TOKEN}`);
  console.log("");
  console.log("For the live app, expose this with a secure tunnel, for example:");
  console.log(`cloudflared tunnel --url http://localhost:${PORT}`);
  console.log("");
});
