import { useCallback, useMemo, useState } from "react";
import { createPortal } from "react-dom";

import { $createCodeNode } from "@lexical/code";
import {
  INSERT_CHECK_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
} from "../../nodes/ListNode";
import { INSERT_EMBED_COMMAND } from "@lexical/react/LexicalAutoEmbedPlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { INSERT_HORIZONTAL_RULE_COMMAND } from "@lexical/react/LexicalHorizontalRuleNode";
import {
  LexicalTypeaheadMenuPlugin,
  MenuOption,
  useBasicTypeaheadTriggerMatch,
} from '@lexical/react/LexicalTypeaheadMenuPlugin';
import { $createHeadingNode, $createQuoteNode } from "@lexical/rich-text";
import { $setBlocksType } from "@lexical/selection";
import { INSERT_TABLE_COMMAND } from "@lexical/table";
import {
  $createParagraphNode,
  $getSelection,
  $isRangeSelection,
  FORMAT_ELEMENT_COMMAND,
  TextNode,
} from "lexical";

import useModal from "../../hooks/useModal";
import { EmbedConfigs } from "../AutoEmbedPlugin";
import { InsertImageDialog } from "../ImagesPlugin";
import { InsertEquationDialog } from "../EquationsPlugin";
import { INSERT_EXCALIDRAW_COMMAND } from "../ExcalidrawPlugin";
import { INSERT_COLLAPSIBLE_COMMAND } from "../CollapsiblePlugin";
// import { InsertPollDialog } from "../PollPlugin";
// import { InsertNewTableDialog, InsertTableDialog } from "../TablePlugin";

import useUserData from "../../../../../../hooks/useUserData";

import twitterIcon from '../../images/icons/tweet.svg';
import youtubeIcon from '../../images/icons/youtube.svg';
import figmaIcon from '../../images/icons/figma.svg';

class ComponentPickerOption extends MenuOption {
  // What shows up in the editor
  title: string;
  // Icon for display
  icon?: JSX.Element;
  // For extra searching.
  keywords: Array<string>;
  // TBD
  keyboardShortcut?: string;
  // What happens when you select this option?
  onSelect: (queryString: string) => void;

  constructor(
    title: string,
    options: {
      icon?: JSX.Element;
      keywords?: Array<string>;
      keyboardShortcut?: string;
      onSelect: (queryString: string) => void;
    },
  ) {
    super(title);
    this.title = title;
    this.keywords = options.keywords || [];
    this.icon = options.icon;
    this.keyboardShortcut = options.keyboardShortcut;
    this.onSelect = options.onSelect.bind(this);
  }
}

function ComponentPickerMenuItem({
  index,
  isSelected,
  onClick,
  onMouseEnter,
  option,
}: {
  index: number;
  isSelected: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
  option: ComponentPickerOption;
}) {
  let className = "!rounded-lg item bg-[#f8f8f8] text-gray-900 dark:!text-gray-300 hover:!bg-[#e1e1e1] dark:bg-[#1c1d1e] dark:hover:!bg-[#323232] !py-3 !mx-[1.5px]";
  if (isSelected) className += " !bg-[#bbbbbb] dark:!bg-[#323232]";

  return (
    <div className="hover:bg-[#e1e1e1] dark:hover:!bg-[#323232] rounded">
      <li
        key={option.key}
        tabIndex={-1}
        className={className}
        ref={option.setRefElement}
        role="option"
        aria-selected={isSelected}
        id={"typeahead-item-" + index}
        onMouseEnter={onMouseEnter}
        onClick={onClick}
      >
        {option.title.slice(0, 5) === "Embed" ? (
          <>
            {option.icon}
            <span className="text ml-2">{option.title}</span>
          </>
        ) : (
          <>
            {option.icon}
            <span className="text">{option.title}</span>
          </>
        )}
      </li>
    </div>
  );
}

export default function ComponentPickerMenuPlugin(): JSX.Element {
  const [editor] = useLexicalComposerContext();
  const [modal, showModal] = useModal();
  const [queryString, setQueryString] = useState<string | null>(null);

  const checkForTriggerMatch = useBasicTypeaheadTriggerMatch("/", { minLength: 0 });

  const getDynamicOptions = useCallback(() => {
    const options: Array<ComponentPickerOption> = [];

    if (queryString == null) return options;

    const fullTableRegex = new RegExp(/^([1-9]|10)x([1-9]|10)$/);
    const partialTableRegex = new RegExp(/^([1-9]|10)x?$/);

    const fullTableMatch = fullTableRegex.exec(queryString);
    const partialTableMatch = partialTableRegex.exec(queryString);

    if (fullTableMatch) {
      const [rows, columns] = fullTableMatch[0]
        .split("x")
        .map((n: string) => parseInt(n, 10));

      options.push(
        new ComponentPickerOption(`${rows}x${columns} Table`, {
          icon: <i className="icon table" />,
          keywords: ["table"],
          onSelect: () =>
            // @ts-ignore Correct types, but since they're dynamic TS doesn't like it.
            editor.dispatchCommand(INSERT_TABLE_COMMAND, { columns, rows }),
        })
      );
    } else if (partialTableMatch) {
      const rows = parseInt(partialTableMatch[0], 10);

      options.push(
        ...Array.from({ length: 5 }, (_, i) => i + 1).map(
          (columns) =>
            new ComponentPickerOption(`${rows}x${columns} Table`, {
              icon: <i className="icon table" />,
              keywords: ["table"],
              onSelect: () =>
                // @ts-ignore Correct types, but since they're dynamic TS doesn't like it.
                editor.dispatchCommand(INSERT_TABLE_COMMAND, { columns, rows }),
            })
        )
      );
    }

    return options;
  }, [editor, queryString]);

  const { userData: { settings: { theme } } } = useUserData();

  const options = useMemo(() => {
    const baseOptions = [
      new ComponentPickerOption("Paragraph", {
        icon: <i className={`icon paragraph ${theme === 'dark' && 'comp-picker'}`} />,
        keywords: ["normal", "paragraph", "p", "text"],
        onSelect: () =>
          editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
              $setBlocksType(selection, () => $createParagraphNode());
            }
          }),
      }),
      ...Array.from({ length: 3 }, (_, i) => i + 1).map(
        (n) =>
          new ComponentPickerOption(`Heading ${n}`, {
            icon: <i className={`icon h${n} ${theme === 'dark' && 'comp-picker'}`} />,
            keywords: ["heading", "header", `h${n}`],
            onSelect: () =>
              editor.update(() => {
                const selection = $getSelection();
                if ($isRangeSelection(selection)) {
                  $setBlocksType(selection, () =>
                    // @ts-ignore Correct types, but since they're dynamic TS doesn't like it.
                    $createHeadingNode(`h${n}`)
                  );
                }
              }),
          })
      ),
      new ComponentPickerOption("Numbered List", {
        icon: <i className={`icon number ${theme === 'dark' && 'comp-picker'}`} />,
        keywords: ["numbered list", "ordered list", "ol"],
        onSelect: () =>
          editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined),
      }),
      new ComponentPickerOption("Bulleted List", {
        icon: <i className={`icon bullet  ${theme === 'dark' && 'comp-picker'}`} />,
        keywords: ["bulleted list", "unordered list", "ul"],
        onSelect: () =>
          editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined),
      }),
      new ComponentPickerOption("Check List", {
        icon: <i className={`icon check  ${theme === 'dark' && 'comp-picker'}`} />,
        keywords: ["check list", "todo list"],
        onSelect: () =>
          editor.dispatchCommand(INSERT_CHECK_LIST_COMMAND, undefined),
      }),
      new ComponentPickerOption("Quote", {
        icon: <i className={`icon quote ${theme === 'dark' && 'comp-picker'}`} />,
        keywords: ["block quote"],
        onSelect: () =>
          editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
              $setBlocksType(selection, () => $createQuoteNode());
            }
          }),
      }),
      new ComponentPickerOption("Code", {
        icon: <i className={`icon code ${theme === 'dark' && 'comp-picker'}`} />,
        keywords: ["javascript", "python", "js", "java", "codeblock"],
        onSelect: () =>
          editor.update(() => {
            const selection = $getSelection();

            if ($isRangeSelection(selection)) {
              if (selection.isCollapsed()) {
                $setBlocksType(selection, () => $createCodeNode());
              } else {
                // Will this ever happen?
                const textContent = selection.getTextContent();
                const codeNode = $createCodeNode();
                selection.insertNodes([codeNode]);
                selection.insertRawText(textContent);
              }
            }
          }),
      }),
      new ComponentPickerOption("Divider", {
        icon: <i className={`icon horizontal-rule ${theme === 'dark' && 'comp-picker'}`} />,
        keywords: ["horizontal rule", "divider", "hr"],
        onSelect: () =>
          editor.dispatchCommand(INSERT_HORIZONTAL_RULE_COMMAND, undefined),
      }),
      new ComponentPickerOption("Excalidraw", {
        icon: <i className={`icon diagram-2 ${theme === 'dark' && 'comp-picker'}`} />,
        keywords: ["excalidraw", "diagram", "drawing"],
        onSelect: () =>
          editor.dispatchCommand(INSERT_EXCALIDRAW_COMMAND, undefined),
      }),
      ...EmbedConfigs.map(
        (embedConfig) => {
          const useCustomImage = 
            embedConfig.type.startsWith('y') 
            ? ( <img className={`w-[20px] h-5 mt-[1px] ${theme === 'dark' && 'comp-picker'}`} src={youtubeIcon} /> )
            : embedConfig.type.startsWith('f') 
            ? ( <img className={`w-[20px] h-5 mt-[1px] ${theme === 'dark' && 'comp-picker'}`} src={figmaIcon} /> )
            : embedConfig.type.startsWith('t') 
            && ( <img className={`w-[20px] h-5 mt-[1px] ${theme === 'dark' && 'comp-picker'}`} src={twitterIcon} /> );

          return new ComponentPickerOption(`Embed ${embedConfig.contentName}`, {
            icon: useCustomImage as JSX.Element,
            keywords: [...embedConfig.keywords, "embed"],
            onSelect: () =>
              editor.dispatchCommand(INSERT_EMBED_COMMAND, embedConfig.type),
          })
        }
      ),
      new ComponentPickerOption("Equation", {
        icon: <i className={`icon equation ${theme === 'dark' && 'comp-picker'}`} />,
        keywords: ["equation", "latex", "math"],
        onSelect: () =>
          showModal("Insert Equation", (onClose) => (
            <InsertEquationDialog activeEditor={editor} onClose={onClose} />
          )),
      }),
      new ComponentPickerOption("Image", {
        icon: <i className={`icon image ${theme === 'dark' && 'comp-picker'}`} />,
        keywords: ["image", "photo", "picture", "file"],
        onSelect: () =>
          showModal("Insert Image", (onClose) => (
            <InsertImageDialog activeEditor={editor} onClose={onClose} />
          )),
      }),
      new ComponentPickerOption("Collapsible", {
        icon: <i className={`icon caret-right ${theme === 'dark' && 'comp-picker'}`} />,
        keywords: ["collapse", "collapsible", "toggle"],
        onSelect: () =>
          editor.dispatchCommand(INSERT_COLLAPSIBLE_COMMAND, undefined),
      }),
      ...["left", "center", "right", "justify"].map(
        (alignment) =>
          new ComponentPickerOption(`Align ${alignment}`, {
            icon: <i className={`icon ${alignment}-align ${theme === 'dark' && 'comp-picker'}`} />,
            keywords: ["align", "justify", alignment],
            onSelect: () =>
              // @ts-ignore Correct types, but since they're dynamic TS doesn't like it.
              editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, alignment),
          })
      ),
    ];

    const dynamicOptions = getDynamicOptions();

    return queryString
      ? [
          ...dynamicOptions,
          ...baseOptions.filter((option) => {
            return new RegExp(queryString, "gi").exec(option.title) ||
              option.keywords != null
              ? option.keywords.some((keyword) =>
                  new RegExp(queryString, "gi").exec(keyword)
                )
              : false;
          }),
        ]
      : baseOptions;
  }, [editor, getDynamicOptions, queryString, showModal]);

  const onSelectOption = useCallback(
    (
      selectedOption: ComponentPickerOption,
      nodeToRemove: TextNode | null,
      closeMenu: () => void,
      matchingString: string
    ) => {
      editor.update(() => {
        if (nodeToRemove) nodeToRemove.remove();
        selectedOption.onSelect(matchingString);
        closeMenu();
      });
    },
    [editor]
  );

  return (
    <>
      {modal}
      <LexicalTypeaheadMenuPlugin<ComponentPickerOption>
        onQueryChange={setQueryString}
        onSelectOption={onSelectOption}
        triggerFn={checkForTriggerMatch}
        options={options}
        menuRenderFn={(
          anchorElementRef,
          { selectedIndex, selectOptionAndCleanUp, setHighlightedIndex }
        ) => {
            if (anchorElementRef.current == null || options.length === 0) return null;

            const getElPositionData = anchorElementRef.current.getBoundingClientRect();
            const { x, y } = getElPositionData;

            const overflowXAxis = outerWidth - x < 176;
            const overflowYAxis = outerHeight - y < 260;

            return anchorElementRef.current && options.length
            ? createPortal(
                <div 
                  className={`typeahead-popover component-picker-menu bg-[#f8f8f8] dark:!bg-[#1c1d1e] dark:hover:!bg-[#222222] !w-[13rem]
                    ${overflowXAxis && !overflowYAxis ? "!absolute !-left-44"
                    : !overflowXAxis && overflowYAxis ? "!absolute !-top-[130px] !left-5"
                    : overflowXAxis && overflowYAxis && "!absolute !-left-52 !-top-48"}
                  `}
                >
                  <ul className="max-h-[200px] xxs:!h-[180px] border border-gray-600">
                    {options.map((option, i: number) => (
                      <div 
                        key={option.key}
                        style={{ zIndex: '50 !important' }}
                      >
                        <ComponentPickerMenuItem
                          index={i}
                          isSelected={selectedIndex === i}
                          onClick={() => {
                            setHighlightedIndex(i);
                            selectOptionAndCleanUp(option);
                          }}
                          onMouseEnter={() => setHighlightedIndex(i)}
                          option={option}
                        />
                        {i !== options.length - 1 && (
                          <div className="border border-transparent border-t-gray-700 dark:border-t-[#404040] mx-2"/>
                        )}
                      </div>
                    ))}
                  </ul>
                </div>,
                anchorElementRef.current
              )
            : null
          }
        }
      />
    </>
  );
}
