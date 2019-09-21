var svgWidth = 960;
var svgHeight = 500;
 


var margin = {
  top: 20,
  right: 40,
  bottom: 60,
  left: 100,
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart, and shift the latter by left and top margins.
var svg = d3.select(".chart")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);
  
  

var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

  

// Import Data
d3.csv("assets/data/data.csv")
  .then(function(jData) {

    // Step 1: Parse Data/Cast as numbers
    // ==============================
    jData.forEach(function(data) {
      data.povery = +data.poverty;
      data.healthcare = +data.healthcare;
    });

    // Step 2: Create scale functions
    // ==============================
    var xLinearScale = d3.scaleLinear()
      .domain([23, d3.max(jData, d => d.poverty)*.75])
      .range([width, 0]);

    var yLinearScale = d3.scaleLinear()
      .domain([0, d3.max(jData, d => d.healthcare)*1.1])
      .range([height, 0]);

    // Step 3: Create axis functions
    // ==============================
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // Step 4: Append Axes to the chart
    // ==============================
    chartGroup.append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(bottomAxis);

    chartGroup.append("g")
      .call(leftAxis);

    // Step 5: Create Circles
    // ==============================
    var circlesGroup = chartGroup.selectAll("circle")
    .data(jData)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d.poverty))
    .attr("cy", d => yLinearScale(d.healthcare))
    .attr("r", "15")
    .attr("fill", "red")
    .attr("stroke-width", 3)
    .attr("stroke", "black")
    .attr("opacity", ".6");

    //add state abbreviation labels to circles
    chartGroup.selectAll("text.text-circles")
      .data(jData)
      .enter()
      .append('text')
      .classed("text-circles", true)
      .text(d => d.abbr)
      .attr("x", d => xLinearScale(d.poverty))
      .attr("y", d => yLinearScale(d.healthcare))
      .attr("dy", 5)
      .attr("text-anchor", "middle")
      .attr("font-size", "12px")
      .attr("fill", "lightgray");

    // Step 6: Initialize tool tip
    // ==============================
    var toolTip = d3.tip()
      .attr("class", "tooltip")
      .offset([-20, 60])
      .html(function(d) {
        return (`${d.abbr}<br>Poverty: ${d.poverty}%<br>Low Healthcare: ${d.healthcare}%`);
      });

    // Step 7: Create tooltip in the chart
    // ==============================
    chartGroup.call(toolTip);

    // Step 8: Create event listeners to display and hide the tooltip
    // ==============================
    circlesGroup.on("mouseover", function(data) {
      toolTip.show(data, this);
    })
      // onmouseout event
      .on("mouseout", function(data, index) {
        toolTip.hide(data);
      });

    // Create axes labels
    chartGroup.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left + 40)
      .attr("x", 0 - (height / 1.5))
      .attr("dy", "1em")
      .attr("class", "axisText")
      .text("Lacks Healthcare (%)")
      .style("font", "14px helvetica")
      .attr("font-weight", 900);

    chartGroup.append("text")
      .attr("transform", `translate(${width / 2.5}, ${height + margin.top + 30})`)
      .attr("class", "axisText")
      .text("In Poverty (%)")
      .style("font", "14px arial")
      .attr("font-weight", 900);
  });

  
