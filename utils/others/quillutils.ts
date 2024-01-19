import { Reference } from "@/utils/global";

function getTextBeforeCursor(quill, length = 100) {
  const cursorPosition = quill.getSelection().index;
  const start = Math.max(0, cursorPosition - length); // 确保开始位置不是负数
  return quill.getText(start, cursorPosition - start);
}

function updateBracketNumbersInDelta(delta) {
  let currentNumber = 1;

  const updatedOps = delta.ops.map((op) => {
    if (typeof op.insert === "string") {
      return {
        ...op,
        insert: op.insert.replace(/\[\d+\]/g, () => `[${currentNumber++}]`),
      };
    }
    return op;
  });

  return { ops: updatedOps };
}

function updateBracketNumbersInDeltaKeepSelection(quill) {
  const selection = quill.getSelection();
  const delta = quill.getContents();
  const updatedDelta = updateBracketNumbersInDelta(delta);
  quill.setContents(updatedDelta);
  if (selection) {
    quill.setSelection(selection.index, selection.length);
  }
}

function convertToSuperscript(quill) {
  const text = quill.getText();
  const regex = /\[\d+\]/g; // 正则表达式匹配 "[数字]" 格式
  let match;

  while ((match = regex.exec(text)) !== null) {
    const startIndex = match.index;
    const length = match[0].length;

    // 应用上标格式
    quill.formatText(startIndex, length, { script: "super" });
    // 重置格式（如果需要）
    if (startIndex + length < text.length) {
      quill.formatText(startIndex + length, 1, "script", false);
    }
  }
}

function getRandomOffset(max: number) {
  return Math.floor(Math.random() * max);
}

function removeSpecialCharacters(str: string): string {
  // 正则表达式匹配除了字母、空格和中文之外的所有字符
  const regex = /[^\u4e00-\u9fa5a-zA-Z ]/g;
  return str.replace(regex, '');
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text).then(
    () => console.log('文献引用复制到剪贴板'),
    (err) => console.error('复制到剪贴板失败:', err)
  );
}

function formatReferenceForCopy(reference: Reference): string {
  let referenceStr = `${reference.author}. ${reference.title}. `;
  if (reference.journal && reference.journal.name) {
    referenceStr += `${reference.journal.name}, ${reference.year}, `;
    if (reference.journal.volume) referenceStr += `${reference.journal.volume}`;
    if (reference.journal.pages) referenceStr += `: ${reference.journal.pages}`;
    referenceStr += '.';
  } else {
    referenceStr += `${reference.venue}, ${reference.year}.`;
  }
  return referenceStr;
}

export {
  getTextBeforeCursor,
  updateBracketNumbersInDelta,
  updateBracketNumbersInDeltaKeepSelection,
  convertToSuperscript,
  getRandomOffset,
  removeSpecialCharacters,
  copyToClipboard,
  formatReferenceForCopy,
};
