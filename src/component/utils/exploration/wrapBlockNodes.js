/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule wrapBlockNodes
 * @format
 * @flow
 */

'use strict';

import type {BlockNodeRecord} from 'BlockNodeRecord';
import type ContentState from 'ContentState';

const React = require('React');
const DraftOffsetKey = require('DraftOffsetKey');

const applyWrapperElementToSiblings = (
  wrapperTemplate: *,
  Element: string,
  nodes: Array<React.Node>,
): Array<React.Node> => {
  const wrappedSiblings = [];

  // we check back until we find a sibbling that does not have same wrapper
  for (const sibling: any of nodes.reverse()) {
    if (sibling.type !== Element) {
      break;
    }
    wrappedSiblings.push(sibling);
  }

  // we now should remove from acc the wrappedSiblings and add them back under same wrap
  nodes.splice(nodes.indexOf(wrappedSiblings[0]), wrappedSiblings.length + 1);

  const childrenIs = wrappedSiblings.reverse();

  const key = childrenIs[0].key;

  nodes.push(
    React.cloneElement(
      wrapperTemplate,
      {
        key: `${key}-wrap`,
        'data-offset-key': DraftOffsetKey.encode(key, 0, 0),
      },
      childrenIs,
    ),
  );

  return nodes;
};

/**
 * We will use this helper to identify blocks that need to be wrapped but have siblings that
 * also share the same wrapper element, this way we can do the wrapping once the last sibling
 * is added.
 */
const shouldNotAddWrapperElement = (
  block: BlockNodeRecord,
  contentState: ContentState,
): boolean => {
  const nextSiblingKey = block.getNextSiblingKey();

  return nextSiblingKey
    ? contentState.getBlockForKey(nextSiblingKey).getType() === block.getType()
    : false;
};

const wrapBlockNodes = (
  nodes: [
    {
      wrapperTemplate: *,
      block: *,
      element: *,
    },
  ],
  contentState,
) =>
  nodes.reduce((acc, {element, block, wrapperTemplate}) => {
    acc.push(element);

    if (!wrapperTemplate || shouldNotAddWrapperElement(block, contentState)) {
      return acc;
    }

    applyWrapperElementToSiblings(wrapperTemplate, element.type, acc);

    return acc;
  }, []);

module.exports = wrapBlockNodes;
