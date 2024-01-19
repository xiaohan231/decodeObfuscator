/**
 https://www.colamanga.com/js/manga.read.js
 cola正文图片aes解密密钥解析
*/
globalThis.colamanhua = () => {

  //解ob混淆
  load('common');
  //evalPacker混淆
  load('evalPacker');

  const extractedCode = [];

  // 提取解混淆的代码片段并添加到ImgKey函数中
  const extractCode = {
    IfStatement(path) {
      const { test, consequent } = path.node;
      if (
        test.type === 'BinaryExpression' &&
        test.operator === '==' &&
        test.left.name === 'G' &&
        consequent.length === 1 &&
        consequent[0].type === 'ExpressionStatement' &&
        consequent[0].expression.type === 'AssignmentExpression' &&
        consequent[0].expression.operator === '=' &&
        consequent[0].expression.left.name === 'I'
      ) {
        const value = consequent[0].expression.right.value;
        const extractedCodeSnippet = `if (G === "${test.right.value}") { I = "${value}"; }`;
        extractedCode.push(extractedCodeSnippet);
        path.remove();
      }
    }
  }

  traverse(ast, extractCode);

  // 构建 ImgKey 函数
  const imgKeyFunction = `
function ImgKey(G) {
  var H = "";
  if (G != "" && G != "0") {
    ${extractedCode.join('\n')}
    H = I;
  }
  return H;
}
`;

  let keys = imgKeyFunction;

  if (typeof require == "function") {
    let keysFile = "./cola_keys.js";
    const fs = require('fs');
    fs.writeFile(keysFile, keys, () => {});
    console.info(`cola漫画密钥文件: ${keysFile}`);
  } else {
    globalThis.keys = keys;
    console.info("密钥保存到keys变量");
  }
  console.log(keys);

}
