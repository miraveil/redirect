"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type Scenario = {
  id: string;
  name: string;
  description: string;
  path: string;
  expected: "PASS" | "FAIL";
  detail: string;
};

const scenarios: Scenario[] = [
  {
    id: "direct",
    name: "No redirect",
    description: "The first response is 200 and the verification script is in <head>.",
    path: "/result/valid",
    expected: "PASS",
    detail: "Baseline",
  },
  {
    id: "single",
    name: "Single redirect",
    description: "302 → final page with the verification script.",
    path: "/redirect/1?status=302&target=valid",
    expected: "PASS",
    detail: "1 hop · 302",
  },
  {
    id: "multiple",
    name: "Multiple redirects",
    description: "Three sequential redirects before the valid final page.",
    path: "/redirect/3?status=302&target=valid",
    expected: "PASS",
    detail: "3 hops · 302",
  },
  {
    id: "permanent",
    name: "Permanent redirect",
    description: "301 redirect to a valid final page.",
    path: "/redirect/1?status=301&target=valid",
    expected: "PASS",
    detail: "1 hop · 301",
  },
  {
    id: "temporary-preserve",
    name: "307 redirect",
    description: "Temporary redirect that preserves the request method.",
    path: "/redirect/2?status=307&target=valid",
    expected: "PASS",
    detail: "2 hops · 307",
  },
  {
    id: "slow",
    name: "Delayed redirect",
    description: "Each redirect response waits 1.5 seconds before continuing.",
    path: "/redirect/2?status=302&delay=1500&target=valid",
    expected: "PASS",
    detail: "2 hops · 3s total",
  },
  {
    id: "missing-script",
    name: "Script missing at destination",
    description: "Redirect succeeds, but the final page has no provider script.",
    path: "/redirect/2?status=302&target=missing",
    expected: "FAIL",
    detail: "2 hops · no script",
  },
  {
    id: "body-script",
    name: "Script outside head",
    description: "The provider script exists in <body>, not in <head>.",
    path: "/redirect/1?status=302&target=body",
    expected: "FAIL",
    detail: "Wrong placement",
  },
  {
    id: "wrong-site",
    name: "Wrong Site ID",
    description: "The final page contains the provider script with a different Site ID.",
    path: "/redirect/1?status=302&target=wrong",
    expected: "FAIL",
    detail: "Invalid identity",
  },
  {
    id: "loop",
    name: "Redirect loop",
    description: "Two URLs redirect to each other indefinitely.",
    path: "/loop?step=a",
    expected: "FAIL",
    detail: "A ↔ B",
  },
  {
    id: "many",
    name: "Many redirects",
    description: "Twelve redirects to test the job's maximum-hop protection.",
    path: "/redirect/12?status=302&target=valid",
    expected: "FAIL",
    detail: "12 hops",
  },
  {
    id: "broken",
    name: "Broken destination",
    description: "Redirect ends at an HTTP 500 response.",
    path: "/redirect/2?status=302&target=error",
    expected: "FAIL",
    detail: "Final status 500",
  },
];

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  }

  return (
    <button className="copy-button" onClick={copy} aria-label={`Copy ${value}`}>
      {copied ? "Copied" : "Copy URL"}
    </button>
  );
}

export default function Home() {
  const [hops, setHops] = useState(3);
  const [status, setStatus] = useState(302);
  const [delay, setDelay] = useState(0);
  const [target, setTarget] = useState("valid");
  const [filter, setFilter] = useState<"ALL" | "PASS" | "FAIL">("ALL");

  const customPath =
    hops === 0
      ? `/result/${target}`
      : `/redirect/${hops}?status=${status}&delay=${delay}&target=${target}`;
  const filtered = useMemo(
    () => scenarios.filter((scenario) => filter === "ALL" || scenario.expected === filter),
    [filter],
  );

  return (
    <main>
      <header className="topbar">
        <Link className="brand" href="/lab">
          <span className="brand-mark">R</span>
          <span>Redirect Verification Lab</span>
        </Link>
        <div className="status-pill">
          <span className="status-dot" />
          Test server ready
        </div>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">SITE OWNERSHIP QA TOOL</p>
          <h1>Test whether your verification job survives redirects.</h1>
          <p className="hero-text">
            Use the URLs below as website addresses in your provider system. Every route has a
            known redirect chain and a predictable verification result.
          </p>
          <div className="script-block">
            <div>
              <span>Expected script in final page head</span>
              <code>{`<script async src="https://cdn.coad.be3pi.com/js/cox-site.js" co-pub="PUB02E2503AE" co-st="SIT0C0EB3F27" crossorigin="anonymous">`}</code>
            </div>
            <span className="tag">SITE ID · SIT0C0EB3F27</span>
          </div>
        </div>
        <div className="flow-card">
          <p className="flow-label">EXPECTED JOB FLOW</p>
          <ol>
            <li><span>1</span><div><strong>Request site URL</strong><small>Receive 3xx response</small></div></li>
            <li><span>2</span><div><strong>Follow Location</strong><small>Repeat within limits</small></div></li>
            <li><span>3</span><div><strong>Inspect final HTML</strong><small>Find script inside &lt;head&gt;</small></div></li>
          </ol>
        </div>
      </section>

      <section className="workspace">
        <div className="section-heading">
          <div>
            <p className="eyebrow">CONFIGURABLE ENDPOINT</p>
            <h2>Build a redirect chain</h2>
          </div>
          <p>Change the controls, then copy the generated URL into your simulator.</p>
        </div>

        <div className="builder">
          <label>
            Redirect hops
            <input type="number" min="0" max="50" value={hops} onChange={(event) => setHops(Number(event.target.value))} />
          </label>
          <label>
            HTTP status
            <select value={status} onChange={(event) => setStatus(Number(event.target.value))}>
              {[301, 302, 303, 307, 308].map((code) => <option key={code}>{code}</option>)}
            </select>
          </label>
          <label>
            Delay per hop (ms)
            <input type="number" min="0" max="5000" step="100" value={delay} onChange={(event) => setDelay(Number(event.target.value))} />
          </label>
          <label>
            Final page
            <select value={target} onChange={(event) => setTarget(event.target.value)}>
              <option value="valid">Valid script</option>
              <option value="missing">Missing script</option>
              <option value="body">Script in body</option>
              <option value="wrong">Wrong Site ID</option>
              <option value="error">HTTP 500</option>
            </select>
          </label>
          <div className="generated-url">
            <code>{customPath}</code>
            <a href={customPath} target="_blank" rel="noreferrer">Open</a>
            <CopyButton value={customPath} />
          </div>
        </div>
      </section>

      <section className="workspace scenarios">
        <div className="section-heading">
          <div>
            <p className="eyebrow">READY-MADE TESTS</p>
            <h2>Redirect scenarios</h2>
          </div>
          <div className="filters" aria-label="Filter scenarios">
            {(["ALL", "PASS", "FAIL"] as const).map((value) => (
              <button key={value} className={filter === value ? "active" : ""} onClick={() => setFilter(value)}>
                {value === "ALL" ? "All cases" : `Expected ${value}`}
              </button>
            ))}
          </div>
        </div>

        <div className="scenario-grid">
          {filtered.map((scenario) => (
            <article className="scenario-card" key={scenario.id}>
              <div className="card-top">
                <span className={`expect ${scenario.expected.toLowerCase()}`}>Expected {scenario.expected}</span>
                <span className="detail">{scenario.detail}</span>
              </div>
              <h3>{scenario.name}</h3>
              <p>{scenario.description}</p>
              <code className="path">{scenario.path}</code>
              <div className="card-actions">
                <a href={scenario.path} target="_blank" rel="noreferrer">Open endpoint ↗</a>
                <CopyButton value={scenario.path} />
              </div>
            </article>
          ))}
        </div>
      </section>

      <footer>
        <p>Built for deterministic site-owner verification testing.</p>
        <p>Valid destination: <Link href="/result/valid">/result/valid</Link></p>
      </footer>
    </main>
  );
}
