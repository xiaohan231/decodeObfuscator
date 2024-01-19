//自动解析cocomanhuan加密密钥
//必须先解密
globalThis.cocomanhua = () => {
  let map = new Map();
  let keyNames = Array.of("C_DATA", "enc_code1", "enc_code2");

  //window.devtools.jsd(key, ...(window.C_DATA))
  const extratKeys = {
    CallExpression(path) {
      const { callee, arguments } = path.node;
      if (t.isMemberExpression(callee) && arguments.length > 1000) {
        let { object, property } = callee;
        if (!t.isMemberExpression(object)) return
        if ( //object.object.name === "window" &&
        object.property.name === "devtools" && property.name === "jsd") {

          let[key, tar] = arguments;
          if (!t.isMemberExpression(tar.callee)) return;
          let key_name = tar.callee.object.arguments[0].property.name;
          if (!keyNames.includes(key_name)) return;
          let _set = map.get(key_name) || new Set();
          console.info(path.toString());
          console.log(`=== find aes key of ${key_name} ===`);
          let decodeKey = getBindingValue(key, path);
          if (!!decodeKey) {
            _set.add(decodeKey);
            map.set(key_name, _set)
          }

        }
      }
    }
  }

  // ....(我是密钥, ...C_DATA...)
  const extratKeys2 = {
    CallExpression(path) {
      const { arguments } = path.node;
      if (arguments.length > 1000) {
        let[key, tar] = arguments;
        let code = generator(tar).code;
        let key_name = keyNames.find(name => code.includes(name));
        if (key_name) {
          let _set = map.get(key_name) || new Set();
          console.info(path.toString())
          let decodeKey = getBindingValue(key, path);
          if (!!decodeKey) {
            _set.add(decodeKey);
            map.set(key_name, _set)
          }
        }

      }
    }
  }


  console.info('extra cocomanahua keys...\n');

  let visitors = Array.of(extratKeys, extratKeys2);

  for (let visitor of visitors) {
    traverse(ast, visitor);
    if (Array.from(map.keys()).sort().toString() != keyNames.sort().toString()) {
      console.warn(`keys of keysMap not equal to[${keyNames}], switch to another visitor`)
    } else {
      break
    }
  }

  for (let[key, value] of map) {
    map.set(key, Array.from(value))
  }

  let keys = JSON.stringify(Object.fromEntries(map));

  if (typeof require == "function") {
    let keysFile = "./coco_keys.json";
    const fs = require('fs');
    fs.writeFile(keysFile, keys, () => {});
    console.info(`coco漫画密钥文件: ${keysFile}`);
  } else {
    globalThis.keys = keys;
    console.info("密钥保存到keys变量")
  }
  console.log(keys);
}
