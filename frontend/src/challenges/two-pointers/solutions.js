/**
 * INTERNAL REFERENCE SOLUTIONS — Two Pointers (Resonance Pair)
 * Quest 1: Plains of Origins
 *
 * These solutions are NEVER sent to the code editor.
 * They exist for:
 *   - Developer verification
 *   - Test correctness checks
 *   - Backend smoke testing
 *
 * DO NOT import from this file in the frontend or challenge registry.
 */

export const TWO_POINTERS_SOLUTIONS = {
  javascript: `function findResonancePair(frequencies, target) {
    let left = 0;
    let right = frequencies.length - 1;

    while (left < right) {
        const sum = frequencies[left] + frequencies[right];

        if (sum === target) {
            return [frequencies[left], frequencies[right]];
        }

        if (sum < target) {
            left++;
        } else {
            right--;
        }
    }

    return [];
}`,

  python: `def findResonancePair(frequencies, target):
    left = 0
    right = len(frequencies) - 1

    while left < right:
        current_sum = frequencies[left] + frequencies[right]

        if current_sum == target:
            return [frequencies[left], frequencies[right]]
        elif current_sum < target:
            left += 1
        else:
            right -= 1

    return []`,

  cpp: `vector<int> findResonancePair(const vector<int>& frequencies, int target) {
    int left = 0;
    int right = frequencies.size() - 1;

    while (left < right) {
        const int sum = frequencies[left] + frequencies[right];

        if (sum == target) {
            return { frequencies[left], frequencies[right] };
        }

        if (sum < target) {
            left++;
        } else {
            right--;
        }
    }

    return {};
}`,

  java: `static int[] findResonancePair(int[] frequencies, int target) {
    int left = 0;
    int right = frequencies.length - 1;

    while (left < right) {
        int sum = frequencies[left] + frequencies[right];

        if (sum == target) {
            return new int[]{ frequencies[left], frequencies[right] };
        }

        if (sum < target) {
            left++;
        } else {
            right--;
        }
    }

    return new int[]{};
}`,
};
