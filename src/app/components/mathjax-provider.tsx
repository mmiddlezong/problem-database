'use client';

import Script from 'next/script';
import { PropsWithChildren } from 'react';

export default function MathJaxProvider({ children }: PropsWithChildren) {
  return (
    <>
      <Script id="mathjax-config" src="/mathjax-config.js" strategy="beforeInteractive" />
      <Script
        id="mathjax"
        src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"
        strategy="afterInteractive"
      />
      {children}
    </>
  );
}