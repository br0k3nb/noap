import { useState } from 'react';

import type {
  EditorConfig,
  ElementFormatType,
  LexicalEditor,
  LexicalNode,
  NodeKey,
  Spread,
} from "lexical";

import { BlockWithAlignableContents } from "@lexical/react/LexicalBlockWithAlignableContents";
import { DecoratorBlockNode, SerializedDecoratorBlockNode } from "@lexical/react/LexicalDecoratorBlockNode";

import useUpdateViewport from "../../../../../hooks/useUpdateViewport";

type FigmaComponentProps = Readonly<{
  className: Readonly<{ base: string; focus: string; }>;
  format: ElementFormatType | null;
  nodeKey: NodeKey;
  documentID: string;
}>;

function FigmaComponent({ className, format, nodeKey, documentID }: FigmaComponentProps) {
  const [currentScreenSize, setCurrentScreenSize] = useState({ width: innerWidth });

  useUpdateViewport(setCurrentScreenSize, 500);

  const rootEditorDiv = document.getElementsByClassName("ContentEditable__root")[0];
  const editorWidth = rootEditorDiv.clientWidth;

  return (
    <BlockWithAlignableContents
      className={className}
      format={format}
      nodeKey={nodeKey}
    >
      <iframe
        className="!rounded-lg border border-gray-500"
        width={currentScreenSize.width <= 640 ? editorWidth - 56 : editorWidth - 56 < 700 ? editorWidth - 56 : 700 }
        height="415"
        src={`
          https://www.figma.com/embed?embed_host=lexical&url=\
          https://www.figma.com/file/${documentID}
        `}
        allowFullScreen={true}
      />
    </BlockWithAlignableContents>
  );
}

export type SerializedFigmaNode = Spread<
  {
    documentID: string;
    type: "figma";
    version: 1;
  },
  SerializedDecoratorBlockNode
>;

export class FigmaNode extends DecoratorBlockNode {
  __id: string;

  static getType(): string {
    return "figma";
  }

  static clone(node: FigmaNode): FigmaNode {
    return new FigmaNode(node.__id, node.__format, node.__key);
  }

  static importJSON(serializedNode: SerializedFigmaNode): FigmaNode {
    const node = $createFigmaNode(serializedNode.documentID);
    node.setFormat(serializedNode.format);
    return node;
  }

  exportJSON(): SerializedFigmaNode {
    return {
      ...super.exportJSON(),
      documentID: this.__id,
      type: "figma",
      version: 1,
    };
  }

  constructor(id: string, format?: ElementFormatType, key?: NodeKey) {
    super(format, key);
    this.__id = id;
  }

  updateDOM(): false {
    return false;
  }

  getId(): string {
    return this.__id;
  }

  getTextContent(
    _includeInert?: boolean | undefined,
    _includeDirectionless?: false | undefined
  ): string {
    return `https://www.figma.com/file/${this.__id}`;
  }

  decorate(_editor: LexicalEditor, config: EditorConfig): JSX.Element {
    const embedBlockTheme = config.theme.embedBlock || {};
    const className = {
      base: embedBlockTheme.base || "",
      focus: embedBlockTheme.focus || "",
    };
    return (
      <FigmaComponent
        className={className}
        format={this.__format}
        nodeKey={this.getKey()}
        documentID={this.__id}
      />
    );
  }

  isInline(): false {
    return false;
  }
}

export function $createFigmaNode(documentID: string): FigmaNode {
  return new FigmaNode(documentID);
}

export function $isFigmaNode(
  node: FigmaNode | LexicalNode | null | undefined
): node is FigmaNode {
  return node instanceof FigmaNode;
}