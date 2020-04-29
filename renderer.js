// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.

const fs = require("fs");
const {ipcRenderer} = require("electron");
const remote = require("electron").remote;
const app = remote.app;

// global vars
let base = app.getPath("userData") + "/files/";
NodeList.prototype.forEach = Array.prototype.forEach;

function main() {
  setupUI();
}
main();

function setupUI() {
  var area = createTextArea(0, "⚠️ & Not ⏱", "Important & Not Urgent");
  document.body.appendChild(area);
  var area = createTextArea(1, "⚠️ & ⏱", "Important & Urgent");
  document.body.appendChild(area);
  var area = createTextArea(2, "Not ⚠️ & not ⏱", "Not Important & Not Urgent");
  document.body.appendChild(area);
  var area = createTextArea(3, "Not ⚠️ & ⏱", "Not Important & Urgent");
  document.body.appendChild(area);

  document.getElementById("ta-main-0").innerHTML = readFile(0);
  document.getElementById("ta-main-1").innerHTML = readFile(1);
  document.getElementById("ta-main-2").innerHTML = readFile(2);
  document.getElementById("ta-main-3").innerHTML = readFile(3);
}

function createTextArea(id, headingText, title) {
  var div = document.createElement("div");

  var heading = document.createElement("div");
  heading.innerHTML = headingText;
  heading.title = title;
  heading.contentEditable = true;
  heading.className = "ta-main-heading";
  heading.id = "ta-main-heading-" + id;
  div.appendChild(heading);

  var area = document.createElement("div");
  area.className = "ta-main";
  area.id = "ta-main-" + id;
  area.contentEditable = "plaintext-only";
  area.addEventListener("keyup", e => parseKeyUp(e), false);
  area.addEventListener("keydown", e => parseKeyDown(e), false);
  area.addEventListener("onclick", e => parseKeyDown(e), false);
  div.appendChild(area);

  return div;
}

function readFile(num) {
  var data = "";
  try {
    var path = base + "ta-main-" + num + ".txt";
    if (fs.existsSync(path)) {
      var data = fs.readFileSync(path);
    }
  } catch (e) {
    console.error(e);
  }
  return data;
}

function saveStringToPath(data, path) {
  try {
    if (!fs.existsSync(path)) {
      fs.mkdirSync(
        base,
        {
          recursive: true
        },
        err => {
          alert("An error occurred.");
          console.error(err);
        }
      );
    }
    fs.writeFileSync(path, data);
  } catch (e) {
    alert("An error occurred.");
    console.error(e);
  }
}

function parseKeyUp(e) {
  var pos = getCaret();
  parse(pos.node);
  var path = base + e.target.id + ".txt";
  let data = e.target.innerHTML;
  saveStringToPath(data, path);
}

function parseKeyDown(e) {
  var pos = getCaret();
  var par = nextParentWrapper(pos.node);
  if (par) {
    var offset = textOffsetUntilNode(par, pos.node, 0) + pos.offset;
    if (e.which == 8) {
      // DELETE
      var r = getRange();
      if (offset == 0 && r.collapsed) {
        var inner = par.textContent;
        var div = document.createElement("div");
        div.className = "display-block";
        div.innerHTML = "-" + inner;
        par.remove();
        insertNodeAtCursor(div);
        setCaret(div.firstChild, 1);
        e.stopPropagation();
        e.preventDefault();
      }
    }
  }

  if (e.which == 13 && par) {
    // ENTER
    var newLine = document.createElement("div");
    var text = pos.node.nodeValue || "";
    var l_Split = text.substring(0, pos.offset);
    var r_Split = text.substring(pos.offset, text.length);
    newLine.innerHTML = r_Split || "<br/>";
    pos.node.nodeValue = l_Split || " ";
    insertAfter(newLine, par);
    setCaret(newLine, 0);
    e.preventDefault();
    e.stopPropagation();
  }
}

function textOffsetUntilNode(parent, endNode, offset) {
  var children = parent.childNodes;
  for (var i = 0; i < children.length; i++) {
    if (children[i] == endNode) break;
    if (children[i].nodeType == 3) offset += children[i].length;
    else textOffsetUntilNode(children[i], endNode, offset);
  }
  return offset;
}

function nextParentWrapper(node) {
  if (!node) return null;
  if (node.tagName == "WRAPPER") return node;
  if (node.nextSibling) return nextParentWrapper(node.nextSibling);
  else if (node.parentNode) return nextParentWrapper(node.parentNode);
}

function unwrap(par) {
  if (hasClass(par, "type-task")) {
    par.firstChild.firstChild.remove();
    par.firstChild.firstChild.className = "display-inline";
    var inner = par.firstChild.innerHTML;
    return inner;
  }
}

function parse(node) {
  if (nextParentWithClass(node, "wrapper")) return;
  var text = (node.nodeValue || "").replace(/\s/g, " ");
  var pattern = "- ";
  var indeces = getIndicesOf(pattern, text);
  indeces.forEach(index => {
    if (index != 0) return;
    text = text.replace(pattern, "");
    node.remove();
    var task = createTask(text);
    insertNodeAtCursor(task);
    setCaret(task.firstChild.firstChild.nextSibling, 0);
    task.focus();
  });
  node.childNodes.forEach(child => {
    parse(child);
  });
}

function nextParentWithClass(node, className) {
  while (node.parentNode) {
    if (hasClass(node, className)) {
      return node;
    }
    node = node.parentNode;
  }
  return null;
}

function createTask(content) {
  var task = document.createElement("wrapper");
  task.className = "wrapper type-task display-block";
  task.innerHTML = `<div class="task"><div contenteditable="false"><input type="checkbox" onClick="handleCheckboxClick(event)"/></div><div>${content ||
    "<br/>"}</div></div>`;
  return task;
}

function handleCheckboxClick(e) {
  var node;
  if (window.getSelection && (sel = window.getSelection()).rangeCount) {
    range = sel.getRangeAt(0);
    range.collapse(true);
    setCaret(sel.anchorNode, range.startOffset);
    e.target.setAttribute("checked", e.target.checked);
  }
  e.stopPropagation();
}

function getIndicesOf(searchStr, str, caseSensitive) {
  var searchStrLen = searchStr.length;
  if (searchStrLen == 0) {
    return [];
  }
  var startIndex = 0,
    index,
    indices = [];
  while ((index = str.indexOf(searchStr, startIndex)) > -1) {
    indices.push(index);
    startIndex = index + searchStrLen;
  }
  return indices;
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
    return {node: range.startContainer, offset: range.startOffset};
  }
}

function getRange() {
  var sel, range;
  if (window.getSelection && (sel = window.getSelection()).rangeCount) {
    range = sel.getRangeAt(0);
    return range;
  }
}

function hasClass(node, className) {
  return (" " + node.className + " ").indexOf(" " + className + " ") > -1;
}

function insertNodeAtCursor(node) {
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

function insertAfter(newNode, referenceNode) {
  referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}

function insertBefore(newNode, referenceNode) {
  referenceNode.parentNode.insertBefore(newNode, referenceNode);
}
