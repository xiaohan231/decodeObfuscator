## decodeObfuscator

## 安装最新依赖（可选）
```js
npm install
pnpm install
yarn install
```

### 使用
#### node
```js
node main.js decrypted.js
node main.js decrypted.js pluginName1
node main.js decrypted.js pluginName1 pluginName1
```

#### 浏览器
按需引入`./plugins``./tools/`下的文件
```js
decode(sourceCode, [common])
```

## 插件
* 通用插件
[decodeOb](./tools/decodeOb.js)
[usefulPlugins](./tools/usefulPlugins.js)
* [插件组合](./plugins/)
