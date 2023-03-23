const hostName = window.location.hostname;

export const isDevPlayground = hostName !== 'playground.lexical.dev' && hostName !== 'lexical-playground.vercel.app';

export const DEFAULT_SETTINGS = {
    disableBeforeInput: false,
    emptyEditor: isDevPlayground,
    isAutocomplete: false,
    isCharLimit: false,
    isCharLimitUtf8: false,
    isCollab: false,
    isMaxLength: false,
    isRichText: true,
    measureTypingPerf: false,
    showNestedEditorTreeView: false,
    showTableOfContents: false,
    showTreeView: true,
};