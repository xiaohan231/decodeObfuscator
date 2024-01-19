globalThis.manwa = () => {
  //解ob混淆
  load('common')
  //evalPacker混淆
  load('evalPacker')

  let extractedCode = '';
  const extractCodeVisitor = {
    VariableDeclaration(path) {
      const { declarations } = path.node;
      if (declarations.length === 1 && declarations[0].id.name === 'I' && declarations[0].init.type === 'StringLiteral') {
        extractedCode += generator(path.node).code;
      }
    },
    ExpressionStatement(path) {
      const { expression } = path.node;
      if (expression.type === 'AssignmentExpression' && expression.left.object?.name === 'window' &&
          expression.left.property?.name === 'CryptoJS' && expression.right.callee?.property?.name === 'Utf8' &&
          expression.right.arguments?.length === 1 && expression.right.arguments[0].name === 'I') {
        extractedCode += generator(expression).code;
        this.stop(); // 停止继续遍历
      }
    }
  };

  traverse(ast, extractCodeVisitor);

  if (extractedCode !== '') {
    let keysFile = "./cola_keys.js";
    const fs = require('fs');
    fs.writeFile(keysFile, extractedCode, () => {});
    console.info(`cola漫画密钥文件: ${keysFile}`);
  } else {
    console.warn("无法找到要提取的代码");
  }
};
