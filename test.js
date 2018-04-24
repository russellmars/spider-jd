var nodejieba = require("nodejieba");
var fs = require('fs')

var result = nodejieba.cutHMM("升职加薪，当上CEO，走上人生巅峰。");
console.log(result);
//["南京市","长江大桥"]

fs.readFile('test.txt', function(err, data) {
  console.log(nodejieba.extract(data, 100));
})
