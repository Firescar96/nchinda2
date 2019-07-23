import marked from 'marked';

export function parseMarkdown(markdown) {
  //extract tokens which are needed for the summary display
  const tokens = marked.lexer(markdown);
  let title = tokens.find(x => x.type === 'heading');
  let [date, shortText] = tokens.filter(x => x.type === 'paragraph');

  [title, date, shortText] = [title, date, shortText].map((_raw) => {
    const raw = [_raw];
    raw.links = {};
    return marked.parser(raw);
  });

  const fullText = marked(markdown);
  return {
    title, date, shortText, fullText,
  };
}

export function placeholder() {
  //place holder to ignore the default export eslint warning
}
