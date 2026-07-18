const fs = require('fs');
//import tools
require("./tools/usefulPlugins");
require("./tools/decodeOb");
require("./tools/config");
require("./tools/decode");
require("./tools/consoleColor");
//import babel ast
try {
  globalThis.t = require("@babel/types");
  globalThis.parser = require("@babel/parser");
  globalThis.traverse = require("@babel/traverse").default;
  globalThis.generator = require("@babel/generator").default;
  console.info("use node module @babel/*");
} catch {
  require("./tools/babel_asttool");
}


if (process.argv.length > 2) {
    let encodeFile = process.argv[2], outPutFile = "decrypted.js", sourceCode = encodeFile;
    //试图读取文件
    try {
        sourceCode = fs.readFileSync(encodeFile, {
            encoding: "utf-8"
        });
        outPutFile = encodeFile.replace(/js$/, "decrypted.js");
    } catch {}

    let  pluginNames = process.argv.slice(3),
    code = decode(sourceCode, pluginNames);

    fs.writeFile(outPutFile, code, () => {});
    console.info("解密文件: " + outPutFile)
} else {
    console.log("Usage: node main.js <decrypted_js_path|decrypted_js_content> [<plugin_names>]")
}

