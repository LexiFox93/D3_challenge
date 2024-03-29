var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select(".chart")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "poverty";
var chosenYAxis = "healthcareLow";

// function used for updating x-scale var upon click on axis label
function xScale(data, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(data, d => d[chosenXAxis]) * .75,
      d3.max(data, d => d[chosenXAxis]) * 1.1,
    ])
    .range([0, width]);

  return xLinearScale;
  }

// function used for updating y-scale var upon click on axis label
function yScale(data, chosenYAxis) {
  // create scales
  var yLinearScale = d3.scaleLinear()
    .domain([d3.min(data, d => d[chosenYAxis]) * -2.5,
      d3.max(data, d => d[chosenYAxis]) * 2,
    ])
    .range([height, 0]);

  return yLinearScale;
}


// function used for updating xAxis var upon click on axis label
function renderAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

// function used for updating yAxis var upon click on axis label
function renderAxes(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);

  yAxis.transition()
    .duration(1000)
    .call(leftAxis);

  return yAxis;
}

// function used for updating circles group with a transition to
// new circles
// function renderCircles(circlesGroup, newYScale, chosenYAxis, newXScale, chosenXAxis) {
function renderCircles(circlesGroup, newXScale, chosenXAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]))
    // .attr("cy", d => newYScale(d[chosenYAxis]))

  return circlesGroup;
  
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, circlesGroup) {

  if (chosenXAxis === "poverty") {
    var label = "Poverty (%):";
  }
  else if (chosenXAxis === "age") {
    var label = "Age (Median)";
  }
  else if (chosenXAxis === "income") {
    var label = "Income (Median)"
  }

  var toolTip = d3.tip()
    .attr("class", "tooltip")
    .offset([-20, 60])
    .html(function(d) {
      return (`${d.state}<br>${label} ${d[chosenXAxis]}`);
    });

  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function(data) {
    toolTip.show(data);
  })
    // onmouseout event
    .on("mouseout", function(data, index) {
      toolTip.hide(data);
    });

  return circlesGroup;
}

// Retrieve data from the CSV file and execute everything below
d3.csv("assets/data/data.csv")
  .then(function(jData) {

  // parse data
  jData.forEach(function(data) {
    data.poverty = +data.poverty;
    data.age = +data.age;
    data.income = +data.income;
  });

  // xLinearScale function above csv import
  var xLinearScale = xScale(jData, chosenXAxis);

// yLinearScale function above csv import
  var yLinearScale = yScale(jData, chosenYAxis);

  // Create y scale function
  // var yLinearScale = d3.scaleLinear()
  //   .domain([23, d3.max(jData, d => d.healthcareLow)])*1.1,

  // var yLinearScale = d3.scaleLinear()
  //   .domain([0, d3.max(jData, d => d.healthcareLow)*2])
  //   .range([height, 0]);

  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // append x axis
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${width})`)
    .call(bottomAxis);

  // append y axis
  var yAxis = chartGroup.append("g")
    .classed("y-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(leftAxis);

  // // append initial circles
  // var circlesGroup = chartGroup.selectAll("circle")
  //   .data(jData)
  //   .enter()
  //   .append("circle")
  //   .attr("cx", d => xLinearScale(d[chosenXAxis]))
  //   .attr("cy", d => yLinearScale(d[chosenYAxis]))
  //   .attr("r", 20)
  //   .attr("fill", "red")
  //   .attr("opacity", ".5");

  //Create Circles
    // ==============================
    var circlesGroup = chartGroup.selectAll("circle")
    .data(jData)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d.poverty))
    .attr("cy", d => yLinearScale(d.healthcareLow))
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
      .attr("y", d => yLinearScale(d.healthcareLow))
      .attr("dy", 5)
      .attr("text-anchor", "middle")
      .attr("font-size", "12px")
      .attr("fill", "lightgray");

  // Create group for  2 x- axis labels
  var labelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

  var povertyLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty") // value to grab for event listener
    .classed("active", true)
    .text("Poverty (%)");

  var ageLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "age") // value to grab for event listener
    .classed("inactive", true)
    .text("Age (Median)");

    var incomeLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "income") // value to grab for event listener
    .classed("inactive", true)
    .text("Income (Median)");


  // Create group for  2 y- axis labels
  var labelsGroup = chartGroup.append("g")
  .attr("transform", `translate(${width / 2}, ${height + 20})`);

  var healthLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "healthcareLow") // value to grab for event listener
    .classed("inactive", true)
    .text("Lacks Healthcare (%)");

    var smokerLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "smokesHigh") // value to grab for event listener
    .classed("inactive", true)
    .text("Smokers (%)");



  // // append y axis
  // chartGroup.append("text")
  //   .attr("transform", "rotate(-90)")
  //   .attr("y", 0 - margin.left)
  //   .attr("x", 0 - (height / 2))
  //   .attr("dy", "1em")
  //   .classed("axis-text", true)
  //   .text("Lacks Healthcare (%)");

  // updateToolTip function above csv import
  var circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

  //add state abbreviation labels to circles
  chartGroup.selectAll("text.text-circles")
     .data(jData)
     .enter()
     .append('text')
     .classed("text-circles", true)
     .text(d => d.abbr)
     .attr("x", d => xLinearScale(d.poverty))
     .attr("y", d => yLinearScale(d.healthcareLow))
     .attr("dy", 5)
     .attr("text-anchor", "middle")
     .attr("font-size", "12px")
     .attr("fill", "lightgray");

  // x axis labels event listener
  labelsGroup.selectAll("text")
    .on("mouseover", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenXAxis) {

        // replaces chosenXAxis with value
        chosenXAxis = value;

        // console.log(chosenXAxis)

        // functions here found above csv import
        // updates x scale for new data
        xLinearScale = xScale(jData, chosenXAxis);

        // updates y scale for new data
        yLinearScale = yScale(jData, chosenYAxis);

        // updates x axis with transition
        xAxis = renderAxes(xLinearScale, xAxis);

        // updates y axis with transition
        yAxis = renderAxes(yLinearScale, yAxis);

        // updates circles with new x values
        // circlesGroup = renderCircles(circlesGroup, yLinearScale, chosenYAxis, xLinearScale, chosenXAxis);
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);


        // // updates circles with new y values
        // circlesGroup = renderCircles(circlesGroup, yLinearScale, chosenYAxis);


        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

        // changes classes to change bold text
        if (chosenXAxis === "age") {
          ageLabel
            .classed("active", true)
            .classed("inactive", false);
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else {
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
          povertyLabel
            .classed("active", true)
            .classed("inactive", false);

        // changes classes to change bold text
        if (chosenYAxis === "healthcareLow") {
          healthLabel
            .classed("active", true)
            .classed("inactive", false);
          smokerLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else {
          healthLabel
            .classed("active", false)
            .classed("inactive", true);
          smokerLabel
            .classed("active", true)
            .classed("inactive", false);
        }
        }
      }
    });
});
