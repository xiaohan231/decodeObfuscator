
let basePath = "../plugins/";
let isBrowser = typeof require == "undefined";

//加载 插件或插件组合
function load(pluginName) {
    if (typeof pluginName == "undefined") {
        loadDefault()
    } else if (typeof pluginName == "object") {
        //ast visitor
        traverse(ast, pluginName)
    } else if (typeof pluginName == "string") {
        //ast visitor 组合  js文件形式
        !isBrowser ? require(`${basePath}${pluginName}`) : "";
        globalThis[pluginName].call(this);
    } else if(typeof pluginName == "function") {
        //ast visitor 组合 function形式
        try {
            pluginName.call(this)
        } catch(e) {
            console.warn(e)
        }
    }
}
function loadDefault() {
    !isBrowser ? load('common') : load(common)
}

function decode(sourceCode, pluginNames) {
    try {
        globalThis.ast = parser.parse(sourceCode);
    } catch (e) {
        console.error(`fail to parse JavaScript to ast: ${sourceCode.slice(0,200)}`);
        throw e.message
    }
    console.time("处理完毕，耗时");
    //批量加载ast插件
    pluginNames.forEach(pluginName => load(pluginName))
    console.timeEnd("处理完毕，耗时");
    let { code } = generator(ast, opts = {
        jsescOption: {
            "minimal": true
        }
    });
    return code
}


globalThis.decode = decode;
globalThis.load = load;

