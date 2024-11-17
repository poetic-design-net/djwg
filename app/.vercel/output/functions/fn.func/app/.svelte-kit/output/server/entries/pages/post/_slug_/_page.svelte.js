import { g as slot, d as bind_props, p as push, k as element, c as pop, j as ensure_array_like, f as store_get, e as stringify, u as unsubscribe_stores } from "../../../../chunks/index3.js";
import { a as attr } from "../../../../chunks/attributes.js";
import { J as fallback } from "../../../../chunks/utils.js";
import { e as escape_html } from "../../../../chunks/escaping.js";
import imageUrlBuilder from "@sanity/image-url";
import { c as client } from "../../../../chunks/client.js";
import { u as useQuery } from "../../../../chunks/createQueryStore.js";
function ownKeys(e, r) {
  var t = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    r && (o = o.filter(function(r2) {
      return Object.getOwnPropertyDescriptor(e, r2).enumerable;
    })), t.push.apply(t, o);
  }
  return t;
}
function _objectSpread(e) {
  for (var r = 1; r < arguments.length; r++) {
    var t = null != arguments[r] ? arguments[r] : {};
    r % 2 ? ownKeys(Object(t), true).forEach(function(r2) {
      _defineProperty(e, r2, t[r2]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function(r2) {
      Object.defineProperty(e, r2, Object.getOwnPropertyDescriptor(t, r2));
    });
  }
  return e;
}
function _defineProperty(e, r, t) {
  return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: true, configurable: true, writable: true }) : e[r] = t, e;
}
function _toPropertyKey(t) {
  var i = _toPrimitive(t, "string");
  return "symbol" == typeof i ? i : i + "";
}
function _toPrimitive(t, r) {
  if ("object" != typeof t || !t) return t;
  var e = t[Symbol.toPrimitive];
  if (void 0 !== e) {
    var i = e.call(t, r || "default");
    if ("object" != typeof i) return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return ("string" === r ? String : Number)(t);
}
function isPortableTextSpan(node) {
  return node._type === "span" && "text" in node && typeof node.text == "string" && (typeof node.marks > "u" || Array.isArray(node.marks) && node.marks.every((mark) => typeof mark == "string"));
}
function isPortableTextBlock(node) {
  return (
    // A block doesn't _have_ to be named 'block' - to differentiate between
    // allowed child types and marks, one might name them differently
    typeof node._type == "string" && // Toolkit-types like nested spans are @-prefixed
    node._type[0] !== "@" && // `markDefs` isn't _required_ per say, but if it's there, it needs to be an array
    (!("markDefs" in node) || !node.markDefs || Array.isArray(node.markDefs) && // Every mark definition needs to have an `_key` to be mappable in child spans
    node.markDefs.every((def) => typeof def._key == "string")) && // `children` is required and needs to be an array
    "children" in node && Array.isArray(node.children) && // All children are objects with `_type` (usually spans, but can contain other stuff)
    node.children.every((child) => typeof child == "object" && "_type" in child)
  );
}
function isPortableTextListItemBlock(block) {
  return isPortableTextBlock(block) && "listItem" in block && typeof block.listItem == "string" && (typeof block.level > "u" || typeof block.level == "number");
}
function isPortableTextToolkitList(block) {
  return block._type === "@list";
}
function isPortableTextToolkitSpan(span) {
  return span._type === "@span";
}
function isPortableTextToolkitTextNode(node) {
  return node._type === "@text";
}
const knownDecorators = ["strong", "em", "code", "underline", "strike-through"];
function sortMarksByOccurences(span, index, blockChildren) {
  if (!isPortableTextSpan(span) || !span.marks) return [];
  if (!span.marks.length) return [];
  const marks = span.marks.slice(), occurences = {};
  return marks.forEach((mark) => {
    occurences[mark] = 1;
    for (let siblingIndex = index + 1; siblingIndex < blockChildren.length; siblingIndex++) {
      const sibling = blockChildren[siblingIndex];
      if (sibling && isPortableTextSpan(sibling) && Array.isArray(sibling.marks) && sibling.marks.indexOf(mark) !== -1) occurences[mark]++;
      else break;
    }
  }), marks.sort((markA, markB) => sortMarks(occurences, markA, markB));
}
function sortMarks(occurences, markA, markB) {
  const aOccurences = occurences[markA], bOccurences = occurences[markB];
  if (aOccurences !== bOccurences) return bOccurences - aOccurences;
  const aKnownPos = knownDecorators.indexOf(markA), bKnownPos = knownDecorators.indexOf(markB);
  return aKnownPos !== bKnownPos ? aKnownPos - bKnownPos : markA.localeCompare(markB);
}
function buildMarksTree(block) {
  var _a;
  const {
    children,
    markDefs = []
  } = block;
  if (!children || !children.length) return [];
  const sortedMarks = children.map(sortMarksByOccurences), rootNode = {
    _type: "@span",
    children: [],
    markType: "<unknown>"
  };
  let nodeStack = [rootNode];
  for (let i = 0; i < children.length; i++) {
    const span = children[i];
    if (!span) continue;
    const marksNeeded = sortedMarks[i] || [];
    let pos = 1;
    if (nodeStack.length > 1) for (pos; pos < nodeStack.length; pos++) {
      const mark = ((_a = nodeStack[pos]) == null ? void 0 : _a.markKey) || "", index = marksNeeded.indexOf(mark);
      if (index === -1) break;
      marksNeeded.splice(index, 1);
    }
    nodeStack = nodeStack.slice(0, pos);
    let currentNode = nodeStack[nodeStack.length - 1];
    if (currentNode) {
      for (const markKey of marksNeeded) {
        const markDef = markDefs.find((def) => def._key === markKey), markType = markDef ? markDef._type : markKey, node = {
          _type: "@span",
          _key: span._key,
          children: [],
          markDef,
          markType,
          markKey
        };
        currentNode.children.push(node), nodeStack.push(node), currentNode = node;
      }
      if (isPortableTextSpan(span)) {
        const lines = span.text.split(`
`);
        for (let line = lines.length; line-- > 1; ) lines.splice(line, 0, `
`);
        currentNode.children = currentNode.children.concat(lines.map((text) => ({
          _type: "@text",
          text
        })));
      } else currentNode.children = currentNode.children.concat(span);
    }
  }
  return rootNode.children;
}
function nestLists(blocks, mode) {
  const tree = [];
  let currentList;
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    if (block) {
      if (!isPortableTextListItemBlock(block)) {
        tree.push(block), currentList = void 0;
        continue;
      }
      if (!currentList) {
        currentList = listFromBlock(block, i, mode), tree.push(currentList);
        continue;
      }
      if (blockMatchesList(block, currentList)) {
        currentList.children.push(block);
        continue;
      }
      if ((block.level || 1) > currentList.level) {
        const newList = listFromBlock(block, i, mode);
        {
          const lastListItem = currentList.children[currentList.children.length - 1], newLastChild = _objectSpread(_objectSpread({}, lastListItem), {}, {
            children: [...lastListItem.children, newList]
          });
          currentList.children[currentList.children.length - 1] = newLastChild;
        }
        currentList = newList;
        continue;
      }
      if ((block.level || 1) < currentList.level) {
        const matchingBranch = tree[tree.length - 1], match = matchingBranch && findListMatching(matchingBranch, block);
        if (match) {
          currentList = match, currentList.children.push(block);
          continue;
        }
        currentList = listFromBlock(block, i, mode), tree.push(currentList);
        continue;
      }
      if (block.listItem !== currentList.listItem) {
        const matchingBranch = tree[tree.length - 1], match = matchingBranch && findListMatching(matchingBranch, {
          level: block.level || 1
        });
        if (match && match.listItem === block.listItem) {
          currentList = match, currentList.children.push(block);
          continue;
        } else {
          currentList = listFromBlock(block, i, mode), tree.push(currentList);
          continue;
        }
      }
      console.warn("Unknown state encountered for block", block), tree.push(block);
    }
  }
  return tree;
}
function blockMatchesList(block, list) {
  return (block.level || 1) === list.level && block.listItem === list.listItem;
}
function listFromBlock(block, index, mode) {
  return {
    _type: "@list",
    _key: `${block._key || `${index}`}-parent`,
    mode,
    level: block.level || 1,
    listItem: block.listItem,
    children: [block]
  };
}
function findListMatching(rootNode, matching) {
  const level = matching.level || 1, style = matching.listItem || "normal", filterOnType = typeof matching.listItem == "string";
  if (isPortableTextToolkitList(rootNode) && (rootNode.level || 1) === level && filterOnType && (rootNode.listItem || "normal") === style) return rootNode;
  if (!("children" in rootNode)) return;
  const node = rootNode.children[rootNode.children.length - 1];
  return node && !isPortableTextSpan(node) ? findListMatching(node, matching) : void 0;
}
function spanToPlainText(span) {
  let text = "";
  return span.children.forEach((current) => {
    isPortableTextToolkitTextNode(current) ? text += current.text : isPortableTextToolkitSpan(current) && (text += spanToPlainText(current));
  }), text;
}
const LIST_NEST_MODE_HTML = "html";
function getRandomKey() {
  return Math.random().toFixed(5).split(".")[1];
}
function assertSpanKey(span) {
  return {
    _key: span._key || getRandomKey(),
    ...span
  };
}
function assertBlockKey(block) {
  return {
    _key: block._key || getRandomKey(),
    ...block,
    ...block._type === "block" && Array.isArray(block.children) ? {
      children: block.children.map(assertSpanKey)
    } : {}
  };
}
function DefaultMark($$payload, $$props) {
  let markType;
  let portableText = $$props["portableText"];
  ({ markType } = portableText);
  if (markType === "strong") {
    $$payload.out += "<!--[-->";
    $$payload.out += `<strong><!---->`;
    slot($$payload, $$props, "default", {});
    $$payload.out += `<!----></strong>`;
  } else {
    $$payload.out += "<!--[!-->";
    if (markType === "em") {
      $$payload.out += "<!--[-->";
      $$payload.out += `<em><!---->`;
      slot($$payload, $$props, "default", {});
      $$payload.out += `<!----></em>`;
    } else {
      $$payload.out += "<!--[!-->";
      if (markType === "code") {
        $$payload.out += "<!--[-->";
        $$payload.out += `<code><!---->`;
        slot($$payload, $$props, "default", {});
        $$payload.out += `<!----></code>`;
      } else {
        $$payload.out += "<!--[!-->";
        if (markType === "underline") {
          $$payload.out += "<!--[-->";
          $$payload.out += `<span style="text-decoration:underline;"><!---->`;
          slot($$payload, $$props, "default", {});
          $$payload.out += `<!----></span>`;
        } else {
          $$payload.out += "<!--[!-->";
          if (markType === "strike-through") {
            $$payload.out += "<!--[-->";
            $$payload.out += `<del><!---->`;
            slot($$payload, $$props, "default", {});
            $$payload.out += `<!----></del>`;
          } else {
            $$payload.out += "<!--[!-->";
            $$payload.out += `<!---->`;
            slot($$payload, $$props, "default", {});
            $$payload.out += `<!---->`;
          }
          $$payload.out += `<!--]-->`;
        }
        $$payload.out += `<!--]-->`;
      }
      $$payload.out += `<!--]-->`;
    }
    $$payload.out += `<!--]-->`;
  }
  $$payload.out += `<!--]-->`;
  bind_props($$props, { portableText });
}
function DefaultLink($$payload, $$props) {
  let value, href;
  let portableText = $$props["portableText"];
  ({ value } = portableText);
  href = value?.href || value?.url || value?.link || value?.value;
  if (typeof href === "string") {
    $$payload.out += "<!--[-->";
    $$payload.out += `<a${attr("href", href)}><!---->`;
    slot($$payload, $$props, "default", {});
    $$payload.out += `<!----></a>`;
  } else {
    $$payload.out += "<!--[!-->";
    $$payload.out += `<!---->`;
    slot($$payload, $$props, "default", {});
    $$payload.out += `<!---->`;
  }
  $$payload.out += `<!--]-->`;
  bind_props($$props, { portableText });
}
function DefaultBlock($$payload, $$props) {
  push();
  let value, style;
  let portableText = $$props["portableText"];
  ({ value } = portableText);
  style = value.style || "normal";
  if ([
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "blockquote"
  ].includes(style)) {
    $$payload.out += "<!--[-->";
    element($$payload, style, void 0, () => {
      $$payload.out += `<!---->`;
      slot($$payload, $$props, "default", {});
      $$payload.out += `<!---->`;
    });
  } else {
    $$payload.out += "<!--[!-->";
    if (style === "normal") {
      $$payload.out += "<!--[-->";
      $$payload.out += `<p><!---->`;
      slot($$payload, $$props, "default", {});
      $$payload.out += `<!----></p>`;
    } else {
      $$payload.out += "<!--[!-->";
      $$payload.out += `<!---->`;
      slot($$payload, $$props, "default", {});
      $$payload.out += `<!---->`;
    }
    $$payload.out += `<!--]-->`;
  }
  $$payload.out += `<!--]-->`;
  bind_props($$props, { portableText });
  pop();
}
function DefaultList($$payload, $$props) {
  let value, listItem;
  let portableText = $$props["portableText"];
  ({ value } = portableText);
  ({ listItem } = value);
  if (listItem === "number") {
    $$payload.out += "<!--[-->";
    $$payload.out += `<ol><!---->`;
    slot($$payload, $$props, "default", {});
    $$payload.out += `<!----></ol>`;
  } else {
    $$payload.out += "<!--[!-->";
    $$payload.out += `<ul><!---->`;
    slot($$payload, $$props, "default", {});
    $$payload.out += `<!----></ul>`;
  }
  $$payload.out += `<!--]-->`;
  bind_props($$props, { portableText });
}
function DefaultListItem($$payload, $$props) {
  $$payload.out += `<li><!---->`;
  slot($$payload, $$props, "default", {});
  $$payload.out += `<!----></li>`;
}
function DefaultHardBreak($$payload) {
  $$payload.out += `<br>`;
}
function UnknownType($$payload, $$props) {
  $$payload.out += `<!---->`;
  slot($$payload, $$props, "default", {});
  $$payload.out += `<!---->`;
}
const defaultComponents = {
  marks: {
    "strike-through": DefaultMark,
    code: DefaultMark,
    em: DefaultMark,
    strong: DefaultMark,
    underline: DefaultMark,
    link: DefaultLink
  },
  block: {
    blockquote: DefaultBlock,
    h1: DefaultBlock,
    h2: DefaultBlock,
    h3: DefaultBlock,
    h4: DefaultBlock,
    h5: DefaultBlock,
    h6: DefaultBlock,
    normal: DefaultBlock
  },
  list: {
    bullet: DefaultList,
    number: DefaultList
  },
  listItem: {
    bullet: DefaultListItem,
    number: DefaultListItem
  },
  types: {},
  hardBreak: DefaultHardBreak,
  unknownBlockStyle: DefaultBlock,
  unknownList: DefaultList,
  unknownListItem: DefaultListItem,
  unknownMark: DefaultMark,
  unknownType: UnknownType
};
function mergeComponents(parent, overrides = {}) {
  return {
    ...parent,
    ...overrides,
    block: mergeDeeply(parent, overrides, "block"),
    list: mergeDeeply(parent, overrides, "list"),
    listItem: mergeDeeply(parent, overrides, "listItem"),
    marks: mergeDeeply(parent, overrides, "marks"),
    types: mergeDeeply(parent, overrides, "types")
  };
}
function mergeDeeply(parent, overrides, key) {
  const override = overrides[key];
  const parentVal = parent[key];
  if (typeof override === "function") {
    return override;
  }
  if (override && typeof parentVal === "function") {
    return override;
  }
  if (override) {
    return { ...parentVal, ...override };
  }
  return parentVal;
}
function RenderBlock($$payload, $$props) {
  push();
  let components, style, blockComponent, blockProps;
  let global = $$props["global"];
  let node = $$props["node"];
  let indexInParent = $$props["indexInParent"];
  ({ components } = global);
  ({ style = "normal" } = node);
  blockComponent = typeof components.block === "function" ? components.block : components.block[style];
  if (!blockComponent) {
    global.missingComponentHandler(style, "blockStyle");
  }
  blockProps = /* @__PURE__ */ (() => {
    return { global, indexInParent, value: node };
  })();
  $$payload.out += `<!---->`;
  (blockComponent || components.unknownBlockStyle)?.($$payload, {
    portableText: blockProps,
    children: ($$payload2) => {
      $$payload2.out += `<!---->`;
      slot($$payload2, $$props, "default", {});
      $$payload2.out += `<!---->`;
    },
    $$slots: { default: true }
  });
  $$payload.out += `<!---->`;
  bind_props($$props, { global, node, indexInParent });
  pop();
}
function RenderCustomBlock($$payload, $$props) {
  push();
  let components, _type, customComponent, componentProps;
  let global = $$props["global"];
  let node = $$props["node"];
  let parentBlock = $$props["parentBlock"];
  let indexInParent = $$props["indexInParent"];
  let isInline = fallback($$props["isInline"], false);
  ({ components } = global);
  ({ _type } = node);
  customComponent = components.types[_type];
  if (!customComponent) {
    global.missingComponentHandler(_type, "block");
  }
  componentProps = /* @__PURE__ */ (() => {
    return {
      global,
      value: node,
      indexInParent,
      parentBlock,
      isInline
    };
  })();
  $$payload.out += `<!---->`;
  (customComponent || components.unknownType)?.($$payload, { portableText: componentProps });
  $$payload.out += `<!---->`;
  bind_props($$props, {
    global,
    node,
    parentBlock,
    indexInParent,
    isInline
  });
  pop();
}
function RenderList($$payload, $$props) {
  push();
  let components, listItem, handler, listComponent, listProps;
  let global = $$props["global"];
  let indexInParent = $$props["indexInParent"];
  let node = $$props["node"];
  ({ components } = global);
  ({ listItem } = node);
  handler = typeof components.list === "function" ? components.list : components.list[listItem];
  listComponent = handler;
  if (!listComponent) {
    global.missingComponentHandler(listItem, "listStyle");
  }
  listProps = /* @__PURE__ */ (() => {
    return { global, value: node, indexInParent };
  })();
  $$payload.out += `<!---->`;
  (listComponent || components.unknownList)?.($$payload, {
    portableText: listProps,
    children: ($$payload2) => {
      $$payload2.out += `<!---->`;
      slot($$payload2, $$props, "default", {});
      $$payload2.out += `<!---->`;
    },
    $$slots: { default: true }
  });
  $$payload.out += `<!---->`;
  bind_props($$props, { global, indexInParent, node });
  pop();
}
function RenderListItem($$payload, $$props) {
  push();
  let components, style, listItemComponent, styleComponent, listItemProps;
  let global = $$props["global"];
  let indexInParent = $$props["indexInParent"];
  let node = $$props["node"];
  ({ components } = global);
  ({ style = "normal" } = node);
  listItemComponent = typeof components.listItem === "function" ? components.listItem : components.listItem[style];
  if (!listItemComponent) {
    global.missingComponentHandler(style, "listItemStyle");
  }
  styleComponent = style !== "normal" ? components.block[style] : void 0;
  listItemProps = /* @__PURE__ */ (() => {
    return { global, value: node, indexInParent };
  })();
  $$payload.out += `<!---->`;
  (listItemComponent || components.unknownListItem)?.($$payload, {
    portableText: listItemProps,
    children: ($$payload2) => {
      if (styleComponent) {
        $$payload2.out += "<!--[-->";
        $$payload2.out += `<!---->`;
        styleComponent?.($$payload2, {
          portableText: {
            // Different props for the block that will hold this list
            ...listItemProps,
            value: {
              ...node,
              // BlockComponentProps shouldn't receive a listItem
              listItem: void 0
            }
          },
          children: ($$payload3) => {
            $$payload3.out += `<!---->`;
            slot($$payload3, $$props, "default", {});
            $$payload3.out += `<!---->`;
          },
          $$slots: { default: true }
        });
        $$payload2.out += `<!---->`;
      } else {
        $$payload2.out += "<!--[!-->";
        $$payload2.out += `<!---->`;
        slot($$payload2, $$props, "default", {});
        $$payload2.out += `<!---->`;
      }
      $$payload2.out += `<!--]-->`;
    },
    $$slots: { default: true }
  });
  $$payload.out += `<!---->`;
  bind_props($$props, { global, indexInParent, node });
  pop();
}
function RenderSpan($$payload, $$props) {
  push();
  let components, markType, markComponent, markProps;
  let global = $$props["global"];
  let node = $$props["node"];
  let parentBlock = $$props["parentBlock"];
  ({ components } = global);
  ({ markType } = node);
  markComponent = components.marks[markType];
  if (!markComponent) {
    global.missingComponentHandler(markType, "mark");
  }
  markProps = (() => {
    return {
      global,
      parentBlock,
      markType,
      value: node.markDef,
      markKey: node.markKey,
      plainTextContent: spanToPlainText(node)
    };
  })();
  $$payload.out += `<!---->`;
  (markComponent || components.unknownMark)?.($$payload, {
    portableText: markProps,
    children: ($$payload2) => {
      $$payload2.out += `<!---->`;
      slot($$payload2, $$props, "default", {});
      $$payload2.out += `<!---->`;
    },
    $$slots: { default: true }
  });
  $$payload.out += `<!---->`;
  bind_props($$props, { global, node, parentBlock });
  pop();
}
function RenderText($$payload, $$props) {
  let components, text;
  let global = $$props["global"];
  let node = $$props["node"];
  ({ components } = global);
  ({ text } = node);
  if (text === "\n") {
    $$payload.out += "<!--[-->";
    if (typeof components.hardBreak === "function") {
      $$payload.out += "<!--[-->";
      $$payload.out += `<!---->`;
      components.hardBreak?.($$payload, {});
      $$payload.out += `<!---->`;
    } else {
      $$payload.out += "<!--[!-->";
      $$payload.out += `${escape_html(text)}`;
    }
    $$payload.out += `<!--]-->`;
  } else {
    $$payload.out += "<!--[!-->";
    $$payload.out += `${escape_html(text)}`;
  }
  $$payload.out += `<!--]-->`;
  bind_props($$props, { global, node });
}
function RenderNode($$payload, $$props) {
  push();
  let node, indexInParent, parentBlock, isInline;
  let global = $$props["global"];
  let options = $$props["options"];
  ({ node, indexInParent, parentBlock, isInline } = options);
  if (isPortableTextToolkitList(node)) {
    $$payload.out += "<!--[-->";
    RenderList($$payload, {
      node,
      indexInParent,
      global,
      children: ($$payload2) => {
        const each_array = ensure_array_like(node.children);
        $$payload2.out += `<!--[-->`;
        for (let childIndex = 0, $$length = each_array.length; childIndex < $$length; childIndex++) {
          let child = each_array[childIndex];
          RenderNode($$payload2, {
            options: {
              node: child,
              indexInParent: childIndex,
              // The list's children will be parsed as PortableTextListItem, which will pass the proper parentBlock & isInline
              parentBlock: void 0,
              isInline: void 0
            },
            global
          });
          $$payload2.out += `<!---->`;
        }
        $$payload2.out += `<!--]-->`;
      },
      $$slots: { default: true }
    });
  } else {
    $$payload.out += "<!--[!-->";
    if (isPortableTextListItemBlock(node)) {
      $$payload.out += "<!--[-->";
      RenderListItem($$payload, {
        node,
        indexInParent,
        global,
        children: ($$payload2) => {
          const each_array_1 = ensure_array_like(buildMarksTree(node));
          $$payload2.out += `<!--[-->`;
          for (let childIndex = 0, $$length = each_array_1.length; childIndex < $$length; childIndex++) {
            let child = each_array_1[childIndex];
            RenderNode($$payload2, {
              options: {
                // Pass the current listItem as a parentBlock
                parentBlock: node,
                node: child,
                isInline: true,
                indexInParent: childIndex
              },
              global
            });
            $$payload2.out += `<!---->`;
          }
          $$payload2.out += `<!--]-->`;
        },
        $$slots: { default: true }
      });
    } else {
      $$payload.out += "<!--[!-->";
      if (isPortableTextToolkitSpan(node)) {
        $$payload.out += "<!--[-->";
        RenderSpan($$payload, {
          node,
          parentBlock,
          global,
          children: ($$payload2) => {
            const each_array_2 = ensure_array_like(node.children);
            $$payload2.out += `<!--[-->`;
            for (let childIndex = 0, $$length = each_array_2.length; childIndex < $$length; childIndex++) {
              let child = each_array_2[childIndex];
              RenderNode($$payload2, {
                options: {
                  parentBlock,
                  node: child,
                  isInline: true,
                  indexInParent: childIndex
                },
                global
              });
              $$payload2.out += `<!---->`;
            }
            $$payload2.out += `<!--]-->`;
          },
          $$slots: { default: true }
        });
      } else {
        $$payload.out += "<!--[!-->";
        if (isPortableTextBlock(node)) {
          $$payload.out += "<!--[-->";
          RenderBlock($$payload, {
            node,
            indexInParent,
            global,
            children: ($$payload2) => {
              const each_array_3 = ensure_array_like(buildMarksTree(node));
              $$payload2.out += `<!--[-->`;
              for (let childIndex = 0, $$length = each_array_3.length; childIndex < $$length; childIndex++) {
                let child = each_array_3[childIndex];
                RenderNode($$payload2, {
                  options: {
                    parentBlock: node,
                    node: child,
                    isInline: true,
                    indexInParent: childIndex
                  },
                  global
                });
                $$payload2.out += `<!---->`;
              }
              $$payload2.out += `<!--]-->`;
            },
            $$slots: { default: true }
          });
        } else {
          $$payload.out += "<!--[!-->";
          if (isPortableTextToolkitTextNode(node)) {
            $$payload.out += "<!--[-->";
            RenderText($$payload, { node, global });
          } else {
            $$payload.out += "<!--[!-->";
            if (node) {
              $$payload.out += "<!--[-->";
              RenderCustomBlock($$payload, {
                node,
                parentBlock,
                indexInParent,
                isInline,
                global
              });
            } else {
              $$payload.out += "<!--[!-->";
            }
            $$payload.out += `<!--]-->`;
          }
          $$payload.out += `<!--]-->`;
        }
        $$payload.out += `<!--]-->`;
      }
      $$payload.out += `<!--]-->`;
    }
    $$payload.out += `<!--]-->`;
  }
  $$payload.out += `<!--]-->`;
  bind_props($$props, { global, options });
  pop();
}
const getTemplate = (type, prop) => `Unknown ${type}, specify a component for it in the \`components${prop ? "." : ""}${prop}\` prop`;
const getWarningMessage = (type, nodeType) => {
  switch (nodeType) {
    case "block":
      return getTemplate(`block type "${type}"`, "types");
    case "blockStyle":
      return getTemplate(`block style "${type}"`, "block");
    case "listItemStyle":
      return getTemplate(`list item style "${type}"`, "listItem");
    case "listStyle":
      return getTemplate(`list style "${type}"`, "list");
    case "mark":
      return getTemplate(`mark type "${type}"`, "marks");
    default:
      return getTemplate("type");
  }
};
function printWarning(message) {
  console.warn(message);
}
function PortableText($$payload, $$props) {
  push();
  let mergedComponents, keyedBlocks, blocks, missingComponentHandler;
  let value = fallback($$props["value"], () => [], true);
  let components = $$props["components"];
  let context = fallback($$props["context"], () => ({}), true);
  let onMissingComponent = fallback($$props["onMissingComponent"], true);
  mergedComponents = mergeComponents(defaultComponents, components);
  keyedBlocks = (Array.isArray(value) ? value : [value]).map(assertBlockKey);
  blocks = nestLists(keyedBlocks, LIST_NEST_MODE_HTML);
  missingComponentHandler = (type, nodeType) => {
    if (onMissingComponent === false) {
      return;
    }
    const message = getWarningMessage(type, nodeType);
    if (typeof onMissingComponent === "function") {
      onMissingComponent(message, { type, nodeType });
      return;
    }
    printWarning(message);
  };
  const each_array = ensure_array_like(blocks);
  $$payload.out += `<!--[-->`;
  for (let index = 0, $$length = each_array.length; index < $$length; index++) {
    let node = each_array[index];
    RenderNode($$payload, {
      global: {
        components: mergedComponents,
        missingComponentHandler,
        context,
        ptBlocks: blocks,
        ptRawValue: value
      },
      options: { node, isInline: false, indexInParent: index }
    });
  }
  $$payload.out += `<!--]-->`;
  bind_props($$props, {
    value,
    components,
    context,
    onMissingComponent
  });
  pop();
}
function formatDate(date) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric"
  });
}
const builder = imageUrlBuilder(client);
function urlFor(source) {
  return builder.image(source);
}
function _page($$payload, $$props) {
  push();
  var $$store_subs;
  let post;
  let data = $$props["data"];
  const q = useQuery(data);
  ({ data: post } = store_get($$store_subs ??= {}, "$q", q));
  $$payload.out += `<section class="post svelte-18b3js2">`;
  if (post.mainImage) {
    $$payload.out += "<!--[-->";
    $$payload.out += `<img class="post__cover svelte-18b3js2"${attr("src", urlFor(post.mainImage).url())}${attr("alt", `Cover image for ${stringify(post.title)}`)}>`;
  } else {
    $$payload.out += "<!--[!-->";
    $$payload.out += `<div class="post__cover--none svelte-18b3js2"></div>`;
  }
  $$payload.out += `<!--]--> <div class="post__container svelte-18b3js2"><h1 class="post__title svelte-18b3js2">${escape_html(post.title)}</h1> `;
  if (post.excerpt) {
    $$payload.out += "<!--[-->";
    $$payload.out += `<p class="post__excerpt svelte-18b3js2">${escape_html(post.excerpt)}</p>`;
  } else {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]--> <p class="post__date svelte-18b3js2">${escape_html(formatDate(post._createdAt))}</p> `;
  if (post.body) {
    $$payload.out += "<!--[-->";
    $$payload.out += `<div class="post__content svelte-18b3js2">`;
    PortableText($$payload, { components: {}, value: post.body });
    $$payload.out += `<!----></div>`;
  } else {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]--></div></section>`;
  if ($$store_subs) unsubscribe_stores($$store_subs);
  bind_props($$props, { data });
  pop();
}
export {
  _page as default
};
