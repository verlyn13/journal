declare module 'turndown' {
  export interface Options {
    headingStyle?: 'setext' | 'atx';
    hr?: string;
    bulletListMarker?: '-' | '+' | '*';
    codeBlockStyle?: 'indented' | 'fenced';
    fence?: '```' | '~~~';
    emDelimiter?: '_' | '*';
    strongDelimiter?: '**' | '__';
    linkStyle?: 'inlined' | 'referenced';
    linkReferenceStyle?: 'full' | 'collapsed' | 'shortcut';
    preformattedCode?: boolean;
  }

  export interface TurndownNode extends Node {
    nodeName: string;
    classList?: DOMTokenList;
    textContent?: string | null;
  }

  export interface Rule {
    filter: string | string[] | ((node: TurndownNode, options: Options) => boolean);
    replacement: (content: string, node: TurndownNode, options: Options) => string;
  }

  export default class TurndownService {
    constructor(options?: Options);
    turndown(input: string | Node): string;
    use(plugins: Plugin | Plugin[]): this;
    addRule(key: string, rule: Rule): this;
    keep(filter: string | string[]): this;
    remove(filter: string | string[]): this;
    escape(str: string): string;
  }

  export type Plugin = (service: TurndownService) => void;
}
