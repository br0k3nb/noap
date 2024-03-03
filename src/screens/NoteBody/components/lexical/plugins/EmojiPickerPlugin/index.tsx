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
}: {
  index: number;
  isSelected: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
  option: EmojiOption;
}) {
  let className = "cursor-pointer text-center w-12 !rounded-lg bg-[#f8f8f8] text-gray-900 dark:!text-gray-300 hover:!bg-[#e1e1e1] dark:bg-[#1c1d1e] dark:hover:!bg-[#323232] !py-1";
  if (isSelected) className += " !bg-[#bbbbbb] dark:!bg-[#323232]";

  return (
    <>  
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
        <span className="my-auto !text-[26px]">
          {option.emoji}
        </span>
      </li>
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

const MAX_EMOJI_SUGGESTION_COUNT = 10000;

export default function EmojiPickerPlugin() {
  const [editor] = useLexicalComposerContext();
  const [queryString, setQueryString] = useState<string | null>(null);
  const [emojis, setEmojis] = useState<Array<Emoji>>([]);

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
                className={`rounded-xl bg-[#f8f8f8] dark:!bg-[#1c1d1e] !w-[250px] 
                  ${overflowXAxis && !overflowYAxis ? "!absolute !-left-52" 
                    : !overflowXAxis && overflowYAxis ? "!absolute !-top-[130px] !left-5" 
                    : overflowXAxis && overflowYAxis ? "!absolute !-left-52 !-top-40" 
                    : undefined}
                `}
              >
                <ul className="rounded-xl !max-h-[240px] xxs:!max-h-[180px] border border-gray-600 overflow-y-scroll flex flex-wrap px-1 py-1">
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