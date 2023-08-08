import type { LexicalEditor, NodeKey, TextNode, ElementNode } from "lexical";
import { useCallback, useEffect, useState, useContext, useRef, Dispatch, SetStateAction } from "react";

import { $createCodeNode, $isCodeNode, CODE_LANGUAGE_FRIENDLY_NAME_MAP, CODE_LANGUAGE_MAP, getLanguageFriendlyName } from "@lexical/code";
import { $isLinkNode, TOGGLE_LINK_COMMAND } from "@lexical/link";
import { 
  $isListNode, 
  INSERT_CHECK_LIST_COMMAND, 
  INSERT_ORDERED_LIST_COMMAND, 
  INSERT_UNORDERED_LIST_COMMAND, 
  ListNode, 
  REMOVE_LIST_COMMAND 
} from '@lexical/list';

import { INSERT_EMBED_COMMAND } from "@lexical/react/LexicalAutoEmbedPlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $isDecoratorBlockNode } from "@lexical/react/LexicalDecoratorBlockNode";
import { INSERT_HORIZONTAL_RULE_COMMAND } from "@lexical/react/LexicalHorizontalRuleNode";
import { $createHeadingNode, $createQuoteNode, $isHeadingNode, HeadingTagType } from "@lexical/rich-text";
import { $getSelectionStyleValueForProperty, $isParentElementRTL, $patchStyleText, $selectAll, $setBlocksType } from "@lexical/selection";
import { $findMatchingParent, $getNearestBlockElementAncestorOrThrow,  $getNearestNodeOfType, mergeRegister } from "@lexical/utils";

import {
  $createParagraphNode,
  $getNodeByKey,
  $getRoot,
  $getSelection,
  $isRangeSelection,
  $isRootOrShadowRoot,
  $isParagraphNode,
  $getTextContent,
  $isLineBreakNode,
  $isTextNode,
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  COMMAND_PRIORITY_CRITICAL,
  DEPRECATED_$isGridSelection,
  FORMAT_ELEMENT_COMMAND,
  FORMAT_TEXT_COMMAND,
  INDENT_CONTENT_COMMAND,
  OUTDENT_CONTENT_COMMAND,
  REDO_COMMAND,
  SELECTION_CHANGE_COMMAND,
  UNDO_COMMAND,
} from "lexical";

import { IS_APPLE } from "../../shared/environment";

import useModal from "../../hooks/useModal";

import { $createStickyNode } from "../../nodes/StickyNode";
import DropDown, { DropDownItem } from "../../ui/DropDown";
import ColorPicker from "../../ui/ColorPicker";
import { getSelectedNode } from "../../utils/getSelectedNode";
import { sanitizeUrl } from "../../utils/url";
import { EmbedConfigs } from "../AutoEmbedPlugin";
import { INSERT_COLLAPSIBLE_COMMAND } from "../CollapsiblePlugin";
import { InsertEquationDialog } from "../EquationsPlugin";
import { INSERT_EXCALIDRAW_COMMAND } from "../ExcalidrawPlugin";
import { InsertImageDialog } from '../ImagesPlugin';
import { InsertPollDialog } from "../PollPlugin";

import paragraphIcon from "../../images/icons/text-paragraph.svg"
import h1Icon from "../../images/icons/type-h1.svg";
import h2Icon from "../../images/icons/type-h2.svg";
import h3Icon from "../../images/icons/type-h3.svg";
import checkIcon from "../../images/icons/square-check.svg";
import quoteIcon from "../../images/icons/chat-square-quote.svg";
import codeBlockIcon from "../../images/icons/code.svg";

import { NoteSettingsCtx } from "../../../../../../context/NoteSettingsCtx";

const blockTypeToBlockName = {
  bullet: "Bulleted List",
  check: "Check List",
  code: "Code Block",
  h1: "Heading 1",
  h2: "Heading 2",
  h3: "Heading 3",
  h4: "Heading 4",
  h5: "Heading 5",
  h6: "Heading 6",
  number: "Numbered List",
  paragraph: "Normal",
  quote: "Quote",
};

function getCodeLanguageOptions(): [string, string][] {
  const options: [string, string][] = [];

  for (const [lang, friendlyName] of Object.entries(
    CODE_LANGUAGE_FRIENDLY_NAME_MAP
  )) {
    options.push([lang, friendlyName]);
  }

  return options;
}

const CODE_LANGUAGE_OPTIONS = getCodeLanguageOptions();

const FONT_FAMILY_OPTIONS: [string, string][] = [
  ["Arial", "Arial"],
  ["Amatic SC", "Amatic SC"],
  ["Bangers", "Bangers"],
  ["Courier New", "Courier New"],
  ["Dancing Script", "Dancing Script"],
  ["Georgia", "Georgia"],
  ["Montserrat", "Montserrat"],
  ["Nanum Gothic Coding", "Nanum Gothic Coding"],
  ["Roboto", "Roboto"],
  ["Reenie Beanie", "Reenie Beanie"],
  ["Source Code Pro", "Source Code Pro"],
  ["Trebuchet MS", "Trebuchet MS"],
  ["Times New Roman", "Times New Roman"]
];

const FONT_SIZE_OPTIONS: [string, string][] = [
  ["8px", "8px"],
  ["9px", "9px"],
  ["10px", "10px"],
  ["11px", "11px"],
  ["12px", "12px"],
  ["14px", "14px"],
  ["18px", "18px"],
  ["24px", "24px"],
  ["30px", "30px"],
  ["36px", "36px"],
  ["48px", "48px"],
  ["60px", "60px"],
  ["72px", "72px"],
  ["96px", "96px"]
];

const fontFamilyOptionsArray = [
  "Arial", 
  "Amatic SC",
  "Bangers",
  "Courier New",
  "Dancing Script",
  "Georgia",
  "Montserrat",
  "Nanum Gothic Coding",
  "Roboto",
  "Reenie Beanie",
  "Source Code Pro",
  "Trebuchet MS",
  "Times New Roman"
];

function dropDownActiveClass(active: boolean) {
  if (active) return "!bg-gray-700";
  else return "";
}

function BlockFormatDropDown({
  editor,
  blockType,
  disabled = false,
}: {
  blockType: keyof typeof blockTypeToBlockName;
  editor: LexicalEditor;
  disabled?: boolean;
}): JSX.Element {
  const formatParagraph = () => {
    if (blockType !== "paragraph") {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection) || DEPRECATED_$isGridSelection(selection)) $setBlocksType(selection, () => $createParagraphNode());
      });
    }
  };

  const formatHeading = (headingSize: HeadingTagType) => {
    if (blockType !== headingSize) {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection) || DEPRECATED_$isGridSelection(selection)) $setBlocksType(selection, () => $createHeadingNode(headingSize));
      });
    }
  };

  // const formatBulletList = () => {
  //   if (blockType !== "bullet") editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
  //   else editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
  // };

  const formatCheckList = () => {
    if (blockType !== "check") editor.dispatchCommand(INSERT_CHECK_LIST_COMMAND, undefined);
    else editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
  };

  // const formatNumberedList = () => {
  //   if (blockType !== "number") editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined); 
  //   else editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
  // };

  const formatQuote = () => {
    if (blockType !== "quote") {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection) || DEPRECATED_$isGridSelection(selection)) $setBlocksType(selection, () => $createQuoteNode());
      });
    }
  };

  const formatCode = () => {
    if (blockType !== "code") {
      editor.update(() => {
        let selection = $getSelection();

        if ($isRangeSelection(selection) ||DEPRECATED_$isGridSelection(selection)) {
          if (selection.isCollapsed()) $setBlocksType(selection, () => $createCodeNode());
          else {
            const textContent = selection.getTextContent();
            const codeNode = $createCodeNode();

            selection.insertNodes([codeNode]);
            selection = $getSelection();
            if ($isRangeSelection(selection)) selection.insertRawText(textContent);
          }
        }
      });
    }
  };

  return (
    <DropDown
      disabled={disabled}
      modalClassName="w-40"
      buttonClassName="toolbar-item block-controls"
      buttonIconClassName={"icon comp-picker block-type " + blockType}
      buttonLabel={blockTypeToBlockName[blockType]}
      buttonAriaLabel="Formatting options for text style"
    >
      <DropDownItem 
        className={`!w-[85%] mx-auto item hover:!bg-gray-700 my-1 !py-3 ${dropDownActiveClass(blockType === "paragraph")}`} 
        onClick={formatParagraph}
      >
        <div className="flex flex-row ml-10">
          <img className="icon paragraph comp-picker" src={paragraphIcon} />
          <span className="text ">Normal</span>
        </div>
      </DropDownItem>
      <DropDownItem 
        className={"!w-[85%] mx-auto item hover:!bg-gray-700 my-1 !py-3 " + dropDownActiveClass(blockType === "h1")} 
        onClick={() => formatHeading("h1")}
      >
        <div className="flex flex-row ml-10">
          <img className="icon comp-picker" src={h1Icon} />
          <span className="text">Heading 1</span>
        </div>
      </DropDownItem>
      <DropDownItem 
        className={"!w-[85%] mx-auto item hover:!bg-gray-700 item my-1 !py-3 " + dropDownActiveClass(blockType === "h2")} 
        onClick={() => formatHeading("h2")}
      >
        <div className="flex flex-row ml-10">
          <img className="icon comp-picker" src={h2Icon} />
          <span className="text">Heading 2</span>
        </div>
      </DropDownItem>
      <DropDownItem 
        className={"!w-[85%] mx-auto item hover:!bg-gray-700 item my-1 !py-3 " + dropDownActiveClass(blockType === "h3")} 
        onClick={() => formatHeading("h3")}
      >
        <div className="flex flex-row ml-10">
          <img className="icon comp-picker" src={h3Icon} />
          <span className="text">Heading 3</span>
        </div>
      </DropDownItem>
      {/* <DropDownItem className={"item " + dropDownActiveClass(blockType === "bullet")} onClick={formatBulletList}>
        <i className="icon bullet-list comp-picker" />
        <span className="text">Bullet List</span>
      </DropDownItem>
      <DropDownItem className={"item " + dropDownActiveClass(blockType === "number")} onClick={formatNumberedList}>
        <i className="icon numbered-list comp-picker" />
        <span className="text">Numbered List</span>
      </DropDownItem> */}
      {/* <div className="border border-transparent border-t-gray-700 mx-3 my-1"/> */}
      <DropDownItem 
        className={"!w-[85%] mx-auto item hover:!bg-gray-700 item my-1 !py-3 " + dropDownActiveClass(blockType === "check")} 
        onClick={formatCheckList}
      >
        <div className="flex flex-row ml-10">
          <img className="icon comp-picker" src={checkIcon} />
          <span className="text">Check List</span>
        </div>
      </DropDownItem>
      <DropDownItem 
        className={"!w-[85%] mx-auto item hover:!bg-gray-700 item my-1 !py-3 " + dropDownActiveClass(blockType === "quote")} 
        onClick={formatQuote}
      >
        <div className="flex flex-row ml-10">
          <img className="icon quote comp-picker" src={quoteIcon} />
          <span className="text">Quote</span>
        </div>
      </DropDownItem>
      <DropDownItem 
        className={"!w-[85%] mx-auto item hover:!bg-gray-700 item my-1 !py-3 " + dropDownActiveClass(blockType === "code")} 
        onClick={formatCode}
      >
        <div className="flex flex-row ml-10">
          <img className="icon code comp-picker" src={codeBlockIcon}/>
          <span className="text">Code Block</span>
        </div>
      </DropDownItem>
    </DropDown>
  );
}

function Divider(): JSX.Element {
  return <div className="divider !my-auto !bg-gray-500" />;
}

function FontDropDown({
  editor,
  value,
  style,
  disabled = false,
  isFontSizeModal,
  setLastSelectedFontFamily
}: {
  editor: LexicalEditor;
  value: string;
  style: string;
  disabled?: boolean;
  isFontSizeModal?: boolean;
  setLastSelectedFontFamily?: Dispatch<SetStateAction<string>>;
}): JSX.Element {

  const handleClick = useCallback(
    (option: string, styleType?: string) => {
      if(!isFontSizeModal && setLastSelectedFontFamily) setLastSelectedFontFamily(option);
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          $patchStyleText(selection, {
            [styleType ? styleType : style]: option,
          });
        }
      });
    },
    [editor, style]
  );

  const parseFontSizeToNumber = (fontSize: string) => {
    const reg = new RegExp(/^\d+/, "gi");
    const getFontSize = reg.exec(fontSize);
    return getFontSize && getFontSize[0]
  }
      
  const userAgent = navigator.userAgent;
  let browserName;
  
  if(userAgent.match(/chrome|chromium|crios/i)) browserName = "chrome";
  else if(userAgent.match(/firefox|fxios/i)) browserName = "firefox";

  return (
    <DropDown
      modalClassName={`
        !max-h-[338px] overflow-scroll scrollbar-track-transparent scrollbar-thumb-gray-900
        ${browserName === "chrome" ? "scrollbar-thin" : "scrollbar"}
        ${isFontSizeModal && "!w-16 xxs:!w-[58px] overflow-x-hidden"}
      `}
      disabled={disabled}
      buttonClassName={`toolbar-item  ` + style}
      buttonLabelClassName={`${isFontSizeModal && "!pl-[11px] pr-1"}`}
      buttonLabel={isFontSizeModal ? parseFontSizeToNumber(value) as string : value}
      buttonIconClassName={!isFontSizeModal ? "icon block-type font-family comp-picker" : ""}
      useCustomButton={isFontSizeModal ? true : false}
    >
      {(!isFontSizeModal ? FONT_FAMILY_OPTIONS : FONT_SIZE_OPTIONS).map(
        ([option, text]) => (
          <DropDownItem
            className={`item !pb-0 !pt-0 mx-auto ${style !== "font-family" && "!w-14"} `}
            onClick={() => handleClick(option)}
            key={option}
          >
            <div 
              className={`bg-gray-800 hover:!bg-gray-700 my-1 rounded-lg
                ${!isFontSizeModal ? "!mx-2 w-screen" : "!w-[50px]"}
                ${dropDownActiveClass(value === option)}
              `}
            >
              <p 
                style={{fontFamily: option}} 
                className={`text-start py-[14px] px-2 ${isFontSizeModal && "!text-center "}`}
              >
                {isFontSizeModal ? parseFontSizeToNumber(text) : text}
              </p>
            </div>
          </DropDownItem>
        )
      )}
    </DropDown>
  );
}

export default function ToolbarPlugin() {
  const default_font_style = 'Roboto';

  const [editor] = useLexicalComposerContext();
  
  const [modal, showModal] = useModal();

  const [activeEditor, setActiveEditor] = useState(editor);
  const [blockType, setBlockType] = useState<keyof typeof blockTypeToBlockName>('paragraph');
  const [selectedElementKey, setSelectedElementKey] = useState<NodeKey | null>(null);
  const [fontSize, setFontSize] = useState<string>('14px');
  const [fontColor, setFontColor] = useState<string>('#000');
  const [bgColor, setBgColor] = useState<string>('#374151');
  const [fontFamily, setFontFamily] = useState<string>(default_font_style);
  const [isLink, setIsLink] = useState(false);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const [isSubscript, setIsSubscript] = useState(false);
  const [isSuperscript, setIsSuperscript] = useState(false);
  const [isCode, setIsCode] = useState(false);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [isRTL, setIsRTL] = useState(false);
  const [codeLanguage, setCodeLanguage] = useState<string>('');
  const [isEditable, setIsEditable] = useState(() => editor.isEditable());
  const [screenSize, setScreenSize] = useState<number>(window.innerWidth);
  const [lastSelectedFontFamily, setLastSelectedFontFamily] = useState('');

  const prevNodeKey = useRef<null | string>(null);
  const prevSelection = useRef<string | null>(null);
  const prevElementKey = useRef<null | string>(null);
  const prevNodeType = useRef<null | TextNode | ElementNode>(null);
  
  const handleUpdateFont = (fontFamily: string) => {
    editor.update(() => {
      const selection = $getSelection();

      if ($isRangeSelection(selection)) {
        const node = getSelectedNode(selection);

        if(node.__type === 'text' && node.__key !== prevElementKey.current) {
          if(node.__text.length === 1) selection.focus.offset = 0;

          $patchStyleText(selection, {
            ["font-family"] : fontFamily,
          });

          if(selection.focus.offset !== selection.anchor.offset) {
            selection.focus.offset = selection.focus.offset + 1;
            selection.anchor.offset = selection.anchor.offset + 1;
          }
          
        }

        prevElementKey.current = node.__key;
        prevNodeType.current = node;
      }
    });
  };

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();

    if ($isRangeSelection(selection)) {
      const anchorNode = selection.anchor.getNode();

      let element =
        anchorNode.getKey() === "root"
          ? anchorNode
          : $findMatchingParent(anchorNode, (e) => {
              const parent = e.getParent();
              return parent !== null && $isRootOrShadowRoot(parent);
            });

      if (element === null) element = anchorNode.getTopLevelElementOrThrow();

      const elementKey = element.getKey();
      const elementDOM = activeEditor.getElementByKey(elementKey);

      // Update text format
      setIsBold(selection.hasFormat("bold"));
      setIsItalic(selection.hasFormat("italic"));
      setIsUnderline(selection.hasFormat("underline"));
      setIsStrikethrough(selection.hasFormat("strikethrough"));
      setIsSubscript(selection.hasFormat("subscript"));
      setIsSuperscript(selection.hasFormat("superscript"));
      setIsCode(selection.hasFormat("code"));
      setIsRTL($isParentElementRTL(selection));

      // Update links
      const node = getSelectedNode(selection);
      const parent = node.getParent();

      if ($isLinkNode(parent) || $isLinkNode(node)) setIsLink(true);
      else setIsLink(false);

      if (elementDOM !== null) {
        setSelectedElementKey(elementKey);

        if ($isListNode(element)) {
          const parentList = $getNearestNodeOfType<ListNode>(anchorNode, ListNode);
          const type = parentList ? parentList.getListType() : element.getListType();
          setBlockType(type);
        } else {
          const type = $isHeadingNode(element) ? element.getTag() : element.getType();
          if (type in blockTypeToBlockName) setBlockType(type as keyof typeof blockTypeToBlockName);

          if ($isCodeNode(element)) {
            const language = element.getLanguage();
            setCodeLanguage(language ? CODE_LANGUAGE_MAP[language] || language : "");
            return;
          }
        }
      }

      // Handle buttons
      if(!prevNodeKey || prevNodeKey.current !== anchorNode.getKey()) {
        setFontSize($getSelectionStyleValueForProperty(selection, "font-size", fontSize));
      }

      const findPosition = new RegExp(/(font-family:.+?);/, "g");
      const extractString = findPosition.exec(selection.style);

      const selectionFontStyle = extractString ? extractString[1].slice(13, extractString[1].length) : '';

      if(selectionFontStyle || lastSelectedFontFamily) {
        if(selectionFontStyle) {
          handleUpdateFont(selectionFontStyle);
          setFontFamily(selectionFontStyle);
        }
        else {
          const condition = prevSelection.current ? prevSelection.current : lastSelectedFontFamily;
          handleUpdateFont(condition);
          setFontFamily(condition);
        }
      }

      setFontColor($getSelectionStyleValueForProperty(selection, "color", "#000"));
      setBgColor($getSelectionStyleValueForProperty(selection, "background-color", "#374151"));

      prevNodeKey.current = anchorNode.getKey();
      if(selection._cachedNodes) {
        const selecStyle = selection.style;

        if(!selecStyle && prevSelection.current) {
          handleUpdateFont(prevSelection.current);
          setFontFamily(prevSelection.current);
        }
    
        if(selectionFontStyle) prevSelection.current = selectionFontStyle;
        else prevSelection.current = !selecStyle && lastSelectedFontFamily ? lastSelectedFontFamily : default_font_style;

        if(!lastSelectedFontFamily.length && selectionFontStyle.length > 0) {
          setLastSelectedFontFamily(selectionFontStyle);
        }
      }
    }
  }, [activeEditor, lastSelectedFontFamily]);

  useEffect(() => {
    return editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      (_payload, newEditor) => {
        updateToolbar();
        setActiveEditor(newEditor);
        return false;
      },
      COMMAND_PRIORITY_CRITICAL
    );
  }, [editor, updateToolbar]);

  useEffect(() => {
    return mergeRegister(
      editor.registerEditableListener((editable) => setIsEditable(editable)),
      activeEditor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => updateToolbar());
      }),
      activeEditor.registerCommand(
        CAN_UNDO_COMMAND,
        (payload) => {
          setCanUndo(payload);
          return false;
        },
        COMMAND_PRIORITY_CRITICAL
      ),
      activeEditor.registerCommand(
        CAN_REDO_COMMAND,
        (payload) => {
          setCanRedo(payload);
          return false;
        },
        COMMAND_PRIORITY_CRITICAL
      )
    );
  }, [activeEditor, editor, updateToolbar]);

  const applyStyleText = useCallback(
    (styles: Record<string, string>) => {
      activeEditor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) $patchStyleText(selection, styles);
      });
    },
    [activeEditor],
  );

  const clearFormatting = useCallback(() => {
    activeEditor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $selectAll(selection);
        selection.getNodes().forEach((node: any) => {
          if ($isTextNode(node)) {
            node.setFormat(0);
            node.setStyle('');
            $getNearestBlockElementAncestorOrThrow(node).setFormat('');
          }

          if ($isDecoratorBlockNode(node)) node.setFormat('');
        });
      }
    });
  }, [activeEditor]);

  const onFontColorSelect = useCallback(
    (value: string) => {applyStyleText({color: value})},
    [applyStyleText]
  );

  const onBgColorSelect = useCallback(
    (value: string) => {applyStyleText({'background-color': value})},
    [applyStyleText]
  );

  const insertLink = useCallback(() => {
    if (!isLink) editor.dispatchCommand(TOGGLE_LINK_COMMAND, sanitizeUrl('https://'));
    else editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
  }, [editor, isLink]);

  const onCodeLanguageSelect = useCallback(
    (value: string) => {
      activeEditor.update(() => {
        if (selectedElementKey !== null) {
          const node = $getNodeByKey(selectedElementKey);
          if ($isCodeNode(node)) node.setLanguage(value);
        }
      });
    },
    [activeEditor, selectedElementKey],
  );

  // const { noteSettings: { expanded } } = useContext(NoteSettingsCtx) as any;
  const reg = new RegExp(/^\d+/, "gi");
  const getFontSize = reg.exec(fontSize);

  const updateFontSize = useCallback(
    (option: string) => {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          $patchStyleText(selection, {
            "font-size": option
          });
        }
      });
    },
    [editor]
  );

  const handleIncrementFontSizeButton = () => {
    if(getFontSize) {
      const parsedFontSize = parseInt(getFontSize[0]);
      if(parsedFontSize < 100) {
        setFontSize((parsedFontSize + 1) + 'px');
        updateFontSize((parsedFontSize + 1) + 'px');
      }
    }
  }

  const handleDecrementFontSizeButton = () => {
    if(getFontSize) {
      const parsedFontSize = parseInt(getFontSize[0]);
      if(parsedFontSize > 1) {       
        setFontSize((parsedFontSize - 1) + 'px');
        updateFontSize((parsedFontSize - 1) + 'px');
      }
    }
  }
  
  //for some reason, typescript is throwing an error if this code is not set as any.
  //it's saying that the checkVisibility method does not exist in type HTMLElement, which is not true, since HTMLElement extends Element.
  const getNavbar = document.getElementById("pc-navbar") as any;

  addEventListener("resize", () => setTimeout(() => {
    setScreenSize(!getNavbar?.checkVisibility() ? window.innerWidth : window.innerWidth - 442);
  }, 500));

  return (
    <div 
      className="toolbar !h-[2.50rem] mt-[0.02rem] !bg-gray-700 !text-gray-50 border-b border-gray-600 border-t-0 border-t-transparent"
      style={{ width: screenSize }}
    >
      <button
        disabled={!canUndo || !isEditable}
        onClick={() => activeEditor.dispatchCommand(UNDO_COMMAND, undefined)}
        title={IS_APPLE ? "Undo (⌘Z)" : "Undo (Ctrl+Z)"}
        className="toolbar-item spaced"
        aria-label="Undo"
      >
        <i className="format undo" />
      </button>
      <button
        disabled={!canRedo || !isEditable}
        onClick={() => activeEditor.dispatchCommand(REDO_COMMAND, undefined)}
        title={IS_APPLE ? "Redo (⌘Y)" : "Redo (Ctrl+Y)"}
        className="toolbar-item"
        aria-label="Redo"
      >
        <i className="format redo" />
      </button>
      <Divider />
      {blockType in blockTypeToBlockName && activeEditor === editor && (
        <>
          <BlockFormatDropDown 
            disabled={!isEditable} 
            blockType={blockType} 
            editor={editor}
          />
          <Divider />
        </>
      )}
      {blockType === "code" ? (
        <DropDown
          disabled={!isEditable}
          buttonClassName="toolbar-item code-language"
          buttonLabel={getLanguageFriendlyName(codeLanguage)}
          buttonAriaLabel="Select language"
        >
          {CODE_LANGUAGE_OPTIONS.map(([value, name]) => {
            return (
              <DropDownItem
                className={`item ${dropDownActiveClass(value === codeLanguage)}`}
                onClick={() => onCodeLanguageSelect(value)}
                key={value}
              >
                <span className="text">{name}</span>
              </DropDownItem>
            );
          })}
        </DropDown>
      ) : (
        <>
          <FontDropDown
            disabled={!isEditable} 
            style={"font-family"} 
            value={fontFamily} 
            editor={editor} 
            setLastSelectedFontFamily={setLastSelectedFontFamily}
          />
          <Divider />
          <div className="mx-1 flex flex-row space-x-2">
            <button 
              onClick={() => handleIncrementFontSizeButton()}
              className="w-8 h-8 my-auto hover:bg-[#dfe8fa4d] rounded-lg"
            > 
              +
            </button>
            <FontDropDown
              isFontSizeModal={true}
              disabled={!isEditable} 
              style={"font-size"} 
              value={fontSize} 
              editor={editor}
            />
            <button 
              onClick={() => handleDecrementFontSizeButton()}
              className="w-8 h-8 my-auto hover:bg-[#dfe8fa4d] rounded-lg"
            > 
              -
            </button>
          </div>
          <Divider />
          <button
            disabled={!isEditable}
            onClick={() => activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")}
            className={"toolbar-item spaced " + (isBold ? "active" : "")}
            title={IS_APPLE ? "Bold (⌘B)" : "Bold (Ctrl+B)"}
            aria-label={`Format text as bold. Shortcut: ${IS_APPLE ? "⌘B" : "Ctrl+B"}`}
          >
            <i className="format bold" />
          </button>
          <button
            disabled={!isEditable}
            onClick={() => activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic")}
            className={"toolbar-item spaced " + (isItalic ? "active" : "")}
            title={IS_APPLE ? "Italic (⌘I)" : "Italic (Ctrl+I)"}
            aria-label={`Format text as italics. Shortcut: ${IS_APPLE ? "⌘I" : "Ctrl+I"}`}
          >
            <i className="format italic" />
          </button>
          <button
            disabled={!isEditable}
            onClick={() => activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline")}
            className={"toolbar-item spaced " + (isUnderline ? "active" : "")}
            title={IS_APPLE ? "Underline (⌘U)" : "Underline (Ctrl+U)"}
            aria-label={`Format text to underlined. Shortcut: ${IS_APPLE ? "⌘U" : "Ctrl+U"}`}
          >
            <i className="format underline" />
          </button>
          <button
            disabled={!isEditable}
            onClick={() => activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, "code")}
            className={"toolbar-item spaced " + (isCode ? "active" : "")}
            title="Insert code block"
            aria-label="Insert code block"
          >
            <i className="format code" />
          </button>
          <button
            disabled={!isEditable}
            onClick={insertLink}
            className={"toolbar-item spaced " + (isLink ? "active" : "")}
            aria-label="Insert link"
            title="Insert link"
          >
            <i className="format link" />
          </button>
          <ColorPicker
            disabled={!isEditable}
            buttonClassName="toolbar-item color-picker"
            buttonAriaLabel="Formatting text color"
            buttonIconClassName="icon font-color"
            color={fontColor}
            onChange={onFontColorSelect}
            title="text color"
          />
          <ColorPicker
            disabled={!isEditable}
            buttonClassName="toolbar-item color-picker"
            buttonAriaLabel="Formatting background color"
            buttonIconClassName="icon bg-color comp-picker"
            color={bgColor}
            onChange={onBgColorSelect}
            title="bg color"
          />
          <DropDown
            disabled={!isEditable}
            buttonClassName="toolbar-item spaced"
            buttonLabel=""
            buttonAriaLabel="Formatting options for additional text styles"
            buttonIconClassName="icon dropdown-more comp-picker"
          >
            <DropDownItem
              onClick={() => activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND,"strikethrough")}
              className={"item " + dropDownActiveClass(isStrikethrough)}
              title="Strikethrough"
              aria-label="Format text with a strikethrough"
            >
              <i className="icon strikethrough comp-picker" />
              <span className="text">Strikethrough</span>
            </DropDownItem>
            <DropDownItem
              onClick={() => activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, "subscript")}
              className={"item " + dropDownActiveClass(isSubscript)}
              title="Subscript"
              aria-label="Format text with a subscript"
            >
              <i className="icon subscript comp-picker" />
              <span className="text">Subscript</span>
            </DropDownItem>
            <DropDownItem
              onClick={() => activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, "superscript")}
              className={"item " + dropDownActiveClass(isSuperscript)}
              title="Superscript"
              aria-label="Format text with a superscript"
            >
              <i className="icon superscript comp-picker" />
              <span className="text">Superscript</span>
            </DropDownItem>
            <DropDownItem onClick={clearFormatting} className="item" title="Clear text formatting" aria-label="Clear all text formatting">
              <i className="icon clear comp-picker" />
              <span className="text">Clear Formatting</span>
            </DropDownItem>
          </DropDown>
          <Divider />
          <DropDown
            disabled={!isEditable}
            buttonClassName="toolbar-item spaced"
            buttonLabel="Insert"
            buttonAriaLabel="Insert specialized editor node"
            buttonIconClassName="icon plus comp-picker"
          >
            <DropDownItem onClick={() => activeEditor.dispatchCommand(INSERT_HORIZONTAL_RULE_COMMAND, undefined)} className="item">
              <i className="icon horizontal-rule comp-picker" />
              <span className="text">Horizontal Rule</span>
            </DropDownItem>
            <DropDownItem
              onClick={() => activeEditor.dispatchCommand(INSERT_EXCALIDRAW_COMMAND, undefined)}
              className="item">
              <i className="icon diagram-2 comp-picker" />
              <span className="text">Excalidraw</span>
            </DropDownItem>
            <DropDownItem
              onClick={() => showModal('Insert Image', (onClose) => <InsertImageDialog activeEditor={activeEditor} onClose={onClose} />)}
              className="item">
              <i className="icon image comp-picker" />
              <span className="text">Image</span>
            </DropDownItem>
            <DropDownItem
              onClick={() => showModal("Insert Poll", (onClose) => <InsertPollDialog activeEditor={activeEditor} onClose={onClose} />)}
              className="item"
            >
              <i className="icon poll comp-picker" />
              <span className="text">Poll</span>
            </DropDownItem>
            <DropDownItem
              onClick={() => showModal("Insert Equation", (onClose) => <InsertEquationDialog activeEditor={activeEditor} onClose={onClose} />)}
              className="item"
            >
              <i className="icon equation comp-picker" />
              <span className="text">Equation</span>
            </DropDownItem>
            <DropDownItem
              onClick={() => {
                editor.update(() => {
                  const root = $getRoot();
                  const stickyNode = $createStickyNode(0, 0);
                  root.append(stickyNode);
                });
              }}
              className="item">
              <i className="icon sticky comp-picker" />
              <span className="text">Sticky Note</span>
            </DropDownItem>
            <DropDownItem onClick={() => editor.dispatchCommand(INSERT_COLLAPSIBLE_COMMAND, undefined)} className="item">
              <i className="icon caret-right comp-picker" />
              <span className="text">Collapsible container</span>
            </DropDownItem>
            {EmbedConfigs.map((embedConfig) => (
              <DropDownItem
                key={embedConfig.type}
                onClick={() => activeEditor.dispatchCommand(INSERT_EMBED_COMMAND, embedConfig.type)}
                className="item"
              >
                {embedConfig.icon}
                <span className="text">{embedConfig.contentName}</span>
              </DropDownItem>
            ))}
          </DropDown>
        </>
      )}
      <Divider />
      <DropDown
        disabled={!isEditable}
        buttonLabel="Align"
        buttonIconClassName="icon left-align comp-picker"
        buttonClassName="toolbar-item spaced alignment"
        buttonAriaLabel="Formatting options for text alignment"
      >
        <DropDownItem onClick={() => activeEditor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "left")} className="item">
          <i className="icon left-align comp-picker" />
          <span className="text">Left Align</span>
        </DropDownItem>
        <DropDownItem onClick={() => activeEditor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "center")} className="item">
          <i className="icon center-align comp-picker" />
          <span className="text">Center Align</span>
        </DropDownItem>
        <DropDownItem onClick={() => activeEditor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "right")} className="item">
          <i className="icon right-align comp-picker" />
          <span className="text">Right Align</span>
        </DropDownItem>
        <DropDownItem onClick={() => activeEditor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "justify")} className="item">
          <i className="icon justify-align comp-picker" />
          <span className="text">Justify Align</span>
        </DropDownItem>
        <div className="my-2 px-1">
          <Divider />
        </div>
        <DropDownItem onClick={() => activeEditor.dispatchCommand(OUTDENT_CONTENT_COMMAND, undefined)} className="item">
          <i className={"icon comp-picker " + (isRTL ? "indent" : "outdent")} />
          <span className="text">Outdent</span>
        </DropDownItem>
        <DropDownItem onClick={() => activeEditor.dispatchCommand(INDENT_CONTENT_COMMAND, undefined)} className="item">
          <i className={"icon comp-picker " + (isRTL ? "outdent" : "indent")} />
          <span className="text">Indent</span>
        </DropDownItem>
      </DropDown>

      {modal}
    </div>
  );
}