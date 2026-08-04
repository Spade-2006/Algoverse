/**
 * @typedef {Object} InputSignatureParam
 * @property {string} name
 * @property {string} type
 */

/**
 * @typedef {Object} ChallengeMetadata
 * @property {string} id
 * @property {string} title
 * @property {string} domain
 * @property {string} functionName
 * @property {string} timeComplexity
 * @property {string} spaceComplexity
 * @property {string} description
 * @property {InputSignatureParam[]} inputSignature
 * @property {{ type: string }} outputSignature
 * @property {string} [notes]
 */

/**
 * @typedef {Object} TestCase
 * @property {string} id
 * @property {string} name
 * @property {Record<string, unknown>} input
 * @property {unknown} expected
 */

/**
 * @typedef {Object} ChallengeTestSuite
 * @property {string} _security_architecture_note
 * @property {TestCase[]} visible
 * @property {TestCase[]} hidden
 */

export {};
