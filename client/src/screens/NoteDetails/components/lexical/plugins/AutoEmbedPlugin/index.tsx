import { useMemo, useState } from "react";
import { createPortal } from "react-dom";

import type { LexicalEditor } from "lexical";

import { AutoEmbedOption, EmbedConfig, EmbedMatchResult, LexicalAutoEmbedPlugin, URL_MATCHER } from "@lexical/react/LexicalAutoEmbedPlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";

import useModal from "../../hooks/useModal";
import Button from "../../ui/Button";
import { DialogActions } from "../../ui/Dialog";
import { INSERT_FIGMA_COMMAND } from "../FigmaPlugin";
import { INSERT_TWEET_COMMAND } from "../TwitterPlugin";
import { INSERT_YOUTUBE_COMMAND } from "../YouTubePlugin";

import twitterIcon from '../../images/icons/tweet.svg';
import youtubeIcon from '../../images/icons/youtube.svg';
import figmaIcon from '../../images/icons/figma.svg';

interface PlaygroundEmbedConfig extends EmbedConfig {
  // Human readable name of the embeded content e.g. Tweet or Google Map.
  contentName: string;

  // Icon for display.
  icon?: JSX.Element;

  // An example of a matching url https://twitter.com/jack/status/20
  exampleUrl: string;

  // For extra searching.
  keywords: Array<string>;

  // Embed a Figma Project.
  description?: string;
}

export const YoutubeEmbedConfig: PlaygroundEmbedConfig = {
  contentName: "Youtube Video",
  exampleUrl: "https://www.youtube.com/watch?v=jNQXAC9IVRw",
  icon: <img className="comp-picker w-[20px] h-5 mt-[1px]" src={youtubeIcon} />,
  insertNode: (editor: LexicalEditor, result: EmbedMatchResult) => editor.dispatchCommand(INSERT_YOUTUBE_COMMAND, result.id),
  keywords: ["youtube", "video"],
  // Determine if a given URL is a match and return url data.
  parseUrl: async (url: string) => {
    const match = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/.exec(url);
    const id = match ? (match?.[2].length === 11 ? match[2] : null) : null;

    if (id != null) return { id, url };
    return null;
  },

  type: "youtube-video",
};

export const TwitterEmbedConfig: PlaygroundEmbedConfig = {
  contentName: "Tweet",
  exampleUrl: "https://twitter.com/jack/status/20",
  icon: <img className="comp-picker w-[20px] h-5 mt-[1px]" src={twitterIcon} />,
  insertNode: (editor: LexicalEditor, result: EmbedMatchResult) => editor.dispatchCommand(INSERT_TWEET_COMMAND, result.id),
  keywords: ["tweet", "twitter"],
  parseUrl: (text: string) => {
    const match = /^https:\/\/twitter\.com\/(#!\/)?(\w+)\/status(es)*\/(\d+)$/.exec(text);

    if (match != null) return { id: match[4], url: match[0] };
    return null;
  },
  type: "tweet"
};

export const FigmaEmbedConfig: PlaygroundEmbedConfig = {
  contentName: "Figma Document",
  exampleUrl: "https://www.figma.com/file/LKQ4FJ4bTnCSjedbRpk931/Sample-File",
  icon: <img className="comp-picker w-[20px] h-5 mt-[1px]" src={figmaIcon} />,
  insertNode: (editor: LexicalEditor, result: EmbedMatchResult) => editor.dispatchCommand(INSERT_FIGMA_COMMAND, result.id),
  keywords: ["figma", "figma.com", "mock-up"],
  parseUrl: (text: string) => {
    const match =/https:\/\/([\w.-]+\.)?figma.com\/(file|proto)\/([0-9a-zA-Z]{22,128})(?:\/.*)?$/.exec(text);
    if (match != null) return { id: match[3], url: match[0] };
    return null;
  },

  type: "figma",
};

export const EmbedConfigs = [ TwitterEmbedConfig, YoutubeEmbedConfig, FigmaEmbedConfig ];

function AutoEmbedMenuItem({
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
  option: AutoEmbedOption;
}) {
  let className = "bg-[#f8f8f8] text-gray-900 dark:text-gray-300 dark:bg-[#0f1011]";
  if (isSelected) className += " !bg-[#e1e1e1] dark:!bg-[#404040]";  

  return (
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
      <span className="text">{option.title}</span>
    </li>
  );
}

function AutoEmbedMenu({
  options,
  selectedItemIndex,
  onOptionClick,
  onOptionMouseEnter,
}: {
  selectedItemIndex: number | null;
  onOptionClick: (option: AutoEmbedOption, index: number) => void;
  onOptionMouseEnter: (index: number) => void;
  options: Array<AutoEmbedOption>;
}) {
  return (
    <div className="typeahead-popover bg-[#f8f8f8] dark:bg-gray-900 ">
      <ul>
        {options.map((option: AutoEmbedOption, i: number) => (
          <AutoEmbedMenuItem
            index={i}
            isSelected={selectedItemIndex === i}
            onClick={() => onOptionClick(option, i)}
            onMouseEnter={() => onOptionMouseEnter(i)}
            key={option.key}
            option={option}
          />
        ))}
      </ul>
    </div>
  );
}

const debounce = (callback: (text: string) => void, delay: number) => {
  let timeoutId: number;
  return (text: string) => {
    window.clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => {
      callback(text);
    }, delay);
  };
};

export function AutoEmbedDialog({
  embedConfig,
  onClose,
}: {
  embedConfig: PlaygroundEmbedConfig;
  onClose: () => void;
}): JSX.Element {
  const [text, setText] = useState("");
  const [editor] = useLexicalComposerContext();
  const [embedResult, setEmbedResult] = useState<EmbedMatchResult | null>(null);

  const validateText = useMemo(() => debounce((inputText: string) => {
        const urlMatch = URL_MATCHER.exec(inputText);
        if (embedConfig != null && inputText != null && urlMatch != null) {
          Promise.resolve(embedConfig.parseUrl(inputText)).then((parseResult) => setEmbedResult(parseResult));
        } 
        else if (embedResult != null) setEmbedResult(null);
      }, 200),
    [embedConfig, embedResult]
  );

  const onClick = () => {
    if (embedResult != null) {
      embedConfig.insertNode(editor, embedResult);
      onClose();
    }
  };

  return (
    <div 
      style={{ width: "600px" }}
      className="xxs:!max-w-[256px]"
    >
      <div className="Input__wrapper">
        <input
          className="Input__input focus:!outline-none bg-[#e1e1e1] border-stone-400 text-gray-900 dark:text-gray-300 dark:bg-[#181818] dark:border-[#404040]"
          placeholder={embedConfig.exampleUrl}
          value={text}
          data-test-id={`${embedConfig.type}-embed-modal-url`}
          onChange={(e) => {
            const { value } = e.target;
            setText(value);
            validateText(value);
          }}
        />
      </div>
      <DialogActions>
        <Button
          disabled={!embedResult}
          className="!bg-[#dbdbdb] dark:!bg-[#181818] hover:!bg-[#cecece] text-gray-900 border border-stone-400 dark:border-[#404040] dark:text-gray-300 transition-all duration-300 ease-in-out cursor-pointer text-[13.5px] uppercase tracking-widest"
          onClick={onClick}
          data-test-id={`${embedConfig.type}-embed-modal-submit-btn`}
        >
          Embed
        </Button>
      </DialogActions>
    </div>
  );
}

export default function AutoEmbedPlugin(): JSX.Element {
  const [modal, showModal] = useModal();

  const openEmbedModal = (embedConfig: PlaygroundEmbedConfig) => {
    showModal(`Embed ${embedConfig.contentName}`, (onClose) => (
      <AutoEmbedDialog 
        embedConfig={embedConfig}
        onClose={onClose} 
      />
    ));
  };

  const getMenuOptions = (
    activeEmbedConfig: PlaygroundEmbedConfig,
    embedFn: () => void,
    dismissFn: () => void
  ) => {
    return [
      new AutoEmbedOption("Dismiss", { onSelect: dismissFn }),
      new AutoEmbedOption(`Embed ${activeEmbedConfig.contentName}`, { onSelect: embedFn }),
    ];
  };

  return (
    <>
      {modal}
      <LexicalAutoEmbedPlugin<PlaygroundEmbedConfig>
        embedConfigs={EmbedConfigs}
        onOpenEmbedModalForConfig={openEmbedModal}
        getMenuOptions={getMenuOptions}
        menuRenderFn={(
          anchorElementRef, { selectedIndex, options, selectOptionAndCleanUp, setHighlightedIndex }
        ) =>
          anchorElementRef.current
            ? createPortal(
                <div
                  className="typeahead-popover auto-embed-menu bg-[#f8f8f8] dark:bg-gray-900"
                  style={{ marginLeft: anchorElementRef.current.style.width, width: 200 }}
                >
                  <AutoEmbedMenu
                    options={options}
                    selectedItemIndex={selectedIndex}
                    onOptionClick={(option: AutoEmbedOption, index: number) => {
                      setHighlightedIndex(index);
                      selectOptionAndCleanUp(option);
                    }}
                    onOptionMouseEnter={(index: number) => setHighlightedIndex(index)}
                  />
                </div>,
                anchorElementRef.current
              )
            : null
        }
      />
    </>
  );
}
