import { useEffect } from 'react';

import { 
    COMMAND_PRIORITY_LOW,
    KEY_ARROW_LEFT_COMMAND,
    KEY_ARROW_UP_COMMAND,
    KEY_ARROW_DOWN_COMMAND,
    KEY_ESCAPE_COMMAND,
    KEY_SPACE_COMMAND,
    $getNearestNodeFromDOMNode,
    $getSelection,
    $isRangeSelection,
    LexicalNode,
    $isElementNode,
    LexicalEditor,
} from 'lexical';

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';

import { mergeRegister, $findMatchingParent, isHTMLElement } from '@lexical/utils';

import { 
    $isListItemNode,
    INSERT_CHECK_LIST_COMMAND,
    insertList,
    $isListNode
} from '../../nodes/ListNode';

export function CheckListPlugin() {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    return mergeRegister(editor.registerCommand(INSERT_CHECK_LIST_COMMAND, () => {
      insertList(editor, 'check');
      return true;
    }, COMMAND_PRIORITY_LOW), editor.registerCommand(KEY_ARROW_DOWN_COMMAND, (event: KeyboardEvent) => {
      return handleArrownUpOrDown(event, editor, false);
    }, COMMAND_PRIORITY_LOW), editor.registerCommand(KEY_ARROW_UP_COMMAND, (event: KeyboardEvent) => {
      return handleArrownUpOrDown(event, editor, true);
    }, COMMAND_PRIORITY_LOW), editor.registerCommand(KEY_ESCAPE_COMMAND, (event: KeyboardEvent) => {
      const activeItem = getActiveCheckListItem();

      if (activeItem != null) {
        const rootElement = editor.getRootElement();

        if (rootElement != null) rootElement.focus();

        return true;
      }

      return false;
    }, COMMAND_PRIORITY_LOW), editor.registerCommand(KEY_SPACE_COMMAND, (event: KeyboardEvent) => {
      const activeItem = getActiveCheckListItem();

      if (activeItem != null && editor.isEditable()) {
        editor.update(() => {
          const listItemNode = $getNearestNodeFromDOMNode(activeItem);

          if ($isListItemNode(listItemNode)) {
            event.preventDefault();
            listItemNode?.toggleChecked();
          }
        });
        return true;
      }

      return false;
    }, COMMAND_PRIORITY_LOW), editor.registerCommand(KEY_ARROW_LEFT_COMMAND, (event: KeyboardEvent) => {
      return editor.getEditorState().read(() => {
        const selection = $getSelection();

        if ($isRangeSelection(selection) && selection.isCollapsed()) {
          const {
            anchor
          } = selection;
          const isElement = anchor.type === 'element';

          if (isElement || anchor.offset === 0) {
            const anchorNode = anchor.getNode();
            const elementNode = $findMatchingParent(anchorNode, (node: LexicalNode) => $isElementNode(node) && !node.isInline());

            if (elementNode && $isListItemNode(elementNode)) {
              const parent = elementNode?.getParent();

              if (parent && ($isListNode(parent) && parent.getListType() === 'check' && (isElement || elementNode?.getFirstDescendant() === anchorNode))) {
                const domNode = editor.getElementByKey(elementNode.__key);

                if (domNode != null && document.activeElement !== domNode) {
                  domNode.focus();
                  event.preventDefault();
                  return true;
                }
              }
            }
          }
        }

        return false;
      });
    }, COMMAND_PRIORITY_LOW), editor.registerRootListener((rootElement: any, prevElement: any) => {
      if (rootElement !== null) {
        rootElement.addEventListener('click', handleClick);
        rootElement.addEventListener('pointerdown', handlePointerDown);
      }

      if (prevElement !== null) {
        prevElement.removeEventListener('click', handleClick);
        prevElement.removeEventListener('pointerdown', handlePointerDown);
      }
    }));
  });
  return null;
}

function handleCheckItemEvent(event: any, callback: () => any) {
  const target = event.target;

  if (target === null || !isHTMLElement(target)) {
    return;
  } // Ignore clicks on LI that have nested lists


  const firstChild = target.firstChild;

  if (firstChild != null && isHTMLElement(firstChild) && (firstChild.tagName === 'UL' || firstChild.tagName === 'OL')) {
    return;
  }

  const parentNode = target.parentNode; // @ts-ignore internal field

  if (!parentNode || parentNode.__lexicalListType !== 'check') {
    return;
  }

  const pageX = event.pageX;
  const rect = target.getBoundingClientRect();

  if (target.dir === 'rtl' ? pageX < rect.right && pageX > rect.right - 20 : pageX > rect.left && pageX < rect.left + 20) {
    callback();
  }
}

function handleClick(event: any) {
  handleCheckItemEvent(event, () => {
    const domNode = event.target;
    const editor = findEditor(domNode);

    if (editor != null && editor.isEditable()) {
      editor.update(() => {
        if (event.target) {
          const node = $getNearestNodeFromDOMNode(domNode);

          if ($isListItemNode(node)) {
            domNode?.focus();
            node?.toggleChecked();
          }
        }
      });
    }
  });
}

function handlePointerDown(event: MouseEvent) {
  handleCheckItemEvent(event, () => {
    // Prevents caret moving when clicking on check mark
    event.preventDefault();
  });
}

function findEditor(target: LexicalNode) {
  let node = target;

  while (node) {
    if (node.__lexicalEditor) {
      return node.__lexicalEditor;
    }

    node = node.parentNode;
  }

  return null;
}

function getActiveCheckListItem() {
  const activeElement = document.activeElement;
  return activeElement != null && activeElement.tagName === 'LI' && activeElement.parentNode != null && // @ts-ignore internal field
  activeElement.parentNode.__lexicalListType === 'check' ? activeElement : null;
}

function findCheckListItemSibling(node: LexicalNode, backward: LexicalNode) {
  let sibling = backward ? node.getPreviousSibling() : node.getNextSibling();
  let parent = node; // Going up in a tree to get non-null sibling

  while (sibling == null && $isListItemNode(parent)) {
    // Get li -> parent ul/ol -> parent li
    parent = parent.getParentOrThrow().getParent() as LexicalNode;

    if (parent != null) {
      sibling = backward ? parent.getPreviousSibling() : parent.getNextSibling();
    }
  } // Going down in a tree to get first non-nested list item


  while ($isListItemNode(sibling)) {
    const firstChild = backward ? sibling?.getLastChild() : sibling?.getFirstChild();

    if (!$isListNode(firstChild)) {
      return sibling;
    }

    sibling = backward ? firstChild.getLastChild() : firstChild.getFirstChild();
  }

  return null;
}

function handleArrownUpOrDown(event: KeyboardEvent, editor: LexicalEditor, backward: LexicalNode | boolean) {
  const activeItem = getActiveCheckListItem();

  if (activeItem != null) {
    editor.update(() => {
      const listItem = $getNearestNodeFromDOMNode(activeItem);

      if (!$isListItemNode(listItem)) {
        return;
      }

      const nextListItem = findCheckListItemSibling(listItem as LexicalNode, backward as LexicalNode);

      if (nextListItem != null) {
        nextListItem.selectStart();
        const dom = editor.getElementByKey(nextListItem.__key);

        if (dom != null) {
          event.preventDefault();
          setTimeout(() => {
            dom.focus();
          }, 0);
        }
      }
    });
  }

  return false;
}