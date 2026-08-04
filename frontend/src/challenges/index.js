import binarySearchMeta from "./binary-search/challenge.json";
import binarySearchTests from "./binary-search/tests/tests.json";

const CHALLENGE_REGISTRY = {
  "binary-search": {
    meta: binarySearchMeta,
    tests: binarySearchTests,
    starters: {
      cpp: `int search(const vector<int>& arr, int target) {\n    // Write your solution\n}`,
      java: `static int search(int[] arr, int target) {\n    // Write your solution\n}`,
      python: `def search(arr, target):\n    # Write your solution\n    pass`,
      javascript: `function search(arr, target) {\n    // Write your solution\n}`,
    },
  },
};

/**
 * Load data-driven challenge definition by ID.
 * Returns metadata, visible test cases, and starter code templates.
 * DOES NOT EXPOSE hidden test cases or reference solutions.
 */
export function getChallengeById(challengeId = "binary-search") {
  const normalizedId = challengeId ? challengeId.replace(/-01$/, "") : "binary-search";
  const challenge = CHALLENGE_REGISTRY[normalizedId] || CHALLENGE_REGISTRY["binary-search"];

  return {
    id: challenge.meta.id,
    title: challenge.meta.title,
    domain: challenge.meta.domain,
    challengeStatement: '"Recreate the method you discovered."',
    description: challenge.meta.description,
    functionName: challenge.meta.functionName,
    timeComplexity: challenge.meta.timeComplexity,
    spaceComplexity: challenge.meta.spaceComplexity,
    notes: challenge.meta.notes,
    // EXPOSE ONLY VISIBLE TESTS (hidden tests are omitted for security)
    visibleTests: challenge.tests.visible.map((t) => ({
      id: t.id,
      name: t.name,
      input: t.input,
      expected: t.expected,
    })),
    starterTemplates: { ...challenge.starters },
    supportedLanguages: [
      { id: "cpp", label: "C++" },
      { id: "java", label: "Java" },
      { id: "python", label: "Python" },
      { id: "javascript", label: "JavaScript" },
    ],
  };
}
