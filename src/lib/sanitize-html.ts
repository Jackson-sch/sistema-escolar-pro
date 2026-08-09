/**
 * Sanitización ligera de HTML para contenido generado por usuarios autenticados
 * (anuncios, comunicados). Elimina vectores XSS comunes (script, iframe, on*,
 * javascript:/data: URLs) y permite solo etiquetas y atributos seguros.
 * No requiere dependencias y funciona en cliente y servidor (Node).
 */
const ALLOWED_TAGS = new Set([
  "p", "b", "i", "u", "strong", "em", "br", "hr",
  "ul", "ol", "li", "h1", "h2", "h3", "h4", "h5", "h6",
  "a", "blockquote", "span", "div", "small", "mark",
  "del", "ins", "sub", "sup", "code", "pre",
  "table", "thead", "tbody", "tfoot", "tr", "th", "td",
  "img", "figure", "figcaption",
]);

const ALLOWED_ATTRS = new Set([
  "href", "target", "rel", "alt", "src",
  "width", "height", "class", "title", "align",
]);

const FORBIDDEN_PROTOCOLS = /^(javascript|data|vbscript):/i;

function isSafeValue(value: string): boolean {
  const v = value.trim().replace(/^["']|["']$/g, "").toLowerCase();
  return !FORBIDDEN_PROTOCOLS.test(v);
}

function stripBlock(regex: RegExp, input: string): string {
  let out = input;
  let prev = "";
  // Iterate until stable so nested blocks are also removed
  while (out !== prev) {
    prev = out;
    out = out.replace(regex, "");
  }
  return out;
}

export function sanitizeHtmlContent(html: string | null | undefined): string {
  if (!html) return "";

  let out = html;

  // Remove dangerous blocks entirely (with their content)
  out = stripBlock(/<script\b[\s\S]*?<\/script\s*>/gi, out);
  out = stripBlock(/<style\b[\s\S]*?<\/style\s*>/gi, out);
  out = stripBlock(/<iframe\b[\s\S]*?<\/iframe\s*>/gi, out);
  out = stripBlock(/<object\b[\s\S]*?<\/object\s*>/gi, out);
  out = stripBlock(/<embed\b[\s\S]*?>/gi, out);
  out = stripBlock(/<link\b[\s\S]*?\/?>/gi, out);
  out = stripBlock(/<meta\b[\s\S]*?\/?>/gi, out);
  out = stripBlock(/<form\b[\s\S]*?<\/form\s*>/gi, out);
  out = stripBlock(/<input\b[\s\S]*?\/?>/gi, out);
  out = stripBlock(/<textarea\b[\s\S]*?<\/textarea\s*>/gi, out);
  out = stripBlock(/<select\b[\s\S]*?<\/select\s*>/gi, out);
  out = stripBlock(/<button\b[\s\S]*?<\/button\s*>/gi, out);
  out = stripBlock(/<svg\b[\s\S]*?<\/svg\s*>/gi, out);
  out = stripBlock(/<math\b[\s\S]*?<\/math\s*>/gi, out);
  out = stripBlock(/<template\b[\s\S]*?<\/template\s*>/gi, out);

  // Remove event handler attributes (onclick, onerror, ...)
  out = out.replace(/\s+on\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "");

  // Neutralize javascript:/data: in href, src, xlink:href
  out = out.replace(
    /\s+(?:href|src|xlink:href|action)\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi,
    (match, value: string) =>
      isSafeValue(value) ? match : ` ${match.trim().split("=")[0]}=""`,
  );

  // Neutralize style attributes containing expression() or url()
  out = out.replace(
    /\s+style\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi,
    (match, value: string) => {
      const v = String(value).replace(/^["']|["']$/g, "");
      if (/expression\s*\(|javascript\s*:|url\s*\(/i.test(v)) {
        return ` ${match.trim().split("=")[0]}=""`;
      }
      return match;
    },
  );

  // Whitelist remaining tags and attributes; escape anything else
  out = out.replace(
    /<(\/?)([a-zA-Z][a-zA-Z0-9]*)((?:\s+[^<>]*?)?)(\/?)>/g,
    (match, close: string, tag: string, attrs: string, selfClose: string) => {
      const t = tag.toLowerCase();
      if (!ALLOWED_TAGS.has(t)) {
        // Escape non-whitelisted tags so they render as text
        return match.replace(/</g, "&lt;").replace(/>/g, "&gt;");
      }
      if (!attrs) return `<${close}${t}${selfClose}>`;

      const cleanedAttrs = attrs.replace(
        /\s+([a-zA-Z-]+)\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/g,
        (am, name: string, value: string) => {
          const n = name.toLowerCase();
          if (!ALLOWED_ATTRS.has(n)) return "";
          if (n === "href" || n === "src" || n === "rel") {
            if (!isSafeValue(value)) return "";
          }
          return am;
        },
      );
      return `<${close}${t}${cleanedAttrs}${selfClose}>`;
    },
  );

  // Escape stray < > that could break out of markup
  out = out.replace(/(^|[^a-zA-Z0-9])</g, "$1&lt;");
  out = out.replace(/>([^a-zA-Z0-9]|$)/g, "&gt;$1");

  return out;
}
