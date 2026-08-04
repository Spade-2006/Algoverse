/**
 * Remote Sandboxed Execution Service Adapter (Piston API / Judge0 API).
 * NEVER runs untrusted code locally on host process or machine.
 */

const LANGUAGE_MAP = {
  piston: {
    cpp: { language: "c++", version: "10.2.0" },
    java: { language: "java", version: "15.0.2" },
    python: { language: "python", version: "3.10.0" },
    javascript: { language: "javascript", version: "18.15.0" },
  },
  judge0: {
    cpp: 54,        // C++ (GCC 9.2.0)
    java: 62,       // Java (OpenJDK 13.0.1)
    python: 71,     // Python (3.8.1)
    javascript: 63, // Node.js (12.14.0)
  },
};

function decodeBase64(str) {
  if (!str) return "";
  try {
    return Buffer.from(str, "base64").toString("utf8");
  } catch {
    return str;
  }
}

export async function executeCode({ language, sourceCode }) {
  const providerUrl = process.env.CODE_EXECUTION_URL;
  const provider = (process.env.CODE_EXECUTION_PROVIDER || "piston").toLowerCase();
  const apiKey = process.env.CODE_EXECUTION_API_KEY;

  if (!providerUrl) {
    return {
      isConfigured: false,
      message: "Code execution service is not configured.",
    };
  }

  if (provider === "piston") {
    return executePiston({ providerUrl, apiKey, language, sourceCode });
  } else if (provider === "judge0") {
    return executeJudge0({ providerUrl, apiKey, language, sourceCode });
  } else {
    return {
      isConfigured: false,
      message: `Unknown code execution provider: ${provider}`,
    };
  }
}

async function executePiston({ providerUrl, apiKey, language, sourceCode }) {
  const langConfig = LANGUAGE_MAP.piston[language];
  if (!langConfig) {
    return { isConfigured: true, error: `Unsupported language: ${language}` };
  }

  const endpoint = providerUrl.endsWith("/execute") ? providerUrl : `${providerUrl.replace(/\/+$/, "")}/execute`;

  const headers = { "Content-Type": "application/json" };
  if (apiKey) {
    headers["Authorization"] = apiKey;
  }

  const filename = language === "java" ? "Main.java" : `solution.${language === "cpp" ? "cpp" : language === "python" ? "py" : "js"}`;

  const body = JSON.stringify({
    language: langConfig.language,
    version: langConfig.version,
    files: [{ name: filename, content: sourceCode }],
    compile_timeout: 10000,
    run_timeout: 5000,
  });

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    const response = await fetch(endpoint, {
      method: "POST",
      headers,
      body,
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!response.ok) {
      return {
        isConfigured: true,
        error: `Execution provider HTTP Error ${response.status}: ${response.statusText}`,
      };
    }

    const data = await response.json();
    const compileOutput = data.compile ? data.compile.output : "";
    const stdout = data.run ? data.run.stdout : "";
    const stderr = data.run ? data.run.stderr : "";
    const signal = data.run ? data.run.signal : null;

    if (signal === "SIGKILL" || signal === "SIGTERM") {
      return {
        isConfigured: true,
        status: "TIME_LIMIT_EXCEEDED",
        message: "TIME LIMIT EXCEEDED",
      };
    }

    if (data.compile && data.compile.code !== 0) {
      return {
        isConfigured: true,
        status: "COMPILATION_ERROR",
        compileOutput: sanitizeError(compileOutput || stderr),
      };
    }

    if (data.run && data.run.code !== 0 && !stdout.includes("[ALGOVERSE_TEST_RESULT")) {
      return {
        isConfigured: true,
        status: "RUNTIME_ERROR",
        stderr: sanitizeError(stderr || stdout),
      };
    }

    return {
      isConfigured: true,
      status: "SUCCESS",
      stdout,
      stderr: sanitizeError(stderr),
    };
  } catch (err) {
    if (err.name === "AbortError") {
      return {
        isConfigured: true,
        status: "TIME_LIMIT_EXCEEDED",
        message: "TIME LIMIT EXCEEDED",
      };
    }
    return {
      isConfigured: true,
      error: `Failed to communicate with sandboxed execution provider: ${err.message}`,
    };
  }
}

async function executeJudge0({ providerUrl, apiKey, language, sourceCode }) {
  const langId = LANGUAGE_MAP.judge0[language];
  if (!langId) {
    return { isConfigured: true, error: `Unsupported language: ${language}` };
  }

  // Use base64_encoded=true to avoid UTF-8 encoding issues with compiler output
  const endpoint = `${providerUrl.replace(/\/+$/, "")}/submissions?wait=true&base64_encoded=true`;
  const headers = { "Content-Type": "application/json" };
  if (apiKey) {
    headers["X-RapidAPI-Key"] = apiKey;
  }

  // Encode source code as base64 to match the base64_encoded=true expectation
  const encodedSource = Buffer.from(sourceCode, "utf8").toString("base64");

  const body = JSON.stringify({
    source_code: encodedSource,
    language_id: langId,
    cpu_time_limit: 5,
  });

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);
    const response = await fetch(endpoint, { method: "POST", headers, body, signal: controller.signal });
    clearTimeout(timeout);

    if (!response.ok) {
      return { isConfigured: true, error: `Judge0 HTTP Error ${response.status}` };
    }

    const data = await response.json();
    const statusId = data.status ? data.status.id : 3;
    const statusDesc = data.status ? data.status.description : "Unknown";

    // Decode base64 fields
    const stdout = decodeBase64(data.stdout);
    const stderr = decodeBase64(data.stderr);
    const compileOutput = decodeBase64(data.compile_output);

    // Status codes: 1=Queue, 2=Processing, 3=Accepted, 4=Wrong Answer,
    //               5=Time Limit Exceeded, 6=Compilation Error, 7+=Runtime Error variants
    if (statusId === 5) {
      return { isConfigured: true, status: "TIME_LIMIT_EXCEEDED", errorTitle: "TIME LIMIT EXCEEDED", message: "TIME LIMIT EXCEEDED" };
    }
    if (statusId === 6) {
      return {
        isConfigured: true,
        status: "COMPILATION_ERROR",
        compileOutput: sanitizeError(compileOutput || stderr),
      };
    }
    if (statusId >= 7) {
      return {
        isConfigured: true,
        status: "RUNTIME_ERROR",
        stderr: sanitizeError(stderr || stdout),
      };
    }

    // Status 3 = Accepted (ran successfully), 4 = Wrong Answer (also ran, just output differs)
    // Both cases: check our own test markers in stdout
    return {
      isConfigured: true,
      status: "SUCCESS",
      stdout: stdout,
      stderr: sanitizeError(stderr),
    };
  } catch (err) {
    if (err.name === "AbortError") {
      return {
        isConfigured: true,
        status: "TIME_LIMIT_EXCEEDED",
        errorTitle: "TIME LIMIT EXCEEDED",
        message: "TIME LIMIT EXCEEDED",
      };
    }
    return { isConfigured: true, error: `Judge0 connection error: ${err.message}` };
  }
}

function sanitizeError(errText) {
  if (!errText) return "";
  return errText
    .replace(/\/tmp\/[a-zA-Z0-9_\-\/]+/g, "<file>")
    .replace(/[A-Z]:\\[^\n:]+/g, "<file>")
    .slice(0, 2000);
}
