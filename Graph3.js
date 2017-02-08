"use strict"
var recursionDepth = 0;
var visitedVertices = {};


var compute = function(result){
    recursionDepth++;
    if (!('value' in graph[result]))
    {
        if (result in visitedVertices)
        {
            throw "Cycle detected :" + result;
        }
        visitedVertices[result] = true;
        var localArgs = {};
        for (var dependencyKey in graph[result].dependencies)
        {
            var dependency = graph[result].dependencies[dependencyKey];
            if (!(dependency in graph))
            {
                throw "Param required: " + dependency;
            }
            localArgs[dependency] = compute(dependency);
        }
        graph[result].value = graph[result].calculationFunction(localArgs);
    }
    recursionDepth--;
    if (recursionDepth == 0)
    {
        visitedVertices = {};
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
      compute(key);
    }
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
