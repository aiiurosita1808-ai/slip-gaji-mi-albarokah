import html2canvas from 'html2canvas';

/**
 * Converts any oklch(...) color function string to rgb(...) or rgba(...) string mathematically.
 * html2canvas fails with "Attempting to parse an unsupported color function 'oklch'".
 */
export function oklchToRgb(cssText: string): string {
  if (!cssText || !cssText.includes('oklch')) return cssText;

  return cssText.replace(/oklch\(\s*([0-9.%]+)\s+([0-9.%]+)\s+([0-9.%a-zA-Z]+)(?:\s*\/\s*([0-9.%]+))?\s*\)/gi, (match, lStr, cStr, hStr, aStr) => {
    try {
      let l = parseFloat(lStr);
      if (lStr.endsWith('%')) l /= 100;

      let c = parseFloat(cStr);
      if (cStr.endsWith('%')) c = (c / 100) * 0.4; // 100% chroma approx 0.4

      let h = parseFloat(hStr); // parseFloat handles 'deg' or plain numbers

      let alpha = 1;
      if (aStr) {
        alpha = parseFloat(aStr);
        if (aStr.endsWith('%')) alpha /= 100;
      }

      if (isNaN(l) || isNaN(c) || isNaN(h)) return 'rgb(0, 0, 0)';

      // Convert OKLCH to OKLAB
      const hRad = (h * Math.PI) / 180;
      const aLab = c * Math.cos(hRad);
      const bLab = c * Math.sin(hRad);

      // OKLAB to Linear sRGB
      const l_ = l + 0.3963377774 * aLab + 0.2158037573 * bLab;
      const m_ = l - 0.1055613458 * aLab - 0.0638541728 * bLab;
      const s_ = l - 0.0894841775 * aLab - 1.2914855480 * bLab;

      const l3 = l_ * l_ * l_;
      const m3 = m_ * m_ * m_;
      const s3 = s_ * s_ * s_;

      const rLin = +4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3;
      const gLin = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3;
      const bLin = -0.0041960863 * l3 - 0.7034186147 * m3 + 1.7076147010 * s3;

      const f = (x: number) => {
        const clamped = Math.max(0, Math.min(1, x));
        return clamped <= 0.0031308
          ? 12.92 * clamped
          : 1.055 * Math.pow(clamped, 1 / 2.4) - 0.055;
      };

      const r = Math.round(Math.max(0, Math.min(255, f(rLin) * 255)));
      const g = Math.round(Math.max(0, Math.min(255, f(gLin) * 255)));
      const bComp = Math.round(Math.max(0, Math.min(255, f(bLin) * 255)));

      if (alpha < 1) {
        return `rgba(${r}, ${g}, ${bComp}, ${alpha})`;
      }
      return `rgb(${r}, ${g}, ${bComp})`;
    } catch {
      return 'rgb(0, 0, 0)';
    }
  });
}

export function handleHtml2CanvasOnClone(clonedDoc: Document, clonedElement: HTMLElement) {
  // 1. Clean all <style> tags in cloned document
  const styleEls = Array.from(clonedDoc.querySelectorAll('style'));
  styleEls.forEach((styleEl) => {
    if (styleEl.textContent && styleEl.textContent.includes('oklch')) {
      styleEl.textContent = oklchToRgb(styleEl.textContent);
    }
  });

  // 2. Clean all element inline style attributes across the whole cloned document
  const allDocElements = Array.from(clonedDoc.querySelectorAll('*')) as HTMLElement[];
  allDocElements.forEach((el) => {
    const styleAttr = el.getAttribute('style');
    if (styleAttr && styleAttr.includes('oklch')) {
      el.setAttribute('style', oklchToRgb(styleAttr));
    }
  });

  // 3. Clean inline cssText on clonedElement and children
  const elementsToClean = [clonedElement, ...Array.from(clonedElement.querySelectorAll('*'))] as HTMLElement[];
  elementsToClean.forEach((el) => {
    if (el.style && el.style.cssText && el.style.cssText.includes('oklch')) {
      el.style.cssText = oklchToRgb(el.style.cssText);
    }
  });
}
