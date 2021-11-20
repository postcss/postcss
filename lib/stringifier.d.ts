import {
  Document,
  Root,
  Comment,
  Declaration,
  Builder,
  AnyNode,
  Rule,
  AtRule,
  Container
} from './postcss.js';

export class Stringifier {
  public constructor(builder: Builder);

  public stringify(node: AnyNode, semicolon?: boolean): void;

  public document(node: Document): void;

  public root(node: Root): void;

  public comment(node: Comment): void;

  public decl(node: Declaration, semicolon?: boolean): void;

  public rule(node: Rule): void;

  public atrule(node: AtRule, semicolon?: boolean): void;

  public body(node: Container): void;

  public block(node: AnyNode, start: string): void;

  public raw(node: AnyNode, own: string|null, detect?: string): string;

  public rawSemicolon(root: Root): boolean|undefined;

  public rawEmptyBody(root: Root): string|undefined;

  public rawIndent(root: Root): string|undefined;

  public rawBeforeComment(root: Root, node: Comment): string|undefined;

  public rawBeforeDecl(root: Root, node: Declaration): string|undefined;

  public rawBeforeRule(root: Root): string|undefined;

  public rawBeforeClose(root: Root): string|undefined;

  public rawBeforeOpen(root: Root): string|undefined;

  public rawColon(root: Root): string|undefined;

  public beforeAfter(node: AnyNode, detect: 'before'|'after'): string;

  public rawValue(node: AnyNode, prop: string): string;
}
