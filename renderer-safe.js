// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.
var area = document.createElement("div");

function main() {
  setupUI();
}
main();

function setupUI() {
  area.id = "ta-main";
  area.contentEditable = true;
  area.addEventListener("keydown", e => parseKeyDown(e), false);
  area.addEventListener("keyup", e => parseKeyUp(e), false);
  document.body.appendChild(area);
}

function parseKeyUp(e) {
  // console.log(e.which);
  if (isLetter(e)) {
    if (e.which == 84) {
      parseCmdLetterWithNode("#t ");
    } else if (e.which == 72) {
      parseCmdLetterWithNode("#h ");
    }
  }
}

function parseCmdLetterWithNode(cmd) {
  var pos = getCaret();
  alert(pos.node.textContent.substring(pos.offset - cmd.length, pos.offset));
  if (
    pos.node.textContent.substring(pos.offset - cmd.length, pos.offset) == cmd
  ) {
    alert();
    pos.node.textContent =
      pos.node.textContent.substring(0, pos.offset - cmd.length) +
      pos.node.textContent.substring(pos.offset, pos.node.textContent.length);
    pos.offset -= cmd.length;
    setCaret(pos.node, pos.offset);
    var node;
    switch (cmd) {
      case "#t ":
        node = createTask();
        break;
      case "#h ":
        node = createHeading();
        break;
      default:
        break;
    }
    insertNode(node);
  }
}

function outermostParentWithClass(node, className) {
  var nodeWithClass = null;
  while (node.parentNode) {
    if (node.tagName == "BODY") {
      break;
    }
    if (hasClass(node, className)) {
      nodeWithClass = node;
    }
    node = node.parentNode;
  }
  return nodeWithClass;
}

function nextParentWithClass(node, className) {
  while (!hasClass(node, className)) {
    node = node.parentNode;
    if (node.nodeType == 9) {
      return null;
    }
  }
  return node;
}

function isFirstChildOfParentWithClass(node, className) {
  while (node.parentNode) {
    if (hasClass(node, className)) {
      return node;
    }
    node = node.parentNode;
  }
  return null;
}

function hasClass(node, className) {
  return (" " + node.className + " ").indexOf(" " + className + " ") > -1;
}

function createTask() {
  var div = document.createElement("div");
  var id = makeID("task-", 10);
  div.className = "wrapper";
  var inp = `<div class="task" id=${id}><input onClick="handleCheckBoxClick(event)" type="checkbox" class="check-box"/></div>`;
  div.innerHTML = inp;
  return div;
}

function createHeading() {
  var div = document.createElement("div");
  var id = makeID("heading-", 10);
  div.className = "wrapper";
  var innerHTML = `<div class="heading-1"></div>`;
  div.innerHTML = innerHTML;
  return div;
}

function parseKeyDown(e) {
  var pos = getCaret();
  // console.log(wrapper);
  if (e.which == 13) {
    var wrapper = outermostParentWithClass(pos.node, "wrapper");
    if (wrapper) {
      if (pos.offset == 0) {
        var newLine = document.createElement("div");
        newLine.innerHTML = "<br/>";
        insertBefore(newLine, wrapper);
        e.preventDefault();
        e.stopPropagation();
      } else {
        var newLine = document.createElement("div");
        newLine.innerHTML = "<br/>";
        insertAfter(newLine, wrapper);
        setCaret(newLine, 0);
        e.preventDefault();
        e.stopPropagation();
      }
    }
  }

  if (e.which == 8) {
    var wrapper = isFirstChildOfParentWithClass(pos.node, "wrapper");
    if (wrapper) {
      pos.node = pos.node.nodeType == 3 ? pos.node.parentNode : pos.node;
      if (wrapper == pos.node.parentNode && pos.offset == 0) {
        var innerHTML = `#h` + pos.node.innerHTML;
        wrapper.remove();
        if (containsHTML(innerHTML)) {
          var div = document.createElement("div");
          div.className = "display-inline";
          div.innerHTML = innerHTML;
          insertNode(div);
          setCaret(div, 0);
        } else {
          insertTextAtCursor(innerHTML);
        }
        e.stopPropagation();
        e.preventDefault();
      }
    }
  }
}

function containsHTML(str) {
  return /<\/?[a-z][\s\S]*>/i.test(str);
}

function insertTextAtCursor(text) {
  var sel, range;
  if (window.getSelection) {
    sel = window.getSelection();
    if (sel.getRangeAt && sel.rangeCount) {
      range = sel.getRangeAt(0);
      range.deleteContents();
      range.insertNode(document.createTextNode(text));
      range.collapse(true);
    }
  } else if (document.selection && document.selection.createRange) {
    document.selection.createRange().text = text;
  }
}

function unwrap(wrapper) {
  // place childNodes in document fragment
  var docFrag = document.createDocumentFragment();
  while (wrapper.firstChild) {
    var child = wrapper.removeChild(wrapper.firstChild);
    docFrag.appendChild(child);
  }

  // replace wrapper with document fragment
  wrapper.parentNode.replaceChild(docFrag, wrapper);
}

function setCaret(node, offset) {
  var sel;
  var range;
  if (window.getSelection && (sel = window.getSelection()).rangeCount) {
    range = sel.getRangeAt(0);
    range.collapse(true);
    range.setStartAfter(node);
    range.setStart(node, offset);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
  }
}

function getCaret() {
  var sel, range;
  if (window.getSelection && (sel = window.getSelection()).rangeCount) {
    range = sel.getRangeAt(0);
    return {node: sel.anchorNode, offset: range.startOffset};
  }
}

function isLetter(e) {
  var keycode = e.keyCode;

  var valid =
    (keycode > 47 && keycode < 58) || // number keys
    keycode == 32 ||
    keycode == 13 || // spacebar & return key(s) (if you want to allow carriage returns)
    (keycode > 64 && keycode < 91) || // letter keys
    (keycode > 95 && keycode < 112) || // numpad keys
    (keycode > 185 && keycode < 193) || // ;=,-./` (in order)
    (keycode > 218 && keycode < 223); // [\]' (in order)

  return valid;
}

function insertNode(node) {
  var sel, range;
  if (window.getSelection && (sel = window.getSelection()).rangeCount) {
    range = sel.getRangeAt(0);
    range.collapse(true);
    range.insertNode(node);
    range.setStartAfter(node.firstChild || node);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
  }
}

function makeID(prefix, length) {
  var result = "" + prefix;
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

function nextParentWithNextSibling(node) {
  while (node.nextSibling == null && node.nodeType != 9) {
    node = node.parentNode;
  }
  return node;
}

function insertAfter(newNode, referenceNode) {
  referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}

function insertBefore(newNode, referenceNode) {
  referenceNode.parentNode.insertBefore(newNode, referenceNode);
}
