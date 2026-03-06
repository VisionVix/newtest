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
      <div className="calculator">
              <div className="display">
                  <div className="display-text" id="display">0</div>
              </div>
              <div className="buttons">
                  <button className="clear" onClick={() => { clearDisplay() }}>C</button>
                  <button className="clear" onClick={() => { deleteLast() }}>⌫</button>
                  <button className="operator" onClick={() => { appendToDisplay('/') }}>/</button>
                  <button className="operator" onClick={() => { appendToDisplay('*') }}>×</button>
                  
                  <button className="number" onClick={() => { appendToDisplay('7') }}>7</button>
                  <button className="number" onClick={() => { appendToDisplay('8') }}>8</button>
                  <button className="number" onClick={() => { appendToDisplay('9') }}>9</button>
                  <button className="operator" onClick={() => { appendToDisplay('-') }}>-</button>
                  
                  <button className="number" onClick={() => { appendToDisplay('4') }}>4</button>
                  <button className="number" onClick={() => { appendToDisplay('5') }}>5</button>
                  <button className="number" onClick={() => { appendToDisplay('6') }}>6</button>
                  <button className="operator" onClick={() => { appendToDisplay('+') }}>+</button>
                  
                  <button className="number" onClick={() => { appendToDisplay('1') }}>1</button>
                  <button className="number" onClick={() => { appendToDisplay('2') }}>2</button>
                  <button className="number" onClick={() => { appendToDisplay('3') }}>3</button>
                  <button className="equals" onClick={() => { calculate() }} rowSpan="2">=</button>
                  
                  <button className="number zero" onClick={() => { appendToDisplay('0') }}>0</button>
                  <button className="decimal" onClick={() => { appendToDisplay('.') }}>.</button>
              </div>
          </div>
    </>
  )
}