/**
 * Constructs language-specific test harnesses around player function implementations.
 */

export function buildHarness(language, playerCode, allTests) {
  switch (language) {
    case "cpp":
      return buildCppHarness(playerCode, allTests);
    case "java":
      return buildJavaHarness(playerCode, allTests);
    case "python":
      return buildPythonHarness(playerCode, allTests);
    case "javascript":
      return buildJsHarness(playerCode, allTests);
    default:
      throw new Error(`Unsupported language for harness construction: ${language}`);
  }
}

function buildCppHarness(playerCode, tests) {
  let testCode = "";
  tests.forEach((t, i) => {
    const arrVals = t.input.arr.join(", ");
    testCode += `    try {\n`;
    testCode += `        std::vector<int> arr = { ${arrVals} };\n`;
    testCode += `        int target = ${t.input.target};\n`;
    testCode += `        int res = search(arr, target);\n`;
    testCode += `        std::cout << "[ALGOVERSE_TEST_RESULT:${i}] " << res << "\\n";\n`;
    testCode += `    } catch (...) {\n`;
    testCode += `        std::cout << "[ALGOVERSE_TEST_RESULT:${i}] EXCEPTION\\n";\n`;
    testCode += `    }\n`;
  });

  return `#include <iostream>
#include <vector>
#include <string>

using namespace std;

// --- PLAYER CODE START ---
${playerCode}
// --- PLAYER CODE END ---

int main() {
${testCode}
    return 0;
}
`;
}

function buildJavaHarness(playerCode, tests) {
  let testCode = "";
  tests.forEach((t, i) => {
    const arrVals = t.input.arr.join(", ");
    testCode += `        try {\n`;
    testCode += `            int[] arr = new int[]{ ${arrVals} };\n`;
    testCode += `            int target = ${t.input.target};\n`;
    testCode += `            int res = search(arr, target);\n`;
    testCode += `            System.out.println("[ALGOVERSE_TEST_RESULT:${i}] " + res);\n`;
    testCode += `        } catch (Exception e) {\n`;
    testCode += `            System.out.println("[ALGOVERSE_TEST_RESULT:${i}] EXCEPTION");\n`;
    testCode += `        }\n`;
  });

  return `import java.util.*;

public class Main {
    // --- PLAYER CODE START ---
    ${playerCode}
    // --- PLAYER CODE END ---

    public static void main(String[] args) {
${testCode}
    }
}
`;
}

function buildPythonHarness(playerCode, tests) {
  const jsonTests = JSON.stringify(tests);
  return `# --- PLAYER CODE START ---
${playerCode}
# --- PLAYER CODE END ---

import json

def _run_harness():
    tests = json.loads('''${jsonTests}''')
    for i, test in enumerate(tests):
        try:
            arr = test["input"]["arr"]
            target = test["input"]["target"]
            res = search(arr, target)
            print(f"[ALGOVERSE_TEST_RESULT:{i}] {res}")
        except Exception as e:
            print(f"[ALGOVERSE_TEST_RESULT:{i}] EXCEPTION: {e}")

if __name__ == "__main__":
    _run_harness()
`;
}

function buildJsHarness(playerCode, tests) {
  const jsonTests = JSON.stringify(tests);
  return `// --- PLAYER CODE START ---
${playerCode}
// --- PLAYER CODE END ---

function _runHarness() {
  const tests = ${jsonTests};
  tests.forEach((test, i) => {
    try {
      const res = search(test.input.arr, test.input.target);
      console.log(\`[ALGOVERSE_TEST_RESULT:\${i}] \${res}\`);
    } catch (err) {
      console.log(\`[ALGOVERSE_TEST_RESULT:\${i}] EXCEPTION: \${err.message}\`);
    }
  });
}

_runHarness();
`;
}
