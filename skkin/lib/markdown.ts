// Mise en forme minimale pour les textes saisis dans l'admin :
// ## titre, ### sous-titre, - liste, 1. liste numérotée, **gras**, *italique*, [lien](url).
function escape(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function inline(text: string): string {
  return escape(text)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/\[([^\]]+)\]\(((?:https?:\/\/|\/|mailto:)[^)\s]*)\)/g, '<a href="$2">$1</a>');
}

export function markdownToHtml(source: string): string {
  const blocks = source.replace(/\r\n/g, "\n").trim().split(/\n{2,}/);
  return blocks
    .map((block) => {
      const lines = block.split("\n");
      if (lines.every((line) => /^\s*[-*] /.test(line))) {
        return `<ul>${lines.map((line) => `<li>${inline(line.replace(/^\s*[-*] /, ""))}</li>`).join("")}</ul>`;
      }
      if (lines.every((line) => /^\s*\d+\. /.test(line))) {
        return `<ol>${lines.map((line) => `<li>${inline(line.replace(/^\s*\d+\. /, ""))}</li>`).join("")}</ol>`;
      }
      const heading = /^(#{1,3}) (.+)$/.exec(block);
      if (heading && lines.length === 1) {
        const level = heading[1].length + 1;
        return `<h${level}>${inline(heading[2])}</h${level}>`;
      }
      return `<p>${lines.map(inline).join("<br />")}</p>`;
    })
    .join("\n");
}
