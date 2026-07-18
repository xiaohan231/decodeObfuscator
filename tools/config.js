//ast插件全局配置

//ast插件decodeObject 启用references_limit
//默认config = {"enable_references_limit": false, eferences_limit: 1000};
let decodeObject_config = {
    "references_limit": 1000,
    "enable_references_limit": true,
    "debug": false
};

globalThis.config = {
    set decodeObject(val) {
        Object.assign(decodeObject_config, val)
    },
    get decodeObject() {
        return decodeObject_config
    },
    debug: false
}