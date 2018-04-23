var nodejieba = require("nodejieba");
var result = nodejieba.cutHMM("升职加薪，当上CEO，走上人生巅峰。");
console.log(result);
//["南京市","长江大桥"]
