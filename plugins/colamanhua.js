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
  let deleteFlag = false;

  // 提取解混淆的代码片段
  const extractCode = {
    IfStatement(path) {
      const { test, consequent } = path.node;
      if (test.type === 'BinaryExpression' &&
          test.operator === '==' &&
          test.left.name === 'G' &&
          consequent.length === 1 &&
          consequent[0].type === 'BlockStatement') {
        if (consequent[0].body.length > 0) {
          deleteFlag = true;
          const startIndex = consequent[0].body.findIndex(node => node.type === 'VariableDeclaration' && node.declarations[0].id.name === 'I');
          if (startIndex !== -1) {
            consequent[0].body.splice(0, startIndex + 1);
          }
          const endIndex = consequent[0].body.findIndex(node => node.type === 'ExpressionStatement' && node.expression.left.property.name === 'I');
          if (endIndex !== -1) {
            consequent[0].body.splice(endIndex);
          }
          extractedCode.push(...consequent[0].body.map(node => generator(node).code));
        }
      }
    }
  }

  traverse(ast, extractCode);

  // 构建完整的ImgKey函数
  const imgKeyFunction = `
function ImgKey(G) {
  var H = "";
  ${deleteFlag ? extractedCode.join('\n') : ''}
  return H;
}
`;

  let keys = imgKeyFunction;

  if (typeof require == "function") {
    const fs = require('fs');
    fs.writeFile('./cola_keys.js', keys, () => {});
    console.info('cola漫画密钥文件已保存为cola_keys.js');
  } else {
    globalThis.keys = keys;
    console.info('密钥已保存到keys变量');
  }
  console.log(keys);
}
