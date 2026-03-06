// @ts-nocheck
/* eslint-disable */
"use client"

import Image from "next/image"
import Link from "next/link"
import Script from "next/script"

export default function HomePage() {
  return (
    <>
      <Script src="/page-scripts.js" strategy="afterInteractive" />
      <div className="app">
      <div className="header">
          <div className="logo">
              <div className="logo-icon">🌐</div>
              <div><div className="logo-text">VEX Translate Studio <span className="logo-badge">v2</span></div><div className="logo-sub">AI-Powered App Translation</div></div>
          </div>
          <button className="btn-ghost" id="startOverBtn" style={{display:"none"}} onClick={() => { startOver() }}>← Start Over</button>
      </div>
      <div className="stepper" id="stepper"></div>
      
      {/* STEP 1 */}
      <div className="section active" id="step1">
          <h2>What are you translating?</h2>
          <p className="subtitle">Choose your input type, then paste or upload.</p>
          <div className="api-row">
              <div className="api-label">🔑 Claude API Key <span className="api-saved" id="apiSaved" style={{display:"none"}}>✓ Saved</span></div>
              <input type="password" id="apiKey" placeholder="sk-ant-api..." oninput="saveApiKey()" />
          </div>
      
          {/* MODE SELECTOR */}
          <div className="mode-selector">
              <button className="mode-btn active" id="modeStrings" onClick={() => { pickMode('strings') }}>
                  <div className="mode-icon">{ }</div>
                  <div className="mode-title">App Strings</div>
                  <div className="mode-desc">JSON, text, or key=value pairs</div>
              </button>
              <button className="mode-btn html-mode" id="modeHtml" onClick={() => { pickMode('html') }}>
                  <div className="mode-icon">📄</div>
                  <div className="mode-title">Full HTML File</div>
                  <div className="mode-desc">AI extracts & injects translations</div>
              </button>
          </div>
      
          {/* STRINGS MODE */}
          <div id="stringsPanel">
              <div className="format-row">
                  <button className="format-btn active" data-fmt="json" onClick={() => { pickFormat('json',this) }}><span className="format-tag">{ }</span> JSON</button>
                  <button className="format-btn" data-fmt="text" onClick={() => { pickFormat('text',this) }}><span className="format-tag">Aa</span> Text</button>
                  <button className="format-btn" data-fmt="csv" onClick={() => { pickFormat('csv',this) }}><span className="format-tag">📋</span> Key=Value</button>
              </div>
              <input type="file" id="fileInput" accept=".json,.txt,.csv,.properties" style={{display:"none"}} onChange={(e) => { handleFile(event) }} />
              <button className="upload-btn" onClick={() => { document.getElementById('fileInput').click() }}>📁 Upload File</button>
              <textarea className="input-area" id="inputArea" placeholder="Paste your strings here..."></textarea>
              <div className="input-meta">
                  <button className="meta-link" onClick={() => { loadSample() }}>Load sample data →</button>
                  <span className="meta-count" id="lineCount">0 lines</span>
              </div>
          </div>
      
          {/* HTML MODE */}
          <div id="htmlPanel" style={{display:"none"}}>
              <input type="file" id="htmlFileInput" accept=".html,.htm" style={{display:"none"}} onChange={(e) => { handleHtmlFile(event) }} />
              <button className="upload-btn html-upload" onClick={() => { document.getElementById('htmlFileInput').click() }}>📄 Upload HTML File</button>
              <textarea className="input-area html-mode" id="htmlArea" placeholder="Or paste your full HTML here..."></textarea>
              <div className="input-meta">
                  <span className="meta-count" id="htmlSize">0 chars</span>
              </div>
          </div>
      
          <div className="error-msg" id="error1" style={{display:"none"}}></div>
          <button className="btn-primary" id="parseBtn" disabled onClick={() => { parseAndNext() }}>Parse & Continue →</button>
          <button className="btn-primary gold" id="extractBtn" style={{display:"none"}} disabled onClick={() => { extractAndNext() }}>🤖 Extract Strings from HTML →</button>
      </div>
      
      {/* STEP 2 */}
      <div className="section" id="step2">
          <h2>Select languages</h2>
          <p className="subtitle" id="stringsDetected">0 strings detected</p>
      
          {/* Extraction preview for HTML mode */}
          <div className="extract-box" id="extractBox" style={{display:"none"}}>
              <div className="extract-title">🔍 Extracted strings from your HTML</div>
              <div className="extract-list" id="extractList"></div>
          </div>
      
          <input className="lang-search" type="text" placeholder="Search languages..." oninput="filterLangs(this.value)" style={{marginTop:"14px"}} />
          <div className="quick-btns">
              <button className="quick-btn accent" onClick={() => { selectAllLangs() }}>Select All</button>
              <button className="quick-btn" onClick={() => { clearAllLangs() }}>Clear All</button>
              <button className="quick-btn" onClick={() => { selectPreset(['es','fr','de','pt','it']) }}>Europe (5)</button>
              <button className="quick-btn" onClick={() => { selectPreset(['zh','ja','ko','hi','th','vi']) }}>Asia (6)</button>
          </div>
          <div className="lang-grid" id="langGrid"></div>
          <button className="btn-primary" id="langBtn" disabled onClick={() => { goToStep(3) }}>0 selected · Continue →</button>
      </div>
      
      {/* STEP 3 */}
      <div className="section" id="step3">
          <h2>Set the tone</h2>
          <p className="subtitle">What kind of app is this? AI adjusts vocabulary and style.</p>
          <div className="context-list" id="contextList"></div>
          <textarea className="custom-input" id="customContext" style={{display:"none"}} placeholder="Describe your app's tone and audience..."></textarea>
          <div className="summary-box"><div className="summary-label">Summary</div><div className="summary-line" id="summaryLine"></div></div>
          <button className="btn-primary" id="translateBtn" onClick={() => { startTranslation() }}>🚀 Translate Now</button>
      </div>
      
      {/* STEP 4 */}
      <div className="section" id="step4">
          <h2 id="resultTitle">Translating...</h2>
          <div className="progress-wrap" id="progressWrap"><div className="progress-info" id="progressInfo">Starting...</div><div className="progress-bar"><div className="progress-fill" id="progressFill" style={{width:"0%"}}></div></div></div>
          <div id="resultsList"></div>
          <div className="results-actions" id="resultsActions" style={{display:"none"}}>
              <button className="btn-download-all" onClick={() => { downloadAll() }}>↓ Download All Files</button>
              <button className="btn-ghost" onClick={() => { startOver() }} style={{padding:"15px 20px",fontSize:"14px",fontWeight:700}}>New</button>
          </div>
          <div className="preview-section" id="previewSection" style={{display:"none"}}>
              <div className="preview-title">Preview</div>
              <div className="preview-table" id="previewTable"></div>
          </div>
      </div>
      </div>
      
      {/* TOAST */}
      <div className="toast" id="toast">
          <div className="vm"><div className="vm-vl"></div><div className="vm-vr"></div><div className="vm-head"></div><div className="vm-eyes"><div className="vm-eye"></div><div className="vm-eye"></div></div><div className="vm-mouth"></div><div className="vm-al"></div><div className="vm-ar"></div></div>
          <span id="toastMsg"></span>
      </div>
    </>
  )
}