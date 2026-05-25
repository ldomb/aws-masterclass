"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  chart: string;
  title?: string;
}

async function renderChart(chart: string): Promise<string> {
  const mermaid = (await import("mermaid")).default;
  mermaid.initialize({
    startOnLoad: false,
    theme: "default",
    fontFamily: "inherit",
    // Bump the default font up slightly — Mermaid's 14px reads small at
    // typical desktop zoom levels, especially after the SVG is scaled to
    // fit the column.
    themeVariables: {
      fontSize: "16px",
    },
    // Give flowchart nodes more breathing room so multi-line labels with
    // <br/> don't appear cramped against neighbors.
    flowchart: {
      htmlLabels: true,
      nodeSpacing: 40,
      rankSpacing: 50,
      padding: 8,
      useMaxWidth: true,
    },
    sequence: {
      useMaxWidth: true,
      boxMargin: 10,
      messageMargin: 35,
    },
  });
  const { svg } = await mermaid.render(
    `mermaid-${Math.random().toString(36).slice(2)}`,
    chart
  );
  return svg;
}

export function MermaidDiagram({ chart, title }: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>("");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    renderChart(chart)
      .then(setSvg)
      .catch(() => setError("Unable to render diagram."));
  }, [chart]);

  // After the SVG string is injected into the DOM, make it responsive
  // via direct DOM manipulation — more reliable than regex on the string.
  useEffect(() => {
    if (!svg || !wrapperRef.current) return;
    const svgEl = wrapperRef.current.querySelector("svg");
    if (!svgEl) return;

    // width="100%" + viewBox = scales proportionally to container width
    svgEl.setAttribute("width", "100%");
    svgEl.removeAttribute("height");

    // Remove Mermaid's hardcoded max-width (e.g. "max-width: 850px")
    // which prevents the SVG from ever shrinking below its rendered size.
    svgEl.style.cssText = "display: block; max-width: 100%;";
  }, [svg]);

  if (error) {
    return (
      <div className="my-6 rounded-lg border bg-muted/30 p-4 text-center">
        <p className="text-sm text-muted-foreground">{error}</p>
      </div>
    );
  }

  return (
    <figure className="my-8 -mx-4 sm:-mx-8 md:-mx-16 lg:-mx-24">
      <div className="overflow-x-auto rounded-lg border bg-muted/30 p-4 sm:p-6">
        <div
          ref={wrapperRef}
          className="w-full"
          role="img"
          aria-label={title ?? "Diagram"}
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      </div>
      {title && (
        <figcaption className="mt-3 text-center text-sm font-medium text-foreground px-4">
          {title}
        </figcaption>
      )}
    </figure>
  );
}
