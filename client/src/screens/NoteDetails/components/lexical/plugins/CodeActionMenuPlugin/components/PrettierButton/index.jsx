import './index.css';
import { $isCodeNode } from '@lexical/code';
import { $getNearestNodeFromDOMNode } from 'lexical';
import * as babelParser from 'prettier/parser-babel';
import * as htmlParser from 'prettier/parser-html';
import * as markdownParser from 'prettier/parser-markdown';
import * as cssParser from 'prettier/parser-postcss';
import { format } from 'prettier/standalone';
import * as React from 'react';
import { useState } from 'react';
const PRETTIER_OPTIONS_BY_LANG = {
    css: {
        parser: 'css',
        plugins: [cssParser],
    },
    html: {
        parser: 'html',
        plugins: [htmlParser],
    },
    js: {
        parser: 'babel',
        plugins: [babelParser],
    },
    markdown: {
        parser: 'markdown',
        plugins: [markdownParser],
    },
};
const LANG_CAN_BE_PRETTIER = Object.keys(PRETTIER_OPTIONS_BY_LANG);
export function canBePrettier(lang) {
    return LANG_CAN_BE_PRETTIER.includes(lang);
}
function getPrettierOptions(lang) {
    const options = PRETTIER_OPTIONS_BY_LANG[lang];
    if (!options) {
        throw new Error(`CodeActionMenuPlugin: Prettier does not support this language: ${lang}`);
    }
    return options;
}
export function PrettierButton({ lang, editor, getCodeDOMNode }) {
    const [syntaxError, setSyntaxError] = useState('');
    const [tipsVisible, setTipsVisible] = useState(false);
    async function handleClick() {
        const codeDOMNode = getCodeDOMNode();
        if (!codeDOMNode) {
            return;
        }
        editor.update(() => {
            const codeNode = $getNearestNodeFromDOMNode(codeDOMNode);
            if ($isCodeNode(codeNode)) {
                const content = codeNode.getTextContent();
                const options = getPrettierOptions(lang);
                let parsed = '';
                try {
                    parsed = format(content, options);
                }
                catch (error) {
                    if (error instanceof Error) {
                        setSyntaxError(error.message);
                        setTipsVisible(true);
                    }
                    else {
                        console.error('Unexpected error: ', error);
                    }
                }
                if (parsed !== '') {
                    const selection = codeNode.select(0);
                    selection.insertText(parsed);
                    setSyntaxError('');
                    setTipsVisible(false);
                }
            }
        });
    }
    function handleMouseEnter() {
        if (syntaxError !== '') {
            setTipsVisible(true);
        }
    }
    function handleMouseLeave() {
        if (syntaxError !== '') {
            setTipsVisible(false);
        }
    }
    return (<div className="prettier-wrapper">
      <button className="menu-item" onClick={handleClick} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} aria-label="prettier">
        {syntaxError ? (<i className="format prettier-error"/>) : (<i className="format prettier"/>)}
      </button>
      {tipsVisible ? (<pre className="code-error-tips">{syntaxError}</pre>) : null}
    </div>);
}
