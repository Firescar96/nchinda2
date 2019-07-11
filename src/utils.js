import showdown from 'showdown';
var converter = new showdown.Converter()


export function parseMarkdown(directory) {
    //read files from directory
    //map each to html
    converter.makeHtml(text);
    return
}