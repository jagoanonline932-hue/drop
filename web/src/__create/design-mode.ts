/**
 * Web design mode — extracts Tailwind className and computed styles
 * from DOM elements.
 */

/* -------------------------------------------------------------------------- */
/* INTERNAL FALLBACK DESIGN MODE                                              */
/* -------------------------------------------------------------------------- */

type StyleInfo = {
  className: string;
  styles: Record<string, string> | null;
};

type GetStyleInfo = (resolved: {
  element: HTMLElement;
}) => StyleInfo;

function initDesignMode(getStyleInfo: GetStyleInfo) {
  let selectedElement: HTMLElement | null = null;

  function reselect() {
    if (!selectedElement) return;

    try {
      getStyleInfo({
        element: selectedElement,
      });
    } catch (err) {
      console.warn('Design mode reselect failed:', err);
    }
  }

  if (typeof window !== 'undefined') {
    document.addEventListener('click', (e) => {
      const target = e.target;

      if (target instanceof HTMLElement) {
        selectedElement = target;
      }
    });
  }

  return reselect;
}

/* -------------------------------------------------------------------------- */
/* COLOR PICKER                                                               */
/* -------------------------------------------------------------------------- */

if (typeof window !== 'undefined') {
  void import('vanilla-colorful/hex-color-picker.js');
}

/* -------------------------------------------------------------------------- */
/* HELPERS                                                                    */
/* -------------------------------------------------------------------------- */

function rgbToHex(rgb: string): string {
  const match = rgb.match(
    /^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)$/
  );

  if (!match) return rgb;

  const r = Number.parseInt(match[1]!, 10);
  const g = Number.parseInt(match[2]!, 10);
  const b = Number.parseInt(match[3]!, 10);

  return (
    '#' +
    [r, g, b]
      .map((c) => c.toString(16).padStart(2, '0'))
      .join('')
  );
}

function extractComputedStyles(
  el: HTMLElement
): Record<string, string> {
  const cs = getComputedStyle(el);

  return {
    fontSize: cs.fontSize,
    fontFamily: cs.fontFamily,
    fontWeight: cs.fontWeight,
    lineHeight: cs.lineHeight,
    letterSpacing: cs.letterSpacing,
    textAlign: cs.textAlign,
    textDecoration: cs.textDecorationLine,
    fontStyle: cs.fontStyle,

    textColor: rgbToHex(cs.color),

    backgroundColor: rgbToHex(
      cs.backgroundColor
    ),

    marginTop: cs.marginTop,
    marginRight: cs.marginRight,
    marginBottom: cs.marginBottom,
    marginLeft: cs.marginLeft,

    paddingTop: cs.paddingTop,
    paddingRight: cs.paddingRight,
    paddingBottom: cs.paddingBottom,
    paddingLeft: cs.paddingLeft,

    width: cs.width,
    height: cs.height,

    minWidth: cs.minWidth,
    minHeight: cs.minHeight,

    maxWidth: cs.maxWidth,
    maxHeight: cs.maxHeight,

    borderWidth: cs.borderTopWidth,

    borderColor: rgbToHex(
      cs.borderTopColor
    ),

    borderRadius: cs.borderTopLeftRadius,

    display: cs.display,

    flexDirection: cs.flexDirection,

    justifyContent: cs.justifyContent,

    alignItems: cs.alignItems,

    gap: cs.gap,

    objectFit: cs.objectFit,

    objectPosition: cs.objectPosition,
  };
}

/* -------------------------------------------------------------------------- */
/* STYLE INFO                                                                 */
/* -------------------------------------------------------------------------- */

const getStyleInfo: GetStyleInfo = (
  resolved
) => {
  const el = resolved.element;

  const className =
    el instanceof HTMLElement
      ? el.className
      : '';

  const styles =
    el instanceof HTMLElement
      ? extractComputedStyles(el)
      : null;

  return {
    className,
    styles,
  };
};

const reselect = initDesignMode(
  getStyleInfo
);

/* -------------------------------------------------------------------------- */
/* HMR                                                                        */
/* -------------------------------------------------------------------------- */

if (import.meta.hot) {
  import.meta.hot.on(
    'vite:afterUpdate',
    () => {
      reselect();
    }
  );
}
