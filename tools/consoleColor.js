//node环境下console添加颜色

let consoleBak = {};
consoleBak._time = console.time;
consoleBak._timeEnd = console.timeEnd;
globalThis.console = Object.assign(globalThis.console, consoleBak);

let consoleColour = {
    counter: 0,
    counterAll: -1,
    counterName: "",
    warn() {
        console.log("\033[43;30m WARN \033[;0m", ...arguments)
    },
    info() {
        console.log("\033[42;30m INFO \033[;0m", ...arguments)
    },
    time(label) {
        console._time("\033[44;30m DONE \033[;0m " + label)
    },
    timeEnd(label) {
        console._timeEnd("\033[44;30m DONE \033[;0m " + label)
    },
    error() {
        console.log("\033[41;30m ERROR \033[;0m", ...arguments)
    }
};
if (typeof require === "function") 
globalThis.console = Object.assign(globalThis.console, consoleColour);

