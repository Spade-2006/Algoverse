import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { buildHarness } from "./harnesses.js";
import { executeCode } from "./executionService.js";

// Basic .env parser (native Node, zero dependencies)
function loadEnv() {
  const envPaths = [
    path.resolve(process.cwd(), ".env"),
    path.resolve(process.cwd(), "../.env"),
    path.resolve(process.cwd(), ".env.example"),
  ];

  envPaths.forEach((envPath) => {
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, "utf8");
      content.split("\n").forEach((line) => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith("#")) {
          const idx = trimmed.indexOf("=");
          if (idx > 0) {
            const key = trimmed.slice(0, idx).trim();
            const val = trimmed.slice(idx + 1).trim();
            if (!process.env[key]) {
              process.env[key] = val;
            }
          }
        }
      });
    }
  });
}

loadEnv();

const PORT = process.env.PORT || 3001;

// Server-side challenge definition loader
// Searches multiple locations to support running from project root OR backend/ subdir
function loadServerChallenge(challengeId) {
  const normalizedId = (challengeId || "binary-search").replace(/-01$/, "");
  const cwd = process.cwd();
  const candidatePaths = [
    path.resolve(cwd, `src/challenges/${normalizedId}/tests/tests.json`),
    path.resolve(cwd, `frontend/src/challenges/${normalizedId}/tests/tests.json`),
    path.resolve(cwd, `../frontend/src/challenges/${normalizedId}/tests/tests.json`),
    path.resolve(path.dirname(new URL(import.meta.url).pathname), `../frontend/src/challenges/${normalizedId}/tests/tests.json`),
  ];

  const targetPath = candidatePaths.find((p) => fs.existsSync(p)) || null;

  if (!targetPath) {
    console.error(`[Backend] Challenge tests not found. Searched:\n  ${candidatePaths.join("\n  ")}`);
    return null;
  }

  try {
    const raw = fs.readFileSync(targetPath, "utf8");
    return JSON.parse(raw);
  } catch (err) {
    console.error(`[Backend] Error reading challenge tests: ${err.message}`);
    return null;
  }
}

const server = http.createServer(async (req, res) => {
  // CORS Headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);

  if (req.method === "GET" && url.pathname === "/api/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok", provider: process.env.CODE_EXECUTION_PROVIDER || "piston" }));
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/code/run") {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 20000) {
        req.destroy();
      }
    });

    req.on("end", async () => {
      try {
        const payload = JSON.parse(body || "{}");
        const { challengeId, language, sourceCode } = payload;

        // Security validations
        if (!challengeId || typeof challengeId !== "string") {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Invalid or missing challengeId." }));
          return;
        }

        const validLangs = ["cpp", "java", "python", "javascript"];
        if (!language || !validLangs.includes(language)) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Invalid or unsupported language." }));
          return;
        }

        if (!sourceCode || typeof sourceCode !== "string" || sourceCode.trim().length === 0) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Source code cannot be empty." }));
          return;
        }

        if (sourceCode.length > 10000) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Source code exceeds maximum size limit (10,000 characters)." }));
          return;
        }

        // Load server-side test suite
        const testSuite = loadServerChallenge(challengeId);
        if (!testSuite) {
          res.writeHead(404, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: `Challenge definition for '${challengeId}' not found on server.` }));
          return;
        }

        const visibleTests = testSuite.visible || [];
        const hiddenTests  = testSuite.hidden || [];
        const allTests     = [...visibleTests, ...hiddenTests];

        // Construct language test harness
        const harnessCode = buildHarness(language, sourceCode, allTests, challengeId);

        // Execute via remote sandboxed execution service
        const execResult = await executeCode({ language, sourceCode: harnessCode });

        if (!execResult.isConfigured) {
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({
            isConfigured: false,
            message: execResult.message || "Code execution service is not configured.",
          }));
          return;
        }

        if (execResult.error) {
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({
            isConfigured: true,
            status: "EXECUTION_ERROR",
            errorTitle: "EXECUTION SERVICE OFFLINE",
            errorMessage: `${execResult.error}\nMake sure Judge0 is running on http://localhost:2358`,
          }));
          return;
        }

        if (execResult.status === "COMPILATION_ERROR") {
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({
            isConfigured: true,
            status: "COMPILATION_ERROR",
            errorTitle: "COMPILATION ERROR",
            errorMessage: execResult.compileOutput || "Failed to compile submitted code.",
          }));
          return;
        }

        if (execResult.status === "TIME_LIMIT_EXCEEDED") {
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({
            isConfigured: true,
            status: "TIME_LIMIT_EXCEEDED",
            errorTitle: "TIME LIMIT EXCEEDED",
            errorMessage: "Execution exceeded time limits.",
          }));
          return;
        }

        if (execResult.status === "RUNTIME_ERROR") {
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({
            isConfigured: true,
            status: "RUNTIME_ERROR",
            errorTitle: "RUNTIME ERROR",
            errorMessage: execResult.stderr || "Runtime exception occurred.",
          }));
          return;
        }

        // Parse stdout for test case results
        const stdout = execResult.stdout || "";
        const visibleResults = [];
        const hiddenResults  = [];

        allTests.forEach((t, i) => {
          // Match: [ALGOVERSE_TEST_RESULT:N] <value>
          // The [ and ] must be escaped for RegExp; capture everything until end-of-line
          const regex = new RegExp(`\\[ALGOVERSE_TEST_RESULT:${i}\\]\\s*(.+)`);
          const match = stdout.match(regex);
          let received = null;
          let passed   = false;

          if (match) {
            const rawStr = match[1].trim();
            try {
              received = JSON.parse(rawStr);
            } catch {
              received = isNaN(rawStr) ? rawStr : Number(rawStr);
            }
            passed = JSON.stringify(received) === JSON.stringify(t.expected);
          }

          if (i < visibleTests.length) {
            visibleResults.push({
              id: t.id,
              name: t.name,
              input: t.input,
              expected: t.expected,
              received: received !== null ? received : "Error",
              passed,
            });
          } else {
            hiddenResults.push({
              id: t.id,
              name: t.name,
              passed,
            });
          }
        });

        const allPassed = visibleResults.length > 0 &&
                          visibleResults.every((r) => r.passed) &&
                          hiddenResults.every((r) => r.passed);

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({
          isConfigured: true,
          status: allPassed ? "ALL_PASSED" : "TESTS_FAILED",
          allPassed,
          message: allPassed ? "ALL TESTS PASSED\nThe path has been forged." : null,
          visibleResults,
          hiddenResults,
        }));
      } catch (err) {
        console.error("[Backend] Error processing execution request:", err);
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: `Internal server error: ${err.message}` }));
      }
    });
    return;
  }

  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Endpoint not found" }));
});

server.listen(PORT, () => {
  console.log(`[AlgoVerse Backend] Running on http://localhost:${PORT}`);
  console.log(`[AlgoVerse Backend] Provider: ${process.env.CODE_EXECUTION_PROVIDER || "piston"}`);
  console.log(`[AlgoVerse Backend] Remote Sandbox URL: ${process.env.CODE_EXECUTION_URL || "NOT CONFIGURED"}`);
});
