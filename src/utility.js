import marked from 'marked';

const loadPosts = async (persona, numposts, vueComponent) => {
  let posts = [];
  for(let i = numposts; i > 0; i--) {
    posts.push(fetch(`/${persona}/${i}.md`));
  }
  posts = await Promise.all(posts);
  posts = posts.map(async (post) => post.text());
  posts = await Promise.all(posts);
  posts = posts.map((post, index) => {
    const tokens = marked.lexer(post);
    let [title, date] = tokens;
    //let title = tokens.find((x) => x.type === 'heading');
    //let date = tokens.find((x) => x.type === 'paragraph');

    [title, date] = [title, date].map((_raw) => {
      const raw = [_raw];
      raw.links = {};
      return marked.parser(raw);
    });

    const fullText = marked
      .parser(tokens)
      .replace(/\.\//g, `/${persona}/`);

    return {
      title, date, fullText, index: posts.length - index,
    };
  });

  posts.forEach((post, index) => { post.index = posts.length - index; });
  vueComponent.posts = posts;
  if(!Number.isNaN(parseInt(vueComponent.$route.query.post, 10))) {
    vueComponent.selectPost(vueComponent.$route.query.post);
  }
};

export { loadPosts };
