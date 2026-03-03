import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeRaw from "rehype-raw";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeStringify from "rehype-stringify";
import type { Root, Element } from "hast";
import { visit } from "unist-util-visit";

function rehypeVideoEmbed() {
  return (tree: Root) => {
    visit(tree, "element", (node: Element, index, parent) => {
      if (
        node.tagName === "iframe" &&
        parent &&
        index !== undefined
      ) {
        const wrapper: Element = {
          type: "element",
          tagName: "div",
          properties: { className: ["video-embed"] },
          children: [node],
        };
        (parent as Element).children[index] = wrapper;
      }
    });
  };
}

function rehypeImageCaptions() {
  return (tree: Root) => {
    visit(tree, "element", (node: Element, index, parent) => {
      if (
        node.tagName === "img" &&
        node.properties?.alt &&
        typeof node.properties.alt === "string" &&
        node.properties.alt.trim() &&
        parent &&
        index !== undefined
      ) {
        const alt = node.properties.alt as string;
        const figure: Element = {
          type: "element",
          tagName: "figure",
          properties: { className: ["prose-figure"] },
          children: [
            node,
            {
              type: "element",
              tagName: "figcaption",
              properties: {},
              children: [{ type: "text", value: alt }],
            },
          ],
        };
        (parent as Element).children[index] = figure;
      }
    });
  };
}

export async function renderMarkdown(content: string): Promise<string> {
  const result = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeVideoEmbed)
    .use(rehypeImageCaptions)
    .use(rehypePrettyCode, {
      theme: {
        dark: "github-dark",
        light: "github-light",
      },
      keepBackground: false,
      defaultLang: "text",
    })
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(content);

  return String(result);
}
