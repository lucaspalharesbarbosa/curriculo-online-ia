"use client";

import { useEffect, useState } from "react";

/**
 * Compensa o teclado virtual (iOS/Android) via visualViewport.
 * Retorna o quanto o fundo da tela “encolheu” — usar como `bottom` do sheet.
 */
export function useVisualViewportOffset() {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;

    const update = () => {
      const next = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
      setOffset(next);
    };

    update();
    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);
    window.addEventListener("resize", update);

    return () => {
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return offset;
}
