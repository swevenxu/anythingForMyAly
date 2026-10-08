import type { ReactNode } from 'react';

function inlineMarkdown(text: string): ReactNode[] {
  const tokens = text.split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g);

  return tokens.map((token, index) => {
    if (token.startsWith('**') && token.endsWith('**')) {
      return <strong key={index}>{token.slice(2, -2)}</strong>;
    }
    if (token.startsWith('*') && token.endsWith('*')) {
      return <em key={index}>{token.slice(1, -1)}</em>;
    }
    if (token.startsWith('`') && token.endsWith('`')) {
      return <code key={index}>{token.slice(1, -1)}</code>;
    }
    return token;
  });
}

function tableCells(line: string): string[] {
  return line
    .trim()
    .replace(/^\||\|$/g, '')
    .split('|')
    .map((cell) => cell.trim());
}

function isTableSeparator(line: string): boolean {
  const cells = tableCells(line);
  return cells.length > 0 && cells.every((cell) => /^:?-{3,}:?$/.test(cell));
}

export default function MarkdownMessage({ content }: { content: string }) {
  const lines = content.replace(/\r\n/g, '\n').split('\n');
  const blocks: ReactNode[] = [];
  let listItems: { ordered: boolean; text: string }[] = [];

  function flushList() {
    if (listItems.length === 0) return;
    const ordered = listItems[0].ordered;
    const List = ordered ? 'ol' : 'ul';
    blocks.push(
      <List key={`list-${blocks.length}`}>
        {listItems.map((item, index) => (
          <li key={index}>{inlineMarkdown(item.text)}</li>
        ))}
      </List>
    );
    listItems = [];
  }

  let index = 0;
  while (index < lines.length) {
    const line = lines[index];
    const trimmed = line.trim();
    const heading = trimmed.match(/^#{1,3}\s+(.+)$/);
    const orderedItem = trimmed.match(/^\d+\.\s+(.+)$/);
    const unorderedItem = trimmed.match(/^[-*]\s+(.+)$/);

    if (trimmed.includes('|') && index + 1 < lines.length && isTableSeparator(lines[index + 1])) {
      flushList();
      const headers = tableCells(line);
      const rows: string[][] = [];
      index += 2;
      while (index < lines.length && lines[index].trim().includes('|')) {
        rows.push(tableCells(lines[index]));
        index += 1;
      }
      blocks.push(
        <div className="markdown-table-wrapper" key={`table-${index}`}>
          <table>
            <thead>
              <tr>
                {headers.map((header, cellIndex) => (
                  <th key={cellIndex}>{inlineMarkdown(header)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {headers.map((_, cellIndex) => (
                    <td key={cellIndex}>{inlineMarkdown(row[cellIndex] ?? '')}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      continue;
    }

    if (orderedItem || unorderedItem) {
      const ordered = Boolean(orderedItem);
      if (listItems.length > 0 && listItems[0].ordered !== ordered) flushList();
      listItems.push({ ordered, text: (orderedItem ?? unorderedItem)![1] });
      index += 1;
      continue;
    }

    flushList();
    if (!trimmed) {
      blocks.push(<div className="markdown-spacer" key={`space-${index}`} />);
    } else if (heading) {
      blocks.push(
        <h3 key={index}>{inlineMarkdown(heading[1])}</h3>
      );
    } else {
      blocks.push(<p key={index}>{inlineMarkdown(trimmed)}</p>);
    }
    index += 1;
  }

  flushList();
  return <div className="markdown-message">{blocks}</div>;
}
