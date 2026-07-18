/*****************************************************
通用插件合集:

Module name:usefulPugins.js
Author:悦来客栈的老板
Date:2022.02.19
Version:V1.4.0



*****************************************************/

//判断节点元素是否为字面量
//eg.  ++123,-456,"789";
function isBaseLiteral(path) {
    if (path.isLiteral()) {
        return true;
    }
    if (path.isUnaryExpression({
        operator: "-"
    }) || path.isUnaryExpression({
        operator: "+"
    })) {
        return isBaseLiteral(path.get('argument'));
    }

    return false;
}


//判断节点元素[Arrays]是否全部为字面量
function isElementsLiteral(path) {
    let key = null;

    if (path.isArrayExpression()) {
        key = "elements";
    } else if (path.isObjectExpression()) {
        key = "properties";
    } else if (path.isCallExpression()) {
        key = "arguments";
    } else {
        return isBaseLiteral(path);
    }

    let elements = path.get(key);

    if (elements.length == 0) return false;

    if (key == "properties") {
        return elements.every(element => isBaseLiteral(element.get("value")));
    }

    return elements.every(element => isBaseLiteral(element));
}


//规范For循环和While循环
const standardLoop = {
    "ForStatement|WhileStatement" ({ node }) {
        if (!t.isBlockStatement(node.body)) {
            node.body = t.BlockStatement([node.body]);
        }
    },
}
//逗号表达式
const resolveSequence = {
    SequenceExpression(path) {
        let { scope, parentPath, node } = path;
        let expressions = node.expressions;
        if (parentPath.isReturnStatement({
            "argument": node
        })) {
            let lastExpression = expressions.pop();
            for (let expression of expressions) {
                parentPath.insertBefore(t.ExpressionStatement(expression = expression));
            }

            path.replaceInline(lastExpression);
        } else if (parentPath.isExpressionStatement({
            "expression": node
        })) {
            let body = [];
            expressions.forEach(express => {
                body.push(t.ExpressionStatement(express));
            });
            path.replaceInline(body);
        } else {
            return;
        }

        scope.crawl();
    }
}

//字面量
const simplifyLiteral = {
    NumericLiteral({ node }) {
        if (node.extra && /^0[obx]/i.test(node.extra.raw)) {
            node.extra = undefined;
        }
    },
    StringLiteral({ node }) {
        if (node.extra && /\\[ux]/gi.test(node.extra.raw)) {
            node.extra = undefined;
        }
    },
}


//常量折叠
const constantFold = {
    "BinaryExpression|UnaryExpression" (path) {
        if (path.isUnaryExpression({
            operator: "-"
        }) || path.isUnaryExpression({
            operator: "void"
        })) {
            return;
        }
        try {
            const { confident, value } = path.evaluate();
            if (!confident || value == "Infinity") return;
            path.replaceWith(t.valueToNode(value));
        } catch (e) {
            //console.log("constantFold evaluate fail")
        }
    },
}


//删除重复定义且未被改变初始值的变量
const deleteRepeatDefine = {
    "VariableDeclarator|FunctionDeclaration" (path) {
        let { node, scope, parentPath } = path;

        if (path.isFunctionDeclaration()) {
            scope = parentPath.scope;
        }
        let name = node.id.name;
        const binding = scope.getBinding(name);
        if (path.isFunctionDeclaration()) {
            if (!binding || binding.constantViolations.length > 1) {
                return;
            }
        } else {
            if (!binding || !binding.constant) return;
        }

        scope.traverse(scope.block, {
            VariableDeclarator(path) {
                let { node, scope } = path;
                let { id, init } = node;
                if (!t.isIdentifier(init, {
                    name: name
                })) return;

                const binding = scope.getBinding(id.name);

                if (!binding || !binding.constant) return;

                scope.rename(id.name, name);
                path.remove();
            },
        })

        scope.crawl();
    },

}


const keyToLiteral = {
    MemberExpression: {
        exit({ node }) {
            const prop = node.property;
            if (!node.computed && t.isIdentifier(prop)) {
                node.property = t.StringLiteral(prop.name);
                node.computed = true;
            }
        }
    },
    ObjectProperty: {
        exit({ node }) {
            const key = node.key;
            if (!node.computed && t.isIdentifier(key)) {
                node.key = t.StringLiteral(key.name);
            }
        }
    },
}

const preDecodeObject = {
    VariableDeclarator({ node, parentPath, scope }) {
        const { id, init } = node;
        if (!t.isObjectExpression(init)) return;
        let name = id.name;

        let properties = init.properties;
        let allNextSiblings = parentPath.getAllNextSiblings();
        for (let nextSibling of allNextSiblings) {
            if (!nextSibling.isExpressionStatement()) break;

            let expression = nextSibling.get('expression');
            if (!expression.isAssignmentExpression({
                operator: "="
            })) break;

            let { left, right } = expression.node;
            if (!t.isMemberExpression(left)) break;

            let { object, property } = left;
            if (!t.isIdentifier(object, {
                name: name
            }) || !t.isStringLiteral(property)) {
                break;
            }

            properties.push(t.ObjectProperty(property, right));
            nextSibling.remove();
        }
        scope.crawl();
    },
}

const SimplifyIfStatement = {
    "IfStatement" (path) {
        const consequent = path.get("consequent");
        const alternate = path.get("alternate");
        const test = path.get("test");
        const evaluateTest = test.evaluateTruthy();

        if (!consequent.isBlockStatement()) {
            consequent.replaceWith(t.BlockStatement([consequent.node]));
        }
        if (alternate.node !== null && !alternate.isBlockStatement()) {
            alternate.replaceWith(t.BlockStatement([alternate.node]));
        }

        if (consequent.node.body.length == 0) {
            if (alternate.node == null) {
                path.replaceWith(test.node);
            } else {
                consequent.replaceWith(alternate.node);
                alternate.remove();
                path.node.alternate = null;
                test.replaceWith(t.unaryExpression("!", test.node, true));
            }
        }

        if (alternate.isBlockStatement() && alternate.node.body.length == 0) {
            alternate.remove();
            path.node.alternate = null;
        }

        if (evaluateTest === true) {
            path.replaceWithMultiple(consequent.node.body);
        } else if (evaluateTest === false) {
            alternate.node === null ? path.remove() : path.replaceWithMultiple(alternate.node.body);
        }
    },
}

const removeDeadCode = {
    "IfStatement|ConditionalExpression" (path) {
        let { consequent, alternate } = path.node;
        let testPath = path.get('test');
        const evaluateTest = testPath.evaluateTruthy();
        if (evaluateTest === true) {
            if (t.isBlockStatement(consequent)) {
                consequent = consequent.body;
            }
            path.replaceWithMultiple(consequent);
        } else if (evaluateTest === false) {
            if (alternate != null) {
                if (t.isBlockStatement(alternate)) {
                    alternate = alternate.body;
                }
                path.replaceWithMultiple(alternate);
            } else {
                path.remove();
            }
        }
    },
    EmptyStatement(path) {
        path.remove();
    },
        "VariableDeclarator" (path) {
        let { node, scope, parentPath } = path;
        let binding = scope.getBinding(node.id.name);
        if (binding && !binding.referenced && binding.constant) { //没有被引用，也没有被改变
            path.remove();
        }
    },

}

const FormatMember = {
    MemberExpression(path) {
        // _0x19882c['removeCookie']['toString']()
        //  |
        //  |
        //  |
        //  v
        // _0x19882c.removeCookie.toString()
        var curNode = path.node;
        if (!t.isStringLiteral(curNode.property)) return;
        if (curNode.computed === undefined || !curNode.computed === true) return;
        if (!/^[a-zA-Z_$][0-9a-zA-Z_$]*$/.test(curNode.property.value)) return;
        curNode.property = t.identifier(curNode.property.value);
        curNode.computed = false;
    }
}

//获取变量的值
function getBindingValue(node, path) {
     const { scope } = path;
     let name = generator(node).code, value, value_node;
     
    //字面量直接返回 "@@"
    if (t.isLiteral(node)) {
        value =  node.value;
        name = value;
        return debug(), value
    }

    //变量 a 
    if (t.isIdentifier(node) && scope.hasBinding(name)) {
        console.log("===> find value of "+name)

        let binding = path.scope.getBinding(name);
        let { constant, constantViolations, kind } = binding;
        let init =  binding.path.node.init;
        if (constant) value_node = init;
        if (!constant) {
            value = init.value;
            //往上寻找定义的node
            //计算偏移 大于零说明引用处前面有赋值的地方
            let offset = (value_node) => node.start - value_node.start;
            //先找重新赋值的constantViolations
            if (offset(constantViolations[0].node) > 0) {
                for ({ node } of constantViolations) {
                    if (offset(node) < 0) break;
                    value_node = node.right;
                    if (node.operator == "+=") value += getBindingValue(value_node, path)
                    if (node.operator == "/=") value /= getBindingValue(value_node, path)
                    if (node.operator == "*=") value *= getBindingValue(value_node, path)
                    if (node.operator == "-=") value -= getBindingValue(value_node, path)
                    if (node.operator == "=") value = getBindingValue(value_node, path)
                }
                return value
            }
            //对寻找结果进行判断
           if (!value_node && offset(init) > 0) {
               value_node = init;
           }
           if (value_node && offset(value_node) > offset(init) > 0) {
                value_node = init;
           }
           if (!value_node && offset(init) < 0) {
                console.warn(`cannot not find value node before`)
           }
        }

        if (t.isLiteral(value_node)) {
            value = value_node.value;
            return debug(), value
        } else {
            return getBindingValue(value_node, path)
        }
    }

    //object a.b a.b.c
    if (t.isMemberExpression(node)) {
        let { property, object, computed } = node
        let property_keys = [property.name]
        while (t.isMemberExpression(object)) {
            //遍历a.b.cj.djdkd 并保存property到数组
            property_keys.unshift(object.property.name)
            object = object.object;
        }
        if (!computed && t.isIdentifier(property)
            && scope.hasBinding(object.name)
        ) {
            let binding = scope.getBinding(object.name);
            let object_node = binding.path.node;
            if (t.isVariableDeclarator(object_node) &&
               t.isObjectExpression(object_node.init)
            ) {
                console.log(`===> find value of ${generator(node).code}`);

                let properties =  object_node.init.properties;

                while (property_keys.length != 0) {
                    //根据property_keys数组查找位置
                    let keyValue = property_keys.shift();
                    let property_node = properties.find(prop =>
                       prop.key.name === keyValue ||
                       prop.key.value === keyValue
                    );
                    if (property_node) value_node = property_node.value;
                    if (t.isObjectExpression(value_node)) properties = value_node.properties;
                }
                if (t.isLiteral(value_node)) {
                    value = value_node.value;
                    return debug(), value
                } else {
                    return getBindingValue(value_node, path)
                }
            
            } 
        }
    }

    //console.warn("not supported node type");
    //console.log(node);
    function debug() {
       console.log(name + " ==> " + value);
    }

}

globalThis.isBaseLiteral = isBaseLiteral;
globalThis.constantFold = constantFold;
globalThis.keyToLiteral = keyToLiteral;
globalThis.standardLoop = standardLoop;
globalThis.removeDeadCode = removeDeadCode;
globalThis.preDecodeObject = preDecodeObject;
globalThis.simplifyLiteral = simplifyLiteral;
globalThis.resolveSequence = resolveSequence;
globalThis.isElementsLiteral = isElementsLiteral;
globalThis.deleteRepeatDefine = deleteRepeatDefine;
globalThis.SimplifyIfStatement = SimplifyIfStatement;
globalThis.FormatMember = FormatMember;
globalThis.getBindingValue = getBindingValue;
