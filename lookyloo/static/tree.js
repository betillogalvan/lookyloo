// From : https://bl.ocks.org/d3noob/43a860bc0024792f8803bba8ca0d5ecd

// Set the dimensions and margins of the diagram
var margin = {top: 20, right: 200, bottom: 30, left: 90},
    width = 9600 - margin.left - margin.right,
    height = 10000 - margin.top - margin.bottom;

var node_width = 0;

var init = d3.select("body").append("svg")
            .attr("width", width + margin.right + margin.left)
            .attr("height", height + margin.top + margin.bottom)

// Add background pattern
var pattern = init.append("defs").append('pattern')
    .attr('id', 'backstripes')
    .attr('x', margin.left)
    .attr("width", 400)
    .attr("height", 10)
    .attr('patternUnits', "userSpaceOnUse" )

pattern.append('rect')
    .attr('width', 200)
    .attr('height', height)
    .attr("fill", "#EEEEEE");

init.append('rect')
    .attr('y', 0)
    .attr('width', width)
    .attr('height', height)
    .style('fill', "url(#backstripes)");

// append the svg object to the body of the page
// appends a 'group' element to 'svg'
// moves the 'group' element to the top left margin
var svg = init.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var i = 0,
    duration = 750,
    root;

// declares a tree layout and assigns the size
var treemap = d3.tree().size([height, width]);

// Assigns parent, children, height, depth
root = d3.hierarchy(treeData, function(d) { return d.children; });
root.x0 = height / 2;
root.y0 = 0;

// Collapse after the second level
// root.children.forEach(collapse);

update(root);


// Collapse the node and all it's children
function collapse(d) {
  if(d.children) {
    d._children = d.children
    d._children.forEach(collapse)
    d.children = null
  }
}

function updateNodeLength(selection) {
    selection.each(function(d) {
        var tmp = this.getBBox().width;
        node_width = node_width > tmp ? node_width : tmp;
    })
}

function getBB(selection) {
    selection.each(function(d) {
        d.data.total_width = d.data.total_width ? d.data.total_width : 0;
        d.data.total_width += this.getBBox().width;
    })
}

function update(source) {

  // Assigns the x and y position for the nodes
  var treeData = treemap(root);

  // Compute the new tree layout.
  var nodes = treeData.descendants(),
      links = treeData.descendants().slice(1);


  // ****************** Nodes section ***************************

  // Update the nodes...
  // TODO: set that ID to the ete3 node ID
  var node = svg.selectAll('g.node')
      .data(nodes, function(d) {return d.id || (d.id = ++i); });

    // Enter any new modes at the parent's previous position.
  var nodeEnter = node.enter().append('g')
      .attr('class', 'node')
      .attr("transform", function(d) {
        return "translate(" + source.y0 + "," + source.x0 + ")";
    })
    .on('click', click);

  // Add Circle for the nodes
  nodeEnter.append('circle')
      .attr('class', 'node')
      .attr('r', 1e-6)
      .style("fill", function(d) {
          return d._children ? "lightsteelblue" : "#fff";
      });

  // Avoid hiding the content after the circle
  var nodeContent = nodeEnter
        .append('svg')
        .attr('x', 10)
        .attr('y', -20);

  // Add labels for the nodes
  nodeContent.append("text")
        .attr('dy', '.9em')
        .attr("stroke", "white")
        .style("font-size", "16px")
        .attr("stroke-width", ".2px")
        .style("opacity", .9)
        .text(function(d) { return d.data.name; }).call(updateNodeLength);

  // Normalize for fixed-depth.
  nodes.forEach(function(d){ d.y = d.depth * node_width});
  init.selectAll('pattern')
    .attr('width', node_width * 2)
  pattern.selectAll('rect')
    .attr('width', node_width)

  // Put all the icone in one sub svg document
  var icons = nodeEnter
        .append('svg')
        .attr('x', 10)
        .attr('y', 10);

  // Add JavaScript information
  var jsContent = icons
        .append('svg');

  jsContent.filter(function(d,i){
      return d.data.js > 0;
  }).append('image')
      .attr("width", 16)
      .attr("height", 16)
      .attr('x', function(d) { return d.data.total_width ? d.data.total_width + 1 : 0 })
      .attr("xlink:href", "/static/javascript.png").call(getBB);

  jsContent.filter(function(d,i){
     return d.data.js > 0;
  }).append('text')
    .attr("dy", 8)
    .attr('x', function(d) { return d.data.total_width ? d.data.total_width + 1 : 0 })
    .attr('width', function(d) { return d.data.js.toString().length + 'em'; })
    .text(function(d) { return d.data.js; }).call(getBB);


  // Add Cookie read information
  var cookieReadContent = icons
        .append('svg');

  cookieReadContent.filter(function(d,i){
    return d.data.request_cookie > 0;
  }).append('image')
	  .attr("width", 16)
	  .attr("height", 16)
      .attr('x', function(d) { return d.data.total_width ? d.data.total_width + 1 : 0 })
	  .attr("xlink:href", "/static/cookie_read.png").call(getBB);

  cookieReadContent.filter(function(d,i){
     return d.data.request_cookie > 0;
  }).append('text')
    .attr("dy", 8)
    .attr('x', function(d) { return d.data.total_width ? d.data.total_width + 1 : 0 })
    .attr('width', function(d) { return d.data.request_cookie.toString().length + 'em'; })
    .text(function(d) { return d.data.request_cookie; }).call(getBB);

  // Add Cookie set information
  var cookieSetContent = icons
        .append('svg');

    cookieSetContent.filter(function(d,i){
    return d.data.response_cookie > 0;
  }).append('image')
	  .attr("width", 16)
	  .attr("height", 16)
      .attr('x', function(d) { return d.data.total_width ? d.data.total_width + 1 : 0 })
	  .attr("xlink:href", "/static/cookie_received.png").call(getBB);

  cookieSetContent.filter(function(d,i){
     return d.data.response_cookie > 0;
  }).append('text')
    .attr("dy", 8)
    .attr('x', function(d) { return d.data.total_width ? d.data.total_width + 1 : 0 })
    .attr('width', function(d) { return d.data.response_cookie.toString().length + 'em'; })
    .text(function(d) { return d.data.response_cookie; }).call(getBB);

  // Add redirect information
  var redirectContent = icons
        .append('svg');

  redirectContent.filter(function(d,i){
    return d.data.redirect > 0;
  }).append('image')
  	  .attr("width", 16)
  	  .attr("height", 16)
      .attr('x', function(d) { return d.data.total_width ? d.data.total_width +1 : 0 })
  	  .attr("xlink:href", "/static/redirect.png").call(getBB);

  redirectContent.filter(function(d,i){
     return d.data.redirect > 0;
  }).append('text')
    .attr("dy", 8)
    .attr('x', function(d) { return d.data.total_width ? d.data.total_width + 2 : 0 })
    .attr('width', function(d) { return d.data.redirect.toString().length + 'em'; })
    .text(function(d) { return d.data.redirect; }).call(getBB);

  // Add cookie in URL information
  var cookieURLContent = icons
        .append('svg');

  cookieURLContent.filter(function(d,i){
    return d.data.redirect_to_nothing > 0;
  }).append('image')
      .attr("width", 16)
      .attr("height", 16)
      .attr('x', function(d) { return d.data.total_width ? d.data.total_width + 1 : 0 })
      .attr("xlink:href", "/static/cookie_in_url.png").call(getBB);

    cookieURLContent.filter(function(d,i){
       return d.data.redirect_to_nothing > 0;
    }).append('text')
      .attr("dy", 8)
      .attr('x', function(d) { return d.data.total_width ? d.data.total_width + 1 : 0 })
      .text(function(d) { return d.data.redirect_to_nohing; }).call(getBB);


  // UPDATE
  var nodeUpdate = nodeEnter.merge(node);

  // Transition to the proper position for the node
  nodeUpdate.transition()
    .duration(duration)
    .attr("transform", function(d) {
        return "translate(" + d.y + "," + d.x + ")";
     });

  // Update the node attributes and style
  nodeUpdate.select('circle.node')
    .attr('r', 10)
    .style("fill", function(d) {
        return d._children ? "lightsteelblue" : "#fff";
    })
    .attr('cursor', 'pointer');


  // Remove any exiting nodes
  var nodeExit = node.exit().transition()
      .duration(duration)
      .attr("transform", function(d) {
          return "translate(" + source.y + "," + source.x + ")";
      })
      .remove();

  // On exit reduce the node circles size to 0
  nodeExit.select('circle')
    .attr('r', 1e-6);

  // On exit reduce the opacity of text labels
  nodeExit.select('text')
    .style('fill-opacity', 1e-6);

  // ****************** links section ***************************

  // Update the links...
  var link = svg.selectAll('path.link')
      .data(links, function(d) { return d.id; });

  // Enter any new links at the parent's previous position.
  var linkEnter = link.enter().insert('path', "g")
      .attr("class", "link")
      .attr('d', function(d){
        var o = {x: source.x0, y: source.y0}
        return diagonal(o, o)
      });

  // UPDATE
  var linkUpdate = linkEnter.merge(link);

  // Transition back to the parent element position
  linkUpdate.transition()
      .duration(duration)
      .attr('d', function(d){ return diagonal(d, d.parent) });

  // Remove any exiting links
  var linkExit = link.exit().transition()
      .duration(duration)
      .attr('d', function(d) {
        var o = {x: source.x, y: source.y}
        return diagonal(o, o)
      })
      .remove();

  // Store the old positions for transition.
  nodes.forEach(function(d){
    d.x0 = d.x;
    d.y0 = d.y;
  });

  // Creates a curved (diagonal) path from parent to the child nodes
  function diagonal(s, d) {

    path = `M ${s.y} ${s.x}
            C ${(s.y + d.y) / 2} ${s.x},
              ${(s.y + d.y) / 2} ${d.x},
              ${d.y} ${d.x}`

    return path
  }

  // Toggle children on click.
  function click(d) {
    if (d.children) {
        d._children = d.children;
        d.children = null;
      } else {
        d.children = d._children;
        d._children = null;
      }
    update(d);
  }
}
