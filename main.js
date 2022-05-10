const fs = require('fs');
const babel = require("./tools/babel_asttool");
// globalThis.t = require("@babel/types")
// globalThis.parser = require("@babel/parser")
// globalThis.traverse = require("@babel/traverse").default
// globalThis.generator = require("@babel/generator").default
const usefulPlugins = require("./tools/usefulPlugins");
const decodeOb = require("./tools/decodeOb");
const config = require("./tools/config");
const tool = require("./tools/decode");
const consoleColor = require("./tools/consoleColor");

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

    fs.writeFile(outPutFile, code, (err) => {});
    console.info("解密文件: " + outPutFile)
} else {
    console.log("Usage: node main.js <decrypted_js_path|decrypted_js_content> [<plugin_names>]")
}

