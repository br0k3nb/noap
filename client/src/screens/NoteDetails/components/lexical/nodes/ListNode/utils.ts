import type { LexicalNode } from 'lexical';

import invariant from '../../shared/invariant';

import {
  $createListItemNode,
  $isListItemNode,
  $isListNode,
  ListItemNode,
  ListNode,
} from './index';

export function $getListDepth(listNode: ListNode): number {
  let depth = 1;
  let parent = listNode.getParent();

  while (parent != null) {
    if ($isListItemNode(parent)) {
      const parentList = parent.getParent();

      if ($isListNode(parentList)) {
        depth++;
        parent = parentList.getParent();
        continue;
      }
      invariant(false, 'A ListItemNode must have a ListNode for a parent.');
    }

    return depth;
  }

  return depth;
}

export function $getTopListNode(listItem: LexicalNode): ListNode {
  let list = listItem.getParent<ListNode>();

  if (!$isListNode(list)) {
    invariant(false, 'A ListItemNode must have a ListNode for a parent.');
  }

  let parent: ListNode | null = list;

  while (parent !== null) {
    parent = parent.getParent();

    if ($isListNode(parent)) {
      list = parent;
    }
  }

  return list;
}

export function $isLastItemInList(listItem: ListItemNode): boolean {
  let isLast = true;
  const firstChild = listItem.getFirstChild();

  if ($isListNode(firstChild)) {
    return false;
  }
  let parent: ListItemNode | null = listItem;

  while (parent !== null) {
    if ($isListItemNode(parent)) {
      if (parent.getNextSiblings().length > 0) {
        isLast = false;
      }
    }

    parent = parent.getParent();
  }

  return isLast;
}

export function $getAllListItems(node: ListNode): Array<ListItemNode> {
  let listItemNodes: Array<ListItemNode> = [];
  const listChildren: Array<ListItemNode> = node
    .getChildren()
    .filter($isListItemNode);

  for (let i = 0; i < listChildren.length; i++) {
    const listItemNode = listChildren[i];
    const firstChild = listItemNode.getFirstChild();

    if ($isListNode(firstChild)) {
      listItemNodes = listItemNodes.concat($getAllListItems(firstChild));
    } else {
      listItemNodes.push(listItemNode);
    }
  }

  return listItemNodes;
}

export function isNestedListNode(
  node: LexicalNode | null | undefined,
): boolean {
  return $isListItemNode(node) && $isListNode(node.getFirstChild());
}

export function findNearestListItemNode(
  node: LexicalNode,
): ListItemNode | null {
  let currentNode: LexicalNode | null = node;

  while (currentNode !== null) {
    if ($isListItemNode(currentNode)) {
      return currentNode;
    }
    currentNode = currentNode.getParent();
  }

  return null;
}

export function $removeHighestEmptyListParent(
  sublist: ListItemNode | ListNode,
) {

  let emptyListPtr = sublist;

  while (
    emptyListPtr.getNextSibling() == null &&
    emptyListPtr.getPreviousSibling() == null
  ) {
    const parent = emptyListPtr.getParent<ListItemNode | ListNode>();

    if (
      parent == null ||
      !($isListItemNode(emptyListPtr) || $isListNode(emptyListPtr))
    ) {
      break;
    }

    emptyListPtr = parent;
  }

  emptyListPtr.remove();
}

export function wrapInListItem(node: LexicalNode): ListItemNode {
  const listItemWrapper = $createListItemNode();
  return listItemWrapper.append(node);
}
