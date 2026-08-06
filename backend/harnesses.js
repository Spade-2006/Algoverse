/**
 * Constructs language-specific test harnesses around player function implementations.
 * Supports both free functions (e.g. `search(arr, target)`, `findResonancePair(frequencies, target)`)
 * and LeetCode-style `Solution` classes.
 */

export function buildHarness(language, playerCode, allTests, challengeId) {
  const isTwoPointers = challengeId === "two-pointers";
  switch (language) {
    case "cpp":
      return isTwoPointers ? buildCppTwoPointersHarness(playerCode, allTests) : buildCppHarness(playerCode, allTests);
    case "java":
      return isTwoPointers ? buildJavaTwoPointersHarness(playerCode, allTests) : buildJavaHarness(playerCode, allTests);
    case "python":
      return isTwoPointers ? buildPythonTwoPointersHarness(playerCode, allTests) : buildPythonHarness(playerCode, allTests);
    case "javascript":
      return isTwoPointers ? buildJsTwoPointersHarness(playerCode, allTests) : buildJsHarness(playerCode, allTests);
    default:
      throw new Error(`Unsupported language for harness construction: ${language}`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// BINARY SEARCH HARNESSES (search)
// ─────────────────────────────────────────────────────────────────────────────

function buildCppHarness(playerCode, tests) {
  let testCode = "";
  tests.forEach((t, i) => {
    const arrVals = t.input.arr.join(", ");
    testCode += `    {\n`;
    testCode += `        std::vector<int> arr = { ${arrVals} };\n`;
    testCode += `        int target = ${t.input.target};\n`;
    testCode += `        try {\n`;
    testCode += `            int res = search(arr, target);\n`;
    testCode += `            std::cout << "[ALGOVERSE_TEST_RESULT:${i}] " << res << "\\n";\n`;
    testCode += `        } catch (...) {\n`;
    testCode += `            std::cout << "[ALGOVERSE_TEST_RESULT:${i}] EXCEPTION\\n";\n`;
    testCode += `        }\n`;
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
    testCode += `            int res = runSearch(arr, target);\n`;
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

    private static int runSearch(int[] arr, int target) throws Exception {
        try {
            java.lang.reflect.Method m = Main.class.getDeclaredMethod("search", int[].class, int.class);
            m.setAccessible(true);
            return (int) m.invoke(null, arr, target);
        } catch (NoSuchMethodException e) {
            Class<?> solClass = Class.forName("Solution");
            Object sol = solClass.getDeclaredConstructor().newInstance();
            java.lang.reflect.Method m = solClass.getDeclaredMethod("search", int[].class, int.class);
            m.setAccessible(true);
            return (int) m.invoke(sol, arr, target);
        }
    }

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
            if "search" in globals():
                res = search(arr, target)
            elif "Solution" in globals():
                res = Solution().search(arr, target)
            else:
                res = -1
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
      let res;
      if (typeof search === "function") {
        res = search(test.input.arr, test.input.target);
      } else if (typeof Solution === "function") {
        const sol = new Solution();
        res = sol.search(test.input.arr, test.input.target);
      } else {
        res = -1;
      }
      console.log(\`[ALGOVERSE_TEST_RESULT:\${i}] \${res}\`);
    } catch (err) {
      console.log(\`[ALGOVERSE_TEST_RESULT:\${i}] EXCEPTION: \${err.message}\`);
    }
  });
}

_runHarness();
`;
}

// ─────────────────────────────────────────────────────────────────────────────
// TWO POINTERS HARNESSES (findResonancePair)
// ─────────────────────────────────────────────────────────────────────────────

function buildCppTwoPointersHarness(playerCode, tests) {
  let testCode = "";
  tests.forEach((t, i) => {
    const freqsVals = t.input.frequencies.join(", ");
    testCode += `    {\n`;
    testCode += `        std::vector<int> freqs = { ${freqsVals} };\n`;
    testCode += `        int target = ${t.input.target};\n`;
    testCode += `        try {\n`;
    testCode += `            std::vector<int> res = findResonancePair(freqs, target);\n`;
    testCode += `            std::cout << "[ALGOVERSE_TEST_RESULT:${i}] " << toJson(res) << "\\n";\n`;
    testCode += `        } catch (...) {\n`;
    testCode += `            std::cout << "[ALGOVERSE_TEST_RESULT:${i}] EXCEPTION\\n";\n`;
    testCode += `        }\n`;
    testCode += `    }\n`;
  });

  return `#include <iostream>
#include <vector>
#include <string>

using namespace std;

// --- PLAYER CODE START ---
${playerCode}
// --- PLAYER CODE END ---

string toJson(const vector<int>& v) {
    string s = "[";
    for (size_t i = 0; i < v.size(); ++i) {
        s += to_string(v[i]);
        if (i + 1 < v.size()) s += ", ";
    }
    s += "]";
    return s;
}

int main() {
${testCode}
    return 0;
}
`;
}

function buildJavaTwoPointersHarness(playerCode, tests) {
  let testCode = "";
  tests.forEach((t, i) => {
    const freqsVals = t.input.frequencies.join(", ");
    testCode += `        {\n`;
    testCode += `            int[] freqs = new int[]{ ${freqsVals} };\n`;
    testCode += `            int target = ${t.input.target};\n`;
    testCode += `            try {\n`;
    testCode += `                int[] res = findResonancePair(freqs, target);\n`;
    testCode += `                System.out.println("[ALGOVERSE_TEST_RESULT:${i}] " + toJson(res));\n`;
    testCode += `            } catch (Exception e) {\n`;
    testCode += `                System.out.println("[ALGOVERSE_TEST_RESULT:${i}] EXCEPTION");\n`;
    testCode += `            }\n`;
    testCode += `        }\n`;
  });

  return `import java.util.*;

public class Main {
    // --- PLAYER CODE START ---
    ${playerCode}
    // --- PLAYER CODE END ---

    static String toJson(int[] arr) {
        if (arr == null || arr.length == 0) return "[]";
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < arr.length; i++) {
            sb.append(arr[i]);
            if (i + 1 < arr.length) sb.append(", ");
        }
        sb.append("]");
        return sb.toString();
    }

    public static void main(String[] args) {
${testCode}
    }
}
`;
}

function buildPythonTwoPointersHarness(playerCode, tests) {
  const jsonTests = JSON.stringify(tests);
  return `# --- PLAYER CODE START ---
${playerCode}
# --- PLAYER CODE END ---

import json

def _run_harness():
    tests = json.loads('''${jsonTests}''')
    for i, test in enumerate(tests):
        try:
            freqs = test["input"]["frequencies"]
            target = test["input"]["target"]
            if "findResonancePair" in globals():
                res = findResonancePair(freqs, target)
            elif "Solution" in globals():
                res = Solution().findResonancePair(freqs, target)
            else:
                res = []
            print(f"[ALGOVERSE_TEST_RESULT:{i}] {json.dumps(res)}")
        except Exception as e:
            print(f"[ALGOVERSE_TEST_RESULT:{i}] EXCEPTION: {e}")

if __name__ == "__main__":
    _run_harness()
`;
}

function buildJsTwoPointersHarness(playerCode, tests) {
  const jsonTests = JSON.stringify(tests);
  return `// --- PLAYER CODE START ---
${playerCode}
// --- PLAYER CODE END ---

function _runHarness() {
  const tests = ${jsonTests};
  tests.forEach((test, i) => {
    try {
      let res;
      if (typeof findResonancePair === "function") {
        res = findResonancePair(test.input.frequencies, test.input.target);
      } else if (typeof Solution === "function" && new Solution().findResonancePair) {
        const sol = new Solution();
        res = sol.findResonancePair(test.input.frequencies, test.input.target);
      } else {
        res = [];
      }
      console.log(\`[ALGOVERSE_TEST_RESULT:\${i}] \${JSON.stringify(res)}\`);
    } catch (err) {
      console.log(\`[ALGOVERSE_TEST_RESULT:\${i}] EXCEPTION: \${err.message}\`);
    }
  });
}

_runHarness();
`;
}
