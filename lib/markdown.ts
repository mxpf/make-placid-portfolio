import { marked } from "marked";
import sanitizeHtml from "sanitize-html";

const sharedOptions: sanitizeHtml.IOptions = {
  allowedSchemes: ["http", "https", "mailto"],
  allowedSchemesByTag: { a: ["http", "https", "mailto"] },
  allowProtocolRelative: false,
  transformTags: {
    a: (tagName, attribs) => ({
      tagName,
      attribs: {
        ...attribs,
        ...(attribs.href?.startsWith("http") ? { rel: "noreferrer" } : {}),
      },
    }),
  },
};

export function renderMarkdown(source: string) {
  const rendered = marked.parse(source, { async: false }) as string;
  const html = sanitizeHtml(rendered, {
    ...sharedOptions,
    allowedTags: ["p", "h1", "h2", "h3", "ul", "ol", "li", "blockquote", "a", "strong", "em", "code", "br"],
    allowedAttributes: { a: ["href", "title", "rel"] },
  });
  return html.replace(
    /(<blockquote>\s*<p>)([“‘"'])/g,
    '$1<span class="hanging-quote">$2</span>',
  );
}

export function renderInlineMarkdown(source: string) {
  const rendered = marked.parseInline(source, { async: false }) as string;
  return sanitizeHtml(rendered, {
    ...sharedOptions,
    allowedTags: ["a", "strong", "em", "code", "br"],
    allowedAttributes: { a: ["href", "title", "rel"] },
  });
}
