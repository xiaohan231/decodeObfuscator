//ob解混淆
globalThis.common = () => {
    //字面量解混淆
    console.info("traverse Hex or Unicode String.......");
    
    traverse(ast, simplifyLiteral);
    
    console.info("constantFold.......");
    
    traverse(ast, constantFold);
    
    console.info("delete Repeat Define.......");
    
    traverse(ast, deleteRepeatDefine);
    
    traverse(ast, SimplifyIfStatement);
    
    traverse(ast, standardLoop);
    
    console.info("resolve Sequence.......");
    
    traverse(ast, resolveSequence);
    
    console.info("traverse CallExpress To ToLiteral.......");
    
    traverse(ast, CallExpressToLiteral);
    
    console.info("constantFold.......");
    
    traverse(ast, constantFold);
    
    
    //object key值Literal
    console.info("Object Preconditioning .......");
    
    traverse(ast, keyToLiteral);
    
    traverse(ast, preDecodeObject);
    
    //处理object
    
    console.info("Object Decode .......\n");
    
    traverse(ast, decodeObject);
    
    console.info("Control Flow Decoding.......");
    
    traverse(ast, decodeControlFlow);
    
    console.info("constantFold.......");
    
    traverse(ast, constantFold);
    
    console.info("remove Dead Code.......");
    
    traverse(ast, removeDeadCode);
    
    ast = parser.parse(generator(ast).code);
    
    traverse(ast, removeDeadCode);
    
    console.info("simplifyLiteral.......");
    
    traverse(ast, simplifyLiteral);
    
   // console.info("deleteObfuscatorCode.......");
    
    //可能会误删一些代码，可屏蔽
  //  traverse(ast, deleteObfuscatorCode);
    
    console.info("FormatMember...");
    
    traverse(ast, FormatMember);
}
