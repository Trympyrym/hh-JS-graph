"use strict"
var errorFlag = false;
var errorText = "";
var stackDepth = 0;
var visitedVertices = {};


var compute = function(result){
    stackDepth++;
    if (!('value' in graph[result]))
    {
        if (result in visitedVertices)
        {
            errorFlag = true;
            errorText = "Cycle detected :" + result;
        }
        visitedVertices[result] = true;
        var localArgs = {};
        for (var dependencyKey in graph[result].dependencies)
        {
            var dependency = graph[result].dependencies[dependencyKey];
            if (!(dependency in graph))
            {
                errorFlag = true;
                errorText = "Param required: " + dependency;
                break;
            }
            var value = compute(dependency);
            if (errorFlag)
            {
                break;
            }
            localArgs[dependency] = value;
        }
        if (!errorFlag)
        {
            graph[result].value = graph[result].calculationFunction(localArgs);
        }
    }
    stackDepth--;
    if (stackDepth == 0)
    {
        visitedVertices = {};
    }
    if (errorFlag)
    {
        if (stackDepth > 0)
        {
            return null;
        }
        else {
            console.error(errorText);
            errorFlag = false;
            return null;
        }
    }
    return graph[result].value;
}

var nonLazyCompute = function() {
    var tempName = Math.random().toString(36);
    while (!tempName in graph)
    {
        tempName = Math.random().toString(36);
    }
    var arr = [];
    for (var key in graph)
    {
      arr.push(key);
    }
    graph[tempName] = new Vertex(arr, function(arg) {return 0});
    compute(tempName);
    delete(graph[tempName]);
}

function Vertex(dependencies, calculationFunction) {
    // ...
    this.dependencies = dependencies;
    this.calculationFunction = calculationFunction;
}

var graph =
{
    xs : new Vertex([], function(arg) {return [1, 2, 3, 6]}),
    n : new Vertex(['xs'], function(arg) {return arg.xs.length}),
    m : new Vertex(['xs', 'n'], function(arg) {return arg.xs.reduce(function(a, b) {return +a + +b}, 0) / arg.n}),
    m2 : new Vertex(['xs', 'n'], function(arg) {return arg.xs.reduce(function(a, b) {return +a + +b * +b}, 0) / arg.n}),
    v : new Vertex(['m', 'm2'], function(arg) {return arg.m2 - arg.m*arg.m})
}

nonLazyCompute();
console.log("xs = " + compute('xs'));
console.log("n = " + compute('n'));
console.log("m = " + compute('m'));
console.log("m2 = " + compute('m2'));
console.log("v = " + compute('v'));
