import { Converter } from "showdown";

export const ConvertMarkdownToHtml = (md: string) => {
  const converter = new Converter({ noHeaderId: true,  simpleLineBreaks: true })
  return converter.makeHtml(md);
};
