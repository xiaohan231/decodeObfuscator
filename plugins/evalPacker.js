//evalPacker解混淆
// eval(....)
globalThis.evalPacker = () => {
  try {
    console.info("EvalPacker dedecoding...");
    let js = eval(generator(ast).code.replace(/^eval/, ""));
    globalThis.ast = parser.parse(js);
  } catch(e) {
    console.warn("evalPacker decrypt failed", e)
  }
}