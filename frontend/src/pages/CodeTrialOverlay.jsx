import { useState, useEffect, useRef, useMemo } from "react";
import { getChallengeById } from "../challenges";
import { gameEvents } from "../game/events/gameEvents";

export default function CodeTrialOverlay({ challengeId = "binary-search", onClose }) {
  const challenge = useMemo(() => getChallengeById(challengeId), [challengeId]);

  const [selectedLanguage, setSelectedLanguage] = useState("cpp");
  const [drafts, setDrafts] = useState(() => ({ ...challenge.starterTemplates }));
  const [isRunning, setIsRunning] = useState(false);
  const [executionResult, setExecutionResult] = useState(null);

  const textareaRef = useRef(null);

  // Focus editor on mount / language switch
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [selectedLanguage]);

  // Handle global ESC key when not inside textarea
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        if (onClose) onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleCodeChange = (e) => {
    const value = e.target.value;
    setDrafts((prev) => ({
      ...prev,
      [selectedLanguage]: value,
    }));
  };

  const handleKeyDownTextarea = (e) => {
    e.stopPropagation();

    if (e.key === "Escape") {
      e.preventDefault();
      if (onClose) onClose();
      return;
    }

    if (e.key === "Tab") {
      e.preventDefault();
      const target = e.target;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const currentValue = target.value;
      const newValue = currentValue.substring(0, start) + "    " + currentValue.substring(end);

      setDrafts((prev) => ({
        ...prev,
        [selectedLanguage]: newValue,
      }));

      window.requestAnimationFrame(() => {
        target.selectionStart = start + 4;
        target.selectionEnd = start + 4;
      });
    }
  };

  const handleResetCode = () => {
    setDrafts((prev) => ({
      ...prev,
      [selectedLanguage]: challenge.starterTemplates[selectedLanguage],
    }));
    setExecutionResult(null);
  };

  const handleRunTests = async () => {
    if (isRunning) return;

    setIsRunning(true);
    setExecutionResult(null);

    try {
      const response = await fetch("/api/code/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          challengeId: challenge.id,
          language: selectedLanguage,
          sourceCode: drafts[selectedLanguage],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        setExecutionResult({
          isConfigured: true,
          status: "RUNTIME_ERROR",
          errorTitle: "API ERROR",
          errorMessage: errorData.error || `HTTP ${response.status}: ${response.statusText}`,
        });
        return;
      }

      const data = await response.json();
      setExecutionResult(data);

      if (data && data.allPassed) {
        gameEvents.emit("code-trial-passed", { challengeId: challenge.id });
      }
    } catch (err) {
      setExecutionResult({
        isConfigured: true,
        status: "RUNTIME_ERROR",
        errorTitle: "CONNECTION ERROR",
        errorMessage: `Failed to connect to execution endpoint: ${err.message}`,
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="code-trial-backdrop" role="dialog" aria-modal="true" aria-label="Code Trial Panel">
      <div className="code-trial-modal">
        {/* Header */}
        <header className="code-trial-header">
          <div className="code-trial-header__title-row">
            <span className="code-trial-header__badge">CODE TRIAL</span>
            <span className="code-trial-header__domain">{challenge.domain}</span>
          </div>
          <h2 className="code-trial-header__name">{challenge.title}</h2>
          <p className="code-trial-header__challenge">{challenge.challengeStatement}</p>
          <p className="code-trial-header__desc">{challenge.description}</p>
          <p className="code-trial-header__complexity">Expected Time Complexity: {challenge.timeComplexity}</p>
        </header>

        {/* Visible Test Cases List */}
        <section className="code-trial-tests">
          <h3 className="code-trial-tests__title">TEST CASES ({challenge.visibleTests.length})</h3>
          <div className="code-trial-tests__list">
            {challenge.visibleTests.map((t, idx) => (
              <div key={t.id} className="code-trial-test-card">
                <span className="code-trial-test-card__name">Test {idx + 1}: {t.name}</span>
                <div className="code-trial-test-card__details">
                  <span>Input: <code>{JSON.stringify(t.input)}</code></span>
                  <span>Expected: <code>{JSON.stringify(t.expected)}</code></span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Language Selection Tabs */}
        <div className="code-trial-tabs">
          {challenge.supportedLanguages.map((lang) => (
            <button
              key={lang.id}
              type="button"
              className={`code-trial-tab ${selectedLanguage === lang.id ? "code-trial-tab--active" : ""}`}
              onClick={() => {
                if (!isRunning) setSelectedLanguage(lang.id);
              }}
              disabled={isRunning}
            >
              [{lang.label}]
            </button>
          ))}
        </div>

        {/* Code Editor */}
        <div className="code-trial-editor-wrapper">
          <textarea
            ref={textareaRef}
            className="code-trial-editor"
            value={drafts[selectedLanguage]}
            onChange={handleCodeChange}
            onKeyDown={handleKeyDownTextarea}
            disabled={isRunning}
            spellCheck="false"
            autoCapitalize="off"
            autoCorrect="off"
          />
        </div>

        {/* Execution Results Feedback */}
        {executionResult && (
          <section className="code-trial-results">
            {!executionResult.isConfigured ? (
              <div className="code-trial-result-card code-trial-result-card--unconfigured">
                <p className="code-trial-result-card__title">⚠️ SERVICE NOT CONFIGURED</p>
                <p className="code-trial-result-card__msg">{executionResult.message || "Code execution service is not configured."}</p>
              </div>
            ) : executionResult.status === "COMPILATION_ERROR" || executionResult.status === "RUNTIME_ERROR" || executionResult.status === "TIME_LIMIT_EXCEEDED" ? (
              <div className="code-trial-result-card code-trial-result-card--error">
                <p className="code-trial-result-card__title">❌ {executionResult.errorTitle || executionResult.status}</p>
                <pre className="code-trial-result-card__pre">{executionResult.errorMessage}</pre>
              </div>
            ) : (
              <div className="code-trial-results-list">
                {executionResult.allPassed && (
                  <div className="code-trial-success-banner">
                    <h4>ALL TESTS PASSED</h4>
                    <p>&quot;The path has been forged.&quot;</p>
                  </div>
                )}

                <h4 className="code-trial-results__sub">TEST RESULTS</h4>

                {/* Visible Results */}
                {executionResult.visibleResults && executionResult.visibleResults.map((r, i) => (
                  <div key={r.id || i} className={`code-trial-res-item ${r.passed ? "code-trial-res-item--pass" : "code-trial-res-item--fail"}`}>
                    <span>{r.passed ? "✓" : "✗"} Test {i + 1}: {r.name}</span>
                    <div className="code-trial-res-item__details">
                      <span>Expected: <code>{JSON.stringify(r.expected)}</code></span>
                      <span>Received: <code>{JSON.stringify(r.received)}</code></span>
                    </div>
                  </div>
                ))}

                {/* Hidden Results */}
                {executionResult.hiddenResults && executionResult.hiddenResults.map((r, i) => (
                  <div key={r.id || i} className={`code-trial-res-item ${r.passed ? "code-trial-res-item--pass" : "code-trial-res-item--fail"}`}>
                    <span>{r.passed ? "✓" : "✗"} Hidden Test {i + 1}</span>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Actions Footer */}
        <footer className="code-trial-actions">
          <button
            type="button"
            className="code-trial-btn code-trial-btn--run"
            onClick={handleRunTests}
            disabled={isRunning}
          >
            {isRunning ? "RUNNING TRIAL..." : "[RUN TESTS]"}
          </button>
          <button
            type="button"
            className="code-trial-btn code-trial-btn--reset"
            onClick={handleResetCode}
            disabled={isRunning}
          >
            [RESET CODE]
          </button>
          <button
            type="button"
            className="code-trial-btn code-trial-btn--close"
            onClick={onClose}
            disabled={isRunning}
          >
            [CLOSE]
          </button>
        </footer>
      </div>
    </div>
  );
}
