/**
 https://www.colamanga.com/js/manga.read.js
 cola正文图片aes解密密钥解析
*/
globalThis.manwa = () => {

  //解ob混淆
  load('common')
  //evalPacker混淆
  load('evalPacker')

  let wrappedAesFunctionName = null
  let set = new Set()

  // find function with CryptoJS
  const findWrappedAesFunction = {
    FunctionDeclaration(path) {
      const code = generator(path.node).code
      if (/CryptoJS/.test(code)) {
        wrappedAesFunctionName = path.node.id.name;
        console.info("解密函数", generator(path.node).code)
      }
    }
  }

  const findAesKey = {
    CallExpression(path) {
      const { callee, arguments } = path.node
      if (callee.name === wrappedAesFunctionName &&
        arguments.length >= 2
      ) {
        //解密函数(目标，密钥， 其他）
        console.info("调用", generator(path.node).code)
        let key = arguments[1]
        set.add(getBindingValue(key, path))
      }
    }
  }

  traverse(ast, findWrappedAesFunction);
  traverse(ast, findAesKey);

  let keys = JSON.stringify(Array.from(set));

  if (typeof require == "function") {
    let keysFile = "./manwa_keys.json";
    const fs = require('fs');
    fs.writeFile(keysFile, keys, () => {});
    console.info(`manwa漫画密钥文件: ${keysFile}`);
  } else {
    globalThis.keys = keys;
    console.info("密钥保存到keys变量")
  }
  console.log(keys);

}
