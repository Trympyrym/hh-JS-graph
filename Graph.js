"use strict"
var Graph = {};
Graph.vertices = {};
Graph.primaryArgs = [];

function Vertex(dependencies, result, calculationFunction) {
    // ...
    Graph.vertices[result] = {};
    Graph.vertices[result].dependencies = dependencies;
    Graph.vertices[result].function = calculationFunction;
}

var n = new Vertex(['xs'], 'n', function(arg) {return arg.xs.length});
var m = new Vertex(['xs', 'n'], 'm',  function(arg) {return arg.xs.reduce(function(a, b) {return +a + +b}, 0) / arg.n});
var m2 = new Vertex(['xs', 'n'], 'm2', function(arg) {return arg.xs.reduce(function(a, b) {return +a + +b * +b}, 0) / arg.n});
var v = new Vertex(['m', 'm2'], 'v', function(arg) {return arg.m2 - arg.m*arg.m});

Graph.Compile = function(result){
    if (!('finalFunction' in Graph.vertices[result]))
    {
        var dependenciesToReduce = {}
        for (var dependency_key in Graph.vertices[result].dependencies)
        {
            var dependency = Graph.vertices[result].dependencies[dependency_key];
            if (dependency in Graph.vertices)
            {
                dependenciesToReduce[dependency] = Graph.vertices[dependency].function;
            }
        }
        if (Object.keys(dependenciesToReduce).length == 0)
        {
            Graph.vertices[result].finalFunction = Graph.vertices[result].function;
        }
        else {
            Graph.vertices[result].finalFunction = function(args) {
                var localArgs = args;
                for (var dependency in dependenciesToReduce)
                {
                    localArgs[dependency] = Graph.Compute(dependency, args);
                }
                return Graph.vertices[result].function(localArgs);
            }
        }
    }
}

Graph.Compute = function(result, args) {
    Graph.Compile(result);
    return Graph.vertices[result].finalFunction(args);
}

Graph.NonLazyCompile = function() {
    for (var vertex_key in Graph.vertices)
    {
        Graph.Compile(vertex_key);
    }
}

Graph.NonLazyCompile(); //without this call calculation will be lazy
console.log("n = " + Graph.Compute('n', {'xs' : [1, 2, 3, 6]}));
console.log("m = " + Graph.Compute('m', {'xs' : [1, 2, 3, 6]}));
console.log("m2 = " + Graph.Compute('m2', {'xs' : [1, 2, 3, 6]}));
console.log("v = " + Graph.Compute('v', {'xs' : [1, 2, 3, 6]}));
