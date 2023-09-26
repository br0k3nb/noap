import type { LexicalEditor, NodeKey } from "lexical";
import type { LanguageNameWithIcon } from "../../../../../../datasets/code_language_maps";

import { useCallback, useEffect, useState, useRef, Dispatch, SetStateAction } from "react";

import { $createCodeNode, $isCodeNode, getLanguageFriendlyName, $isCodeHighlightNode,  } from "@lexical/code";
import { $isLinkNode, TOGGLE_LINK_COMMAND } from "@lexical/link";
import { 
  $isListNode, 
  INSERT_ORDERED_LIST_COMMAND, 
  INSERT_UNORDERED_LIST_COMMAND, 
  ListNode,
  REMOVE_LIST_COMMAND,
  INSERT_CHECK_LIST_COMMAND
} from '../../nodes/ListNode';

import { INSERT_EMBED_COMMAND } from "@lexical/react/LexicalAutoEmbedPlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $isDecoratorBlockNode } from "@lexical/react/LexicalDecoratorBlockNode";
import { INSERT_HORIZONTAL_RULE_COMMAND } from "@lexical/react/LexicalHorizontalRuleNode";
import { $createHeadingNode, $createQuoteNode, $isHeadingNode, HeadingTagType } from "@lexical/rich-text";
import { 
  $getSelectionStyleValueForProperty,
  $patchStyleText,
  $selectAll, 
  $setBlocksType 
} from "@lexical/selection";
import { 
  $findMatchingParent, 
  $getNearestBlockElementAncestorOrThrow,  
  $getNearestNodeOfType, 
  mergeRegister
} from "@lexical/utils";

import {
  $createParagraphNode,
  $getNodeByKey,
  $getSelection,
  $isRangeSelection,
  $isRootOrShadowRoot,
  $isTextNode,
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  COMMAND_PRIORITY_CRITICAL,
  DEPRECATED_$isGridSelection,
  INSERT_PARAGRAPH_COMMAND,
  FORMAT_ELEMENT_COMMAND,
  FORMAT_TEXT_COMMAND,
  INDENT_CONTENT_COMMAND,
  OUTDENT_CONTENT_COMMAND,
  REDO_COMMAND,
  SELECTION_CHANGE_COMMAND,
  UNDO_COMMAND,
  LexicalNode
} from "lexical";

import { IS_APPLE } from "../../shared/environment";

import useModal from "../../hooks/useModal";

// import { $createStickyNode } from "../../nodes/StickyNode";
import DropDown, { DropDownItem } from "../../ui/DropDown";
import ColorPicker from "../../ui/ColorPicker";
import { getSelectedNode } from "../../utils/getSelectedNode";
import { sanitizeUrl } from "../../utils/url";
import { EmbedConfigs } from "../AutoEmbedPlugin";
import { INSERT_COLLAPSIBLE_COMMAND } from "../CollapsiblePlugin";
import { InsertEquationDialog } from "../EquationsPlugin";
import { INSERT_EXCALIDRAW_COMMAND } from "../ExcalidrawPlugin";
import { InsertImageDialog } from '../ImagesPlugin';
// import { InsertPollDialog } from "../PollPlugin";

import paragraphIcon from "../../images/icons/text-paragraph.svg"
import h1Icon from "../../images/icons/type-h1.svg";
import h2Icon from "../../images/icons/type-h2.svg";
import h3Icon from "../../images/icons/type-h3.svg";
import checkIcon from "../../images/icons/square-check.svg";
import quoteIcon from "../../images/icons/chat-square-quote.svg";
import codeBlockIcon from "../../images/icons/code.svg";
import bulletListIcon from '../../images/icons/list-ul.svg';
import orderdListIcon from '../../images/icons/list-ol.svg';
import subscriptIcon from '../../images/icons/type-subscript.svg';
import superscriptIcon from '../../images/icons/type-superscript.svg';
import strikethroughIcon from '../../images/icons/type-strikethrough.svg';
import clearFormattingIcon from '../../images/icons/trash.svg';
import horizontalRuleIcon from '../../images/icons/horizontal-rule.svg';
import excalidrawIcon from '../../images/icons/diagram-2.svg';
import imageIcon from '../../images/icons/file-image.svg';
// import poolIcon from '../../images/icons/card-checklist.svg';
import equationIcon from '../../images/icons/plus-slash-minus.svg';
// import stickyIcon from '../../images/icons/sticky.svg';
import collapsibleIcon from '../../images/icons/caret-right-fill.svg';
import leftAlignIcon from '../../images/icons/text-left.svg';
import centerAlignIcon from '../../images/icons/text-center.svg';
import rightAlignIcon from '../../images/icons/text-right.svg';
import justifyAlignIcon from '../../images/icons/justify.svg';
import outdentIcon from '../../images/icons/outdent.svg';
import indentIcon from '../../images/icons/indent.svg';
import twitterIcon from '../../images/icons/tweet.svg';
import youtubeIcon from '../../images/icons/youtube.svg';
import figmaIcon from '../../images/icons/figma.svg';

import CODE_LANGUAGE_FRIENDLY_NAME_MAP, { CODE_LANGUAGE_MAP } from '../../../../../../datasets/code_language_maps';
import useUpdateViewport from "../../../../../../hooks/useUpdateViewport";
import useUserData from "../../../../../../hooks/useUserData";

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

function getCodeLanguageOptions(): [string, LanguageNameWithIcon][] {
  const options: [string, LanguageNameWithIcon][] = [];

  for (const [lang, friendlyName] of Object.entries(CODE_LANGUAGE_FRIENDLY_NAME_MAP)) {
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
  ["96px", "96px"],
  ["100px", "100px"]
];

function dropDownActiveClass(active: boolean) {
  if (active) return "!bg-[#b3b3b3] dark:!bg-[#404040]";
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

  const formatBulletList = () => {
    if (blockType !== "bullet") editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
    else editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
  };

  const formatCheckList = () => {
    if (blockType !== "check") editor.dispatchCommand(INSERT_CHECK_LIST_COMMAND, undefined);
    else editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
  };

  const formatNumberedList = () => {
    if (blockType !== "number") editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined); 
    else editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
  };

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

  const default_dropdown_item_classname = "rounded-lg !w-[9.90rem] hover:!bg-[#cacaca] dark:hover:!bg-[#323232] !mt-[1px] !py-[11px]";

  const userAgent = navigator.userAgent;
  let browserName;
  
  if(userAgent.match(/chrome|chromium|crios/i)) browserName = "chrome";
  else if(userAgent.match(/firefox|fxios/i)) browserName = "firefox";

  const { userData: { settings: { theme } } } = useUserData();

  return (
    <DropDown
      disabled={disabled}
      modalClassName={`
        w-44 h-72 overflow-y-scroll px-2 scrollbar-track-transparent dark:scrollbar-thumb-gray-500 scrollbar-thumb-gray-800 
        ${browserName === "chrome" ? "scrollbar-thin" : "scrollbar"}
      `}
      buttonClassName="toolbar-item block-controls"
      buttonIconClassName={`icon ${theme === 'dark' && "comp-picker"} ${blockType}`}
      buttonLabel={blockTypeToBlockName[blockType]}
    >
      <div className="my-2">
        <DropDownItem 
          className={default_dropdown_item_classname + " " + dropDownActiveClass(blockType === "paragraph")} 
          onClick={formatParagraph}
        >
          <div className="flex flex-row space-x-2 ml-3">
            <img className={`w-[18px] h-5 paragraph ${theme === 'dark' && "comp-picker"}`}src={paragraphIcon} />
            <span className="text-[15px] text-gray-900 dark:text-gray-300">Normal</span>
          </div>
        </DropDownItem>
        <div className="h-[1px] border border-transparent border-t-gray-600 w-[9.40rem] mx-auto" />
        <DropDownItem 
          className={default_dropdown_item_classname + " " + dropDownActiveClass(blockType === "h1")} 
          onClick={() => formatHeading("h1")}
        >
          <div className="flex flex-row space-x-2 ml-3">
            <img className={`w-[19px] h-5 mt-[1.5px]  ${theme === 'dark' && "comp-picker"}`} src={h1Icon} />
            <span className="text-[15px] text-gray-900 dark:text-gray-300">Heading 1</span>
          </div>
        </DropDownItem>
        <div className="h-[1px] border border-transparent border-t-gray-600 w-[9.30rem] mx-auto" />
        <DropDownItem 
          className={default_dropdown_item_classname + " " + dropDownActiveClass(blockType === "h2")} 
          onClick={() => formatHeading("h2")}
        >
          <div className="flex flex-row space-x-2 ml-3">
            <img className={`w-[19px] h-5 mt-[1.5px] ${theme === 'dark' && "comp-picker"}`} src={h2Icon} />
            <span className="text-[15px] text-gray-900 dark:text-gray-300">Heading 2</span>
          </div>
        </DropDownItem>
        <div className="h-[1px] border border-transparent border-t-gray-600 w-[9.30rem] mx-auto" />
        <DropDownItem 
          className={default_dropdown_item_classname + " " + dropDownActiveClass(blockType === "h3")} 
          onClick={() => formatHeading("h3")}
        >
          <div className="flex flex-row space-x-2 ml-3">
            <img className={`w-[19px] h-5 mt-[1.5px] ${theme === 'dark' && "comp-picker"}`} src={h3Icon} />
            <span className="text-[15px] text-gray-900 dark:text-gray-300">Heading 3</span>
          </div>
        </DropDownItem>
        <div className="h-[1px] border border-transparent border-t-gray-600 w-[9.30rem] mx-auto" />
        <DropDownItem className={default_dropdown_item_classname + " " + dropDownActiveClass(blockType === "bullet")} onClick={formatBulletList}>
          <div className="flex flex-row space-x-2 ml-3">
            <img className={`w-[19px] h-5 mt-[1.5px] ${theme === 'dark' && "comp-picker"}`} src={bulletListIcon} />
            <span className="text-[15px] text-gray-900 dark:text-gray-300">Bullet List</span>
          </div>
        </DropDownItem>
        <div className="h-[1px] border border-transparent border-t-gray-600 w-[9.30rem] mx-auto" />
        <DropDownItem className={default_dropdown_item_classname + " " + dropDownActiveClass(blockType === "number")} onClick={formatNumberedList}>
          <div className="flex flex-row space-x-2 ml-3">
            <img className={`w-[19px] h-5 mt-[1.5px] ${theme === 'dark' && "comp-picker"}`} src={orderdListIcon}/>
            <span className="text-[15px] text-gray-900 dark:text-gray-300">Numbered List</span>
          </div>
        </DropDownItem>
        <div className="h-[1px] border border-transparent border-t-gray-600 w-[9.30rem] mx-auto" />
        <DropDownItem 
          className={default_dropdown_item_classname + " " + dropDownActiveClass(blockType === "check")} 
          onClick={formatCheckList}
        >
          <div className="flex flex-row space-x-2 ml-3">
            <img className={`w-[18px] h-5 mt-[1.5px] ${theme === 'dark' && "comp-picker"}`} src={checkIcon} />
            <span className="text-[15px] text-gray-900 dark:text-gray-300">Check List</span>
          </div>
        </DropDownItem>
        <div className="h-[1px] border border-transparent border-t-gray-600 w-[9.30rem] mx-auto" />
        <DropDownItem 
          className={default_dropdown_item_classname + " " + dropDownActiveClass(blockType === "quote")} 
          onClick={formatQuote}
        >
          <div className="flex flex-row space-x-2 ml-3">
            <img className={`w-[19px] h-5 mt-[1.5px] ${theme === 'dark' && "comp-picker"}`} src={quoteIcon} />
            <span className="text-[15px] text-gray-900 dark:text-gray-300">Quote</span>
          </div>
        </DropDownItem>
        <div className="h-[1px] border border-transparent border-t-gray-600 w-[9.30rem] mx-auto" />
        <DropDownItem 
          className={default_dropdown_item_classname + " " + dropDownActiveClass(blockType === "code")} 
          onClick={formatCode}
        >
          <div className="flex flex-row space-x-2 ml-3">
            <img className={`w-[19px] h-5 mt-[1.5px] ${theme === 'dark' && "comp-picker"}`} src={codeBlockIcon}/>
            <span className="text-[15px] text-gray-900 dark:text-gray-300">Code Block</span>
          </div>
        </DropDownItem>
      </div>
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
  setFontSize,
  setFontFamily,
  isFontSizeModal,
  disabled = false,
  setLastSelectedFontFamily
}: {
  editor: LexicalEditor;
  value: string;
  style: string;
  disabled?: boolean;
  isFontSizeModal?: boolean;
  setFontSize?: Dispatch<SetStateAction<string>>;
  setFontFamily?: Dispatch<SetStateAction<string>>;
  setLastSelectedFontFamily?: Dispatch<SetStateAction<string>>;
}): JSX.Element {

  const handleClick = useCallback(
    (option: string, styleType?: string) => {
      if(!isFontSizeModal && setLastSelectedFontFamily) setLastSelectedFontFamily(option);  
      if(!isFontSizeModal && setFontFamily) setFontFamily(option);
      if(isFontSizeModal && setFontSize) setFontSize(option);

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

  const { userData: { settings: { theme } } } = useUserData();

  return (
    <DropDown
      modalClassName={`
        !max-h-[290px] overflow-scroll scrollbar-track-transparent  dark:scrollbar-thumb-gray-500 scrollbar-thumb-gray-800 px-2
        ${browserName === "chrome" ? "scrollbar-thin" : "scrollbar"}
        ${isFontSizeModal && "!w-[4.5rem] overflow-x-hidden"}
      `}
      disabled={disabled}
      buttonClassName={`toolbar-item  ` + style}
      buttonLabel={isFontSizeModal ? parseFontSizeToNumber(value) as string : value}
      buttonIconClassName={!isFontSizeModal ? `icon block-type font-family ${theme === 'dark' && "comp-picker"}` : ""}
      useCustomButton={isFontSizeModal ? true : false}
    >
      <div className="my-2">
        {(!isFontSizeModal ? FONT_FAMILY_OPTIONS : FONT_SIZE_OPTIONS).map(
          ([option, text], index: number) => (
            <DropDownItem
              className="item !p-0 !m-0 "
              onClick={() => handleClick(option)}
              key={option}
            >
              <div 
                className={`
                  rounded-lg hover:!bg-[#c1c1c1] dark:hover:!bg-[#323232]
                  ${isFontSizeModal ? "!w-[53px]" : "w-[183px]"} 
                  ${dropDownActiveClass(value === option)}
                `}
              > 
                <p 
                  style={{ fontFamily: option }} 
                  className={`text-start py-[14px] text-gray-900 dark:text-gray-300 ${isFontSizeModal ? "!text-center" : "ml-4"}`}
                >
                  {isFontSizeModal ? parseFontSizeToNumber(text) : text}
                </p>
                {(isFontSizeModal && index !== (FONT_SIZE_OPTIONS.length - 1)) && (
                  <div 
                    className={`
                      h-[1px] border border-transparent border-t-gray-600 mx-auto
                      ${isFontSizeModal ? "w-[38px]" : "w-[158px]"}
                    `}
                  />
                )}
              </div>
            </DropDownItem>
          )
        )}
      </div>
    </DropDown>
  );
}

export default function ToolbarPlugin() {
  const { userData: { settings: { theme } } } = useUserData();

  const default_font_style = 'Roboto';

  const [editor] = useLexicalComposerContext();
  
  const [modal, showModal] = useModal();

  const [activeEditor, setActiveEditor] = useState(editor);
  const [blockType, setBlockType] = useState<keyof typeof blockTypeToBlockName>('paragraph');
  const [selectedElementKey, setSelectedElementKey] = useState<NodeKey | null>(null);
  const [fontSize, setFontSize] = useState('14px');
  const [fontColor, setFontColor] = useState("");
  const [bgColor, setBgColor] = useState('#374151');
  const [fontFamily, setFontFamily] = useState(default_font_style);
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
  const [codeLanguage, setCodeLanguage] = useState('');
  const [screenSize, setScreenSize] = useState({ width: innerWidth });
  const [isEditable, setIsEditable] = useState(() => editor.isEditable());
  const [lastSelectedFontFamily, setLastSelectedFontFamily] = useState('');
  const [lastSelectedFontColor, setLastSelectedFontColor] = useState('');

  const prevNodeKey = useRef<null | string>(null);
  const prevFontColorSelection = useRef<string | null>(null);
  const prevFontFamilySelection = useRef<string | null>(null);

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

      // Update text format
      setIsBold(selection.hasFormat("bold"));
      setIsItalic(selection.hasFormat("italic"));
      setIsUnderline(selection.hasFormat("underline"));
      setIsStrikethrough(selection.hasFormat("strikethrough"));
      setIsSubscript(selection.hasFormat("subscript"));
      setIsSuperscript(selection.hasFormat("superscript"));
      setIsCode(selection.hasFormat("code"));
      
      // Update links
      const node = getSelectedNode(selection);
      const parent = node.getParent();

      if ($isLinkNode(parent) || $isLinkNode(node)) setIsLink(true);
      else setIsLink(false);

      // Handle buttons
      if(!prevNodeKey || prevNodeKey.current !== anchorNode.getKey()) {
        setFontSize($getSelectionStyleValueForProperty(selection, "font-size", fontSize));
      }

      const findPosition = new RegExp(/(font-family:.+?);/, "g");
      const extractString = findPosition.exec(selection.style);
      const extractColor = selection.style.match(/(;color:.+?);/gi);

      const selectionFontStyle = extractString ? extractString[1].slice(13, extractString[1].length) : '';
      const selectionFontColor = extractColor ? extractColor[0].slice(8, extractColor[0].length - 1) : '';      
      
      if((selectionFontStyle || lastSelectedFontFamily)) {
        if(selectionFontStyle) {
          setFontFamily(selectionFontStyle);
        } else {
          const fontFamilyCondition = prevFontFamilySelection.current ? prevFontFamilySelection.current : lastSelectedFontFamily;
          setFontFamily(fontFamilyCondition);
        }
      }

      if((selectionFontColor || lastSelectedFontColor)) {
        if(selectionFontColor) {
          setFontColor(selectionFontColor);
        } else {
          const fontColorCondition = prevFontColorSelection.current ? prevFontColorSelection.current : lastSelectedFontColor;
          setFontColor(fontColorCondition);
        }
      }

      setBgColor($getSelectionStyleValueForProperty(selection, "background-color", "#374151"));

      if(selection._cachedNodes) {
        const selecStyle = selection.style;

        if(!selecStyle && prevFontFamilySelection.current) {
          setFontFamily(prevFontFamilySelection.current);
        }

        if(!selecStyle && prevFontColorSelection.current) {
          setFontColor(prevFontColorSelection.current);
        }
    
        if(selectionFontStyle) {
          prevFontFamilySelection.current = selectionFontStyle;
        } else {
          prevFontFamilySelection.current = !selecStyle && lastSelectedFontFamily ? lastSelectedFontFamily : default_font_style;
        }

        if(selectionFontColor) {
          prevFontColorSelection.current = selectionFontColor;
        } else {
          prevFontColorSelection.current = lastSelectedFontColor ? lastSelectedFontColor : "";
        }

        if(!lastSelectedFontFamily.length && selectionFontStyle.length) {
          setLastSelectedFontFamily(selectionFontStyle);
        }

        if(!lastSelectedFontColor && selectionFontColor) {
          setLastSelectedFontColor(selectionFontColor);
        }
      }
    }
  }, [activeEditor, lastSelectedFontFamily, lastSelectedFontColor]);

  useEffect(() => {
    return editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      (_payload, newEditor) => {
        updateToolbar();
        setActiveEditor(newEditor);
        const selection = $getSelection();

        if($isRangeSelection(selection)) {
          const selectedNodes = selection.getNodes();

          if(selectedNodes) {
            for (const element of selectedNodes) {
              if ($isCodeNode(element) || $isCodeHighlightNode(element)) {
                const type = $isCodeHighlightNode(element) ? 
                  (element.getParent() as LexicalNode).getType() : element.getType();

                if (type in blockTypeToBlockName) {
                  setBlockType(type as keyof typeof blockTypeToBlockName);
                }

                const language = $isCodeHighlightNode(element) ? 
                  (element.getParent() as LexicalNode).getLanguage() : element.getLanguage();

                setCodeLanguage(language ? CODE_LANGUAGE_MAP[language] || language : "");
                setSelectedElementKey(
                  $isCodeHighlightNode(element) ? 
                    (element.getParent() as LexicalNode).getKey() : element.getKey()
                );

                return false;
              } 
            }

            const firstElement = selectedNodes[0];
            const fistElementParent = firstElement.getParent() ? 
              firstElement.getParent() as LexicalNode : firstElement;
            
            const anchorNode = selection.anchor.getNode();

            setSelectedElementKey(fistElementParent.getKey());

            if ($isListNode(fistElementParent)) {
              const parentList = $getNearestNodeOfType<ListNode>(anchorNode, ListNode);
              const type = parentList ? parentList.getListType() : fistElementParent.getListType();
              setBlockType(type);
            } else {
              const type = $isHeadingNode(fistElementParent) ? fistElementParent.getTag() : fistElementParent.getType();
              if (type in blockTypeToBlockName) setBlockType(type as keyof typeof blockTypeToBlockName);
    
              if ($isCodeNode(fistElementParent)) {
                const language = fistElementParent.getLanguage();
                setCodeLanguage(language ? CODE_LANGUAGE_MAP[language] || language : "");

                return false;
              }
            }
          }
        };
        
        activeEditor.update(() => {
          if ($isRangeSelection(selection)) {
            const elementDOM = activeEditor.getElementByKey(selection.getNodes()[0].getKey()) as HTMLElement;
            if(elementDOM) {
              const anchorNode = selection.anchor.getNode();
              
              if(!prevNodeKey.current || (prevNodeKey.current !== anchorNode.getKey())) {
                $patchStyleText(selection, { 
                  color: fontColor,
                  ["font-family"]: fontFamily
                });
                prevNodeKey.current = anchorNode.getKey();
              }
  
              if(!fontColor) {
                setFontColor(elementDOM.style["color"]);
                setLastSelectedFontColor(elementDOM.style["color"]);
              }
            }
          }
        });

        return false;
      },
      COMMAND_PRIORITY_CRITICAL
    );
  }, [editor, updateToolbar, prevNodeKey, fontColor, fontFamily]);

  useEffect(() => {
    return activeEditor.registerCommand(
      INSERT_PARAGRAPH_COMMAND,
      () => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          const anchorNode = selection.anchor.getNode();
          prevNodeKey.current = anchorNode.getKey();
        }

        return false;
      },
      COMMAND_PRIORITY_CRITICAL
    );
  }, [activeEditor, fontColor, fontFamily, updateToolbar]);

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

        if ($isRangeSelection(selection)) {
          const getNativeSelection = window.getSelection();
          const getCurrentSelectedNode = $getNodeByKey(selection.anchor.key);

          if(getCurrentSelectedNode && getCurrentSelectedNode.__parent) {
            const getParentOfCurrentSelectedNode = $getNodeByKey(getCurrentSelectedNode.__parent);
            
            if(getParentOfCurrentSelectedNode?.__type === "listitem") {
              const liHTMLElement = getNativeSelection?.anchorNode?.parentElement?.parentElement;
              
              if(liHTMLElement) liHTMLElement.style.color = styles?.color;
            }
          }

          $patchStyleText(selection, styles);
        }
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
    (value: string) => { 
      setLastSelectedFontColor(value);
      applyStyleText({ color: value });
    },
    [applyStyleText]
  );

  const onBgColorSelect = useCallback(
    (value: string) => { applyStyleText({ 'background-color': value }) },
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

  useUpdateViewport(setScreenSize, 500);

  const userAgent = navigator.userAgent;
  let browserName;
  
  if(userAgent.match(/chrome|chromium|crios/i)) browserName = "chrome";
  else if(userAgent.match(/firefox|fxios/i)) browserName = "firefox";

  const customCodeButtonLabel = (
    <div className="px-2 flex flex-row space-x-2 text-gray-900 dark:text-gray-300">
      {CODE_LANGUAGE_FRIENDLY_NAME_MAP[codeLanguage] && (
        <>
          <img
            src={CODE_LANGUAGE_FRIENDLY_NAME_MAP[codeLanguage].icon}
            className={`
              w-5 h-5 ${((codeLanguage === "plain" || codeLanguage === "markdown") && theme === "dark") && "comp-picker"}
            `}
          />
          <span className="text text-[14px]">{CODE_LANGUAGE_FRIENDLY_NAME_MAP[codeLanguage].name}</span>
        </>
      )}
    </div>
  );

  return (
    <div  
      className="!z-30 !relative toolbar !h-[2.50rem] mt-[0.02rem] dark:!bg-[#0f1011] !bg-[#ffffff] dark:text-gray-50 border border-transparent !border-r-0 !border-b-stone-300 dark:!border-b-[#404040] overflow-y-hidden scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-900 dark:scrollbar-thumb-gray-500"
      style={{ 
        width: !getNavbar?.checkVisibility() ? screenSize.width : screenSize.width - 442
      }}
    >
      <button
        disabled={!canUndo || !isEditable}
        onClick={() => activeEditor.dispatchCommand(UNDO_COMMAND, undefined)}
        title={IS_APPLE ? "Undo (⌘Z)" : "Undo (Ctrl+Z)"}
        className="toolbar-item spaced"
        aria-label="Undo"
      >
        <i className={`format undo ${theme === "dark" && "comp-picker"}`}/>
      </button>
      <button
        disabled={!canRedo || !isEditable}
        onClick={() => activeEditor.dispatchCommand(REDO_COMMAND, undefined)}
        title={IS_APPLE ? "Redo (⌘Y)" : "Redo (Ctrl+Y)"}
        className="toolbar-item"
        aria-label="Redo"
      >
        <i className={`format undo ${theme === "dark" && "comp-picker"}`} />
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
          useCustomButton={true}
          disabled={!isEditable}
          customButtonLabel={customCodeButtonLabel}
          buttonClassName="toolbar-item code-language"
          customButtonLabelClassName={"border-none !h-10"}
          buttonLabel={getLanguageFriendlyName(codeLanguage)}
          modalClassName={`
            w-40 h-72 overflow-y-scroll overflow-x-hidden px-2 scrollbar-track-transparent dark:scrollbar-thumb-gray-500 scrollbar-thumb-gray-800
            ${browserName === "chrome" ? "scrollbar-thin" : "scrollbar"}
          `}
        >
          <div className="my-2">
            {CODE_LANGUAGE_OPTIONS.map(([value, langObj], index) => {
              return (
                <div key={value}>
                  <DropDownItem
                    className={`${dropDownActiveClass(value === codeLanguage)} rounded-lg !w-[8.90rem] hover:!bg-[#cacaca] dark:hover:!bg-[#323232] !mt-[1px] !py-[8px]`}
                    onClick={() => onCodeLanguageSelect(value)}
                  >
                    <div className="px-[9px] flex flex-row justify-start space-x-2 text-gray-900 dark:text-gray-300">
                      <img 
                        src={langObj.icon} 
                        className={`w-6 h-6 ${((value === "plain" || value === "markdown") && theme === "dark") && "comp-picker"}`}
                      />
                      <span className=" mt-[2px]">{langObj.name}</span>
                    </div>
                  </DropDownItem>
                  {index !== CODE_LANGUAGE_OPTIONS.length - 1 && (
                    <div className="px-3 h-[1px] border border-transparent border-t-gray-600 !w-[8.50rem] mx-auto" />
                  )}
                </div>
              );
            })}
          </div>
        </DropDown>
      ) : (
        <>
          <FontDropDown
            disabled={!isEditable} 
            style={"font-family"} 
            value={fontFamily} 
            editor={editor} 
            setFontFamily={setFontFamily}
            setLastSelectedFontFamily={setLastSelectedFontFamily}
          />
          <Divider />
          <div className="mx-1 flex flex-row space-x-2 my-auto">
            <button 
              onClick={() => handleIncrementFontSizeButton()}
              className="w-8 h-7 dark:hover:bg-[#404040] hover:bg-[#e1e1e1] rounded-lg"
            > 
              +
            </button>
            <FontDropDown
              setFontSize={setFontSize}
              isFontSizeModal={true}
              disabled={!isEditable} 
              style={"font-size"} 
              value={fontSize ? fontSize : '14px'} 
              editor={editor}
            />
            <button 
              onClick={() => handleDecrementFontSizeButton()}
              className="w-8 h-7 dark:hover:bg-[#404040] hover:bg-[#e1e1e1] rounded-lg"
            > 
              -
            </button>
          </div>
          <Divider />
          <button
            disabled={!isEditable}
            onClick={() => activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")}
            className={"toolbar-item spaced dark:hover:!bg-[#404040] hover:!bg-[#e1e1e1] " + (isBold ? "active" : "")}
            title={IS_APPLE ? "Bold (⌘B)" : "Bold (Ctrl+B)"}
            aria-label={`Format text as bold. Shortcut: ${IS_APPLE ? "⌘B" : "Ctrl+B"}`}
          >
            <i className={`format bold ${theme === "dark" && 'comp-picker'}`} />
          </button>
          <button
            disabled={!isEditable}
            onClick={() => activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic")}
            className={"toolbar-item spaced dark:hover:!bg-[#404040] hover:!bg-[#e1e1e1] " + (isItalic ? "active" : "")}
            title={IS_APPLE ? "Italic (⌘I)" : "Italic (Ctrl+I)"}
            aria-label={`Format text as italics. Shortcut: ${IS_APPLE ? "⌘I" : "Ctrl+I"}`}
          >
            <i className={`format italic ${theme === "dark" && 'comp-picker'}`} />
          </button>
          <button
            disabled={!isEditable}
            onClick={() => activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline")}
            className={"toolbar-item spaced dark:hover:!bg-[#404040] hover:!bg-[#e1e1e1] " + (isUnderline ? "active" : "")}
            title={IS_APPLE ? "Underline (⌘U)" : "Underline (Ctrl+U)"}
            aria-label={`Format text to underlined. Shortcut: ${IS_APPLE ? "⌘U" : "Ctrl+U"}`}
          >
            <i className={`format underline ${theme === "dark" && 'comp-picker'}`} />
          </button>
          <button
            disabled={!isEditable}
            onClick={() => activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, "code")}
            className={"toolbar-item spaced dark:hover:!bg-[#404040] hover:!bg-[#e1e1e1] " + (isCode ? "active" : "")}
            title="Insert code block"
            aria-label="Insert code block"
          >
            <i className={`format code ${theme === "dark" && 'comp-picker'}`} />
          </button>
          <button
            disabled={!isEditable}
            onClick={insertLink}
            className={"toolbar-item spaced dark:hover:!bg-[#404040] hover:!bg-[#e1e1e1] " + (isLink ? "active" : "")}
            aria-label="Insert link"
            title="Insert link"
          >
            <i className={`format link ${theme === "dark" && 'comp-picker'}`} />
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
            buttonIconClassName={`icon bg-color  ${theme === 'dark' && 'comp-picker'}`}
            color={bgColor}
            onChange={onBgColorSelect}
            title="bg color"
          />
          <DropDown
            modalClassName={`
             w-[191px] overflow-y-scroll px-2 scrollbar-track-transparent dark:scrollbar-thumb-gray-500 scrollbar-thumb-gray-800
             ${browserName === "chrome" ? "scrollbar-thin" : "scrollbar"}
           `}     
            disabled={!isEditable}
            buttonClassName="toolbar-item spaced"
            buttonLabel=""
            buttonIconClassName={`icon dropdown-more ${theme === 'dark' && 'comp-picker'}`}
          >
            <div className="my-2">
              <DropDownItem
                onClick={() => activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough")}
                className={"rounded-lg !w-[10.69rem] hover:!bg-[#cacaca] dark:hover:!bg-[#323232] !mt-[1px] !py-[11px] " + dropDownActiveClass(isStrikethrough)}
                title="Strikethrough"
                aria-label="Format text with a strikethrough"
              >
                <div className="flex flex-row space-x-2 ml-3">
                  <img className={`${theme === 'dark' && 'comp-picker'} w-[20px] h-5 mt-[1px]`} src={strikethroughIcon}/>
                  <span className="text-[15px] text-gray-900 dark:text-gray-300">Strikethrough</span>
                </div>
              </DropDownItem>
              <DropDownItem
                onClick={() => activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, "subscript")}
                className={"rounded-lg !w-[10.69rem] hover:!bg-[#cacaca] dark:hover:!bg-[#323232] !mt-[1px] !py-[11px] " + dropDownActiveClass(isSubscript)}
                title="Subscript"
                aria-label="Format text with a subscript"
              >
                <div className="flex flex-row space-x-2 ml-3">
                  <img className={`${theme === 'dark' && 'comp-picker'} w-[20px] h-5 mt-[1px]`} src={subscriptIcon} />
                  <span className="text-[15px] text-gray-900 dark:text-gray-300">Subscript</span>
                </div>
              </DropDownItem>
              <DropDownItem
                onClick={() => activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, "superscript")}
                className={"rounded-lg !w-[10.69rem] hover:!bg-[#cacaca] dark:hover:!bg-[#323232] !mt-[1px] !py-[11px] " + dropDownActiveClass(isSuperscript)}
                title="Superscript"
                aria-label="Format text with a superscript"
              > 
                <div className="flex flex-row space-x-2 ml-3">
                  <img className={`${theme === 'dark' && 'comp-picker'} w-[20px] h-5 mt-[1px]`} src={superscriptIcon} />
                  <span className="text-[15px] text-gray-900 dark:text-gray-300">Superscript</span>
                </div>
              </DropDownItem>
              <DropDownItem 
                onClick={clearFormatting} 
                className="rounded-lg !w-[10.69rem] hover:!bg-[#cacaca] dark:hover:!bg-[#323232] !mt-[1px] !py-[11px]"
                title="Clear text formatting" 
                aria-label="Clear all text formatting"
              >
                <div className="flex flex-row space-x-2 ml-3">                
                  <img 
                    className={`${theme === 'dark' && 'comp-picker'} w-[19px] h-[1.1rem] mt-[3px]`} 
                    src={clearFormattingIcon} 
                  />
                  <span className="text-[15px] text-gray-900 dark:text-gray-300">Clear Formatting</span>
                </div>
              </DropDownItem>
            </div>
          </DropDown>
          <Divider />
          <DropDown
            disabled={!isEditable}
            modalClassName={`
              w-56 h-72 overflow-y-scroll px-2 scrollbar-track-transparent dark:scrollbar-thumb-gray-500 scrollbar-thumb-gray-800
              ${browserName === "chrome" ? "scrollbar-thin" : "scrollbar"}
            `}
            buttonClassName="toolbar-item spaced"
            buttonLabel="Insert"
            buttonIconClassName={`icon plus ${theme === 'dark' && 'comp-picker'}`}
          >
            <div className="my-2">
              <DropDownItem 
                className="rounded-lg !w-[12.80rem] hover:!bg-[#cacaca] dark:hover:!bg-[#323232] !mt-[1px] !py-[11px]"
                onClick={() => activeEditor.dispatchCommand(INSERT_HORIZONTAL_RULE_COMMAND, undefined)} 
              >
                <div className="flex flex-row space-x-2 ml-3">
                  <img className={`${theme === 'dark' && 'comp-picker'} w-[20px] h-5 mt-[1px]`} src={horizontalRuleIcon} />
                  <span className="text-[15px] text-gray-900 dark:text-gray-300">Horizontal Rule</span>
                </div>
              </DropDownItem>
              <DropDownItem
                className="rounded-lg !w-[12.80rem] hover:!bg-[#cacaca] dark:hover:!bg-[#323232] !mt-[1px] !py-[11px]"
                onClick={() => activeEditor.dispatchCommand(INSERT_EXCALIDRAW_COMMAND, undefined)}
              >
                <div className="flex flex-row space-x-2 ml-3">
                  <img className={`${theme === 'dark' && 'comp-picker'} w-[20px] h-5 mt-[1px]`} src={excalidrawIcon} />
                  <span className="text-[15px] text-gray-900 dark:text-gray-300">Excalidraw</span>
                </div>
              </DropDownItem>
              <DropDownItem
                className="rounded-lg !w-[12.80rem] hover:!bg-[#cacaca] dark:hover:!bg-[#323232] !mt-[1px] !py-[11px]"
                onClick={() => showModal('Insert Image', (onClose) => <InsertImageDialog activeEditor={activeEditor} onClose={onClose} />)}
              >
                <div className="flex flex-row space-x-2 ml-3">
                  <img className={`${theme === 'dark' && 'comp-picker'} w-[20px] h-5 mt-[1px]`} src={imageIcon} />
                  <span className="text-[15px] text-gray-900 dark:text-gray-300">Image</span>
                </div>
              </DropDownItem>
              {/* <DropDownItem
                className="rounded-lg !w-[12.80rem] hover:!bg-gray-700 !mt-[1px] !py-[11px]"
                onClick={() => showModal("Insert Poll", (onClose) => <InsertPollDialog activeEditor={activeEditor} onClose={onClose} />)}
              >
                <div className="flex flex-row space-x-2 ml-3">
                  <img className={`${theme !== 'dark' && 'comp-picker'} w-[20px] h-5 mt-[1px]`} src={poolIcon} />
                  <span className="text-[15px] text-gray-900 dark:text-gray-300">Poll</span>
                </div>
              </DropDownItem> */}
              <DropDownItem
                className="rounded-lg !w-[12.80rem] hover:!bg-[#cacaca] dark:hover:!bg-[#323232] !mt-[1px] !py-[11px]"
                onClick={() => {
                  showModal(
                    "Insert Equation", 
                    (onClose) => {
                      return (
                        <InsertEquationDialog 
                          activeEditor={activeEditor} 
                          onClose={onClose} 
                        />
                      )
                    }
                  )
                }}
              >
                <div className="flex flex-row space-x-2 ml-3">
                  <img 
                    className={`${theme === 'dark' && 'comp-picker'} w-[20px] h-5 mt-[1px]`} 
                    src={equationIcon} 
                  />
                  <span className="text-[15px] text-gray-900 dark:text-gray-300">Equation</span>
                </div>
              </DropDownItem>
              {/* <DropDownItem
                className="rounded-lg !w-[12.80rem] hover:!bg-gray-700 !mt-[1px] !py-[11px]"
                onClick={() => {
                  editor.update(() => {
                    const root = $getRoot();
                    const stickyNode = $createStickyNode(0, 0);
                    root.append(stickyNode);
                  });
                }}
              >
                <div className="flex flex-row space-x-2 ml-3">
                  <img className={`${theme !== 'dark' && 'comp-picker'} w-[20px] h-5 mt-[1px]`} src={stickyIcon} />
                  <span className="text-[15px] text-gray-900 dark:text-gray-300">Sticky Note</span>
                </div>
              </DropDownItem> */}
              <DropDownItem 
                className="rounded-lg !w-[12.80rem] hover:!bg-[#cacaca] dark:hover:!bg-[#323232] !mt-[1px] !py-[11px]"
                onClick={() => editor.dispatchCommand(INSERT_COLLAPSIBLE_COMMAND, undefined)} 
              >
                <div className="flex flex-row space-x-2 ml-3">
                  <img className={`${theme === 'dark' && 'comp-picker'} w-[20px] h-5 mt-[1px]`} src={collapsibleIcon} />
                  <span className="text-[15px] text-gray-900 dark:text-gray-300">Collapsible container</span>
                </div>
              </DropDownItem>
              {EmbedConfigs.map((embedConfig, index: number) => (
                <DropDownItem
                  key={embedConfig.type}
                  className="rounded-lg !w-[12.80rem] hover:!bg-[#cacaca] dark:hover:!bg-[#323232] !mt-[1px] !py-[11px]"
                  onClick={() => activeEditor.dispatchCommand(INSERT_EMBED_COMMAND, embedConfig.type)}
                >
                  <div className="flex flex-row space-x-2 ml-3">
                    <img 
                      className={`${theme === 'dark' && 'comp-picker'} w-[20px] h-5 mt-[1px]`} 
                      src={!index ? twitterIcon : index === 1 ? youtubeIcon : figmaIcon} 
                    />
                    <span className="text-[15px] text-gray-900 dark:text-gray-300">{embedConfig.contentName}</span>
                  </div>
                </DropDownItem>
              ))}
            </div>
          </DropDown>
        </>
      )}
      <Divider />
      <DropDown
        disabled={!isEditable}
        modalClassName={`
          w-44 h-72 overflow-y-scroll px-2 scrollbar-track-transparent dark:scrollbar-thumb-gray-500 scrollbar-thumb-gray-800
          ${browserName === "chrome" ? "scrollbar-thin" : "scrollbar"}
        `}
        buttonLabel="Align"
        buttonIconClassName={`icon left-align ${theme === 'dark' && 'comp-picker'}`}
        buttonClassName="toolbar-item spaced alignment"        
      >
        <div className="my-2">
          <DropDownItem 
            className="rounded-lg !w-[9.90rem] hover:!bg-[#cacaca] dark:hover:!bg-[#323232] !mt-[1px] !py-[11px]"
            onClick={() => activeEditor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "left")} 
          >
            <div className="flex flex-row space-x-2 ml-3">
              <img className={`${theme === 'dark' && 'comp-picker'} w-[20px] h-5 mt-[1px]`} src={leftAlignIcon} />
              <span className="text-[15px] text-gray-900 dark:text-gray-300">Left Align</span>
            </div>
          </DropDownItem>
          <DropDownItem 
            className="rounded-lg !w-[9.90rem] hover:!bg-[#cacaca] dark:hover:!bg-[#323232] !mt-[1px] !py-[11px]"
            onClick={() => activeEditor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "center")} 
          >
            <div className="flex flex-row space-x-2 ml-3">
              <img className={`${theme === 'dark' && 'comp-picker'} w-[20px] h-5 mt-[1px]`} src={centerAlignIcon}/>
              <span className="text-[15px] text-gray-900 dark:text-gray-300">Center Align</span>
            </div>
          </DropDownItem>
          <DropDownItem 
            className="rounded-lg !w-[9.90rem] hover:!bg-[#cacaca] dark:hover:!bg-[#323232] !mt-[1px] !py-[11px]"
            onClick={() => activeEditor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "right")} 
          >
            <div className="flex flex-row space-x-2 ml-3">
              <img className={`${theme === 'dark' && 'comp-picker'} w-[20px] h-5 mt-[1px]`} src={rightAlignIcon}/>
              <span className="text-[15px] text-gray-900 dark:text-gray-300">Right Align</span>
            </div>
          </DropDownItem>
          <DropDownItem 
            className="rounded-lg !w-[9.90rem] hover:!bg-[#cacaca] dark:hover:!bg-[#323232] !mt-[1px] !py-[11px]"
            onClick={() => activeEditor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "justify")} 
          >
            <div className="flex flex-row space-x-2 ml-3">
              <img className={`${theme === 'dark' && 'comp-picker'} w-[20px] h-5 mt-[1.5px]`} src={justifyAlignIcon}/>
              <span className="text-[15px] text-gray-900 dark:text-gray-300">Justify Align</span>
            </div>
          </DropDownItem>
          <div className="my-2 px-1">
            <Divider />
          </div>
          <DropDownItem 
            className="rounded-lg !w-[9.90rem] hover:!bg-[#cacaca] dark:hover:!bg-[#323232] !mt-[1px] !py-[11px]"
            onClick={() => activeEditor.dispatchCommand(OUTDENT_CONTENT_COMMAND, undefined)} 
          >
            <div className="flex flex-row space-x-2 ml-3">
              <img className={`${theme === 'dark' && 'comp-picker'} w-[20px] h-5 mt-[1px]`} src={outdentIcon} />
              <span className="text-[15px] text-gray-900 dark:text-gray-300">Outdent</span>
            </div>
          </DropDownItem>
          <DropDownItem 
            className="rounded-lg !w-[9.90rem] hover:!bg-[#cacaca] dark:hover:!bg-[#323232] !mt-[1px] !py-[11px]"
            onClick={() => activeEditor.dispatchCommand(INDENT_CONTENT_COMMAND, undefined)} 
          >
            <div className="flex flex-row space-x-2 ml-3">
              <img className={`${theme === 'dark' && 'comp-picker'} w-[20px] h-5 mt-[2px]`} src={indentIcon} />
              <span className="text-[15px] text-gray-900 dark:text-gray-300">Indent</span>
            </div>
          </DropDownItem>
        </div>
      </DropDown>
      
      {modal}
    </div>
  );
}