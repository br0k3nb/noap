import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

import { $createTextNode, $getSelection, $isRangeSelection, TextNode } from "lexical";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { LexicalTypeaheadMenuPlugin, MenuOption } from "@lexical/react/LexicalTypeaheadMenuPlugin";

class EmojiOption extends MenuOption {
  title: string;
  emoji: string;
  keywords: Array<string>;

  constructor(
    title: string,
    emoji: string,
    options: {
      keywords?: Array<string>;
    }
  ) {
    super(title);
    this.title = title;
    this.emoji = emoji;
    this.keywords = options.keywords || [];
  }
}
function EmojiMenuItem({
  index,
  isSelected,
  onClick,
  onMouseEnter,
  option,
  showDivder
}: {
  index: number;
  isSelected: boolean;
  showDivder?: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
  option: EmojiOption;
}) {
  let className = "item";
  if (isSelected) className += " selected";

  return (
    <>  
      <li
        key={option.key}
        tabIndex={-1}
        className={"!py-3 !bg-gray-800 hover:!bg-gray-900"}
        ref={option.setRefElement}
        role="option"
        aria-selected={isSelected}
        id={"typeahead-item-" + index}
        onMouseEnter={onMouseEnter}
        onClick={onClick}
      >
        <div className="flex flex-row space-x-2 ml-1 !truncate">
          <span className="text-gray-300 my-auto">
            {option.emoji}
          </span>
          <span className="text-gray-300 text-sm">
            {option.title}
          </span>
        </div>
      </li>
      {showDivder && (<div className="border border-transparent border-t-gray-700 mx-2"/>)}
    </>
  );
}

type Emoji = {
  emoji: string;
  description: string;
  category: string;
  aliases: Array<string>;
  tags: Array<string>;
  unicode_version: string;
  ios_version: string;
  skin_tones?: boolean;
};

const MAX_EMOJI_SUGGESTION_COUNT = 20;

export default function EmojiPickerPlugin() {
  const [ editor ] = useLexicalComposerContext();
  const [ queryString, setQueryString ] = useState<string | null>(null);
  const [ emojis, setEmojis ] = useState<Array<Emoji>>([]);

  useEffect(() => {
    import("../../../../../../datasets/emoji_list").then((file) => setEmojis(file.default));
  }, []);

  const emojiOptions = useMemo(
    () =>
      emojis != null
        ? emojis.map(
            ({ emoji, aliases, tags }) =>
              new EmojiOption(aliases[0], emoji, {
                keywords: [...aliases, ...tags],
              })
          )
        : [],
    [emojis]
  );

  const checkForTriggerMatch = customTypeaheadTriggerMatch(":", { minLength: 0 });

  const options: Array<EmojiOption> = useMemo(() => {
    return emojiOptions
      .filter((option: EmojiOption) => {
        return queryString != null
          ? new RegExp(queryString, "gi").exec(option.title) ||
            option.keywords != null
            ? option.keywords.some((keyword: string) =>
                new RegExp(queryString, "gi").exec(keyword)
              )
            : false
          : emojiOptions;
      })
      .slice(0, MAX_EMOJI_SUGGESTION_COUNT);
  }, [emojiOptions, queryString]);

  const onSelectOption = useCallback(
    (
      selectedOption: EmojiOption,
      nodeToRemove: TextNode | null,
      closeMenu: () => void
    ) => {
      editor.update(() => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection) || selectedOption == null) return;

        if (nodeToRemove) nodeToRemove.remove();
        
        selection.insertNodes([$createTextNode(selectedOption.emoji)]);

        closeMenu();
      });
    },
    [editor]
  );

  return (
    <LexicalTypeaheadMenuPlugin
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

        const overflowXAxis = window.outerWidth - x < 176;
        const overflowYAxis = window.outerHeight - y < 240;

        return anchorElementRef.current && options.length
          ? createPortal(
              <div 
                className={`typeahead-popover emoji-menu 
                  ${overflowXAxis && !overflowYAxis ? "!absolute !-left-52" 
                    : !overflowXAxis && overflowYAxis ? "!absolute !-top-[130px] !left-5" 
                    : overflowXAxis && overflowYAxis ? "!absolute !-left-52 !-top-40" 
                    : undefined}
                `}
              >
                <ul className="!h-[180px] border border-gray-600 !bg-gray-800">
                  {options.map((option: EmojiOption, index) => (
                    <div key={option.key}>
                      <EmojiMenuItem
                        index={index}
                        isSelected={selectedIndex === index}
                        onClick={() => {
                          setHighlightedIndex(index);
                          selectOptionAndCleanUp(option);
                        }}
                        onMouseEnter={() => setHighlightedIndex(index)}
                        option={option}
                        showDivder={index !== options.length - 1 ? true : false}
                      />
                    </div>
                  ))}
                </ul>
              </div>,
              anchorElementRef.current
            )
          : null;
      }}
    />
  );
};

export function customTypeaheadTriggerMatch(trigger: string, { minLength = 1, maxLength = 75 }) {
  return useCallback((text: string) => {
    const validChars = '[^' + trigger + '\\s]';
    const TypeaheadTriggerRegex = new RegExp('(^|\\s|\\()(' + '[' + trigger + ']' + '((?:' + validChars + '){0,' + maxLength + '})' + ')$');
    const match = TypeaheadTriggerRegex.exec(text);

    if (match !== null) {
      const maybeLeadingWhitespace = match[1];
      const matchingString = match[3];

      if (matchingString.length >= minLength) {
        return {
          leadOffset: match.index + maybeLeadingWhitespace.length,
          matchingString,
          replaceableString: match[2]
        };
      }
    }

    return null;
  }, [maxLength, minLength, trigger]);
};