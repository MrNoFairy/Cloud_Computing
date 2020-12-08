//Variables
var activeMarker;

// AccordeonMaager
function accordeonManager(id) {
	var x = document.getElementById(id);
	document.getElementById("Accordeon1").className = "w3-container w3-hide w3-animate-zoom";
	document.getElementById("Accordeon2").className = "w3-container w3-hide w3-animate-zoom";
	document.getElementById("Accordeon3").className = "w3-container w3-hide w3-animate-zoom";
	if (id == "Accordeon3") {
		loadChart()
	}
	if (id == "Accordeon1") {
		document.getElementById(id).className = "w3-container w3-show w3-animate-zoom";
	} else {
		document.getElementById(id).className = "w3-show w3-animate-zoom";
	}
}

function includeHTML() {
  var z, i, elmnt, file, xhttp;
  // Loop through a collection of all HTML elements:
  z = document.getElementsByTagName("*");
  for (i = 0; i < z.length; i++) {
    elmnt = z[i];
    // search for elements with a certain atrribute:
    file = elmnt.getAttribute("w3-include-html");
    if (file) {
      // Make an HTTP request using the attribute value as the file name:
      xhttp = new XMLHttpRequest();
      xhttp.onreadystatechange = function() {
        if (this.readyState == 4) {
          if (this.status == 200) {elmnt.innerHTML = this.responseText;}
          if (this.status == 404) {elmnt.innerHTML = "Page not found.";}
          // Remove the attribute, and call this function once more:
          elmnt.removeAttribute("w3-include-html");
          includeHTML();
        }
      }
      xhttp.open("GET", file, true);
      xhttp.send();
      /* Exit the function: */
      return;
    }
  }
 loadMap();
}

includeHTML();

// Accordeon2 load Map
function loadMap() {

	// Variables
	var infowindow = new google.maps.InfoWindow({
	    content: ""
	});;
	
	// Create Map and set initial Position & Zoom
	var map = new google.maps.Map(document.getElementById('map'), {
		zoom : 4,
		center : {
			lat : 40,
			lng : -110
		}
	});

	// http request to load marker data
	httpRequest = new XMLHttpRequest();
	httpRequest.open('GET', 'down', true);
	httpRequest.responseType = 'text/plain';
	httpRequest.send();
	httpRequest.onreadystatechange = function() {
		if (httpRequest.readyState === XMLHttpRequest.DONE) {
			if (httpRequest.status === 200) {
				var dataJson = JSON.parse(httpRequest.response);

				// Generates Marker and adds a listener for each Sensor on the
				// map
				for (i = 0; i < dataJson.length; i++) {
					var marker = new google.maps.Marker(
							{
								position : new google.maps.LatLng(
										parseFloat(dataJson[i].Latitude),
										parseFloat(dataJson[i].Longitude)),
								map : map,
								title : dataJson[i].Name,
								icon : 'https://img.icons8.com/office/30/000000/marker.png'
							});
							
					map.set(dataJson[i].Name, dataJson[i].InfoWindow);

					marker.addListener(
									'click',
									function() {

										if (activeMarker != null) {
											activeMarker
													.setIcon('https://img.icons8.com/office/30/000000/marker.png')
										}
										activeMarker = this;
										activeMarker
												.setIcon('https://img.icons8.com/ultraviolet/30/000000/marker.png')
										infowindow.close();
										infowindow = new google.maps.InfoWindow({
										    content: map.get(activeMarker.getTitle())
										  });
										infowindow.open(map, this);
									});
					// sets last loaded marker as active marker
					if (i == dataJson.length - 1) {
						new google.maps.event.trigger(marker, 'click');
						infowindow.close();
					}
				}
			}
		}
	}
}

function loadChart() {
	// set the dimensions and margins of the graph
	var marginTop = 20;
	var marginRight = 20;
	var marginBottom = 30;
	var marginLeft = 50;
	var width = 960 - marginLeft - marginRight;
	var height = 280 - marginTop - marginBottom;
	
	var duration = 250;
	
	var lineOpacity = "0.25";
	var lineOpacityHover = "0.85";
	var otherLinesOpacityHover = "0.1";
	var lineStroke = "1.5px";
	var lineStrokeHover = "2.5px";

	var circleOpacity = '0.85';
	var circleOpacityOnLineHover = "0.25"
	var circleRadius = 3;
	var circleRadiusHover = 6;
	
	// aquire, format and sort data
	httpRequest = new XMLHttpRequest();
	httpRequest.open('GET', '/down?Symbol=' + activeMarker.getTitle());
	httpRequest.responseType = 'text/plain';
	httpRequest.send();
	httpRequest.onreadystatechange = function() {
		if (httpRequest.readyState === XMLHttpRequest.DONE) {
			if (httpRequest.status === 200) {
				var dataJson = JSON.parse(httpRequest.response);
				
				var openData = dataJson["openData"]
				var closeData = dataJson["closeData"]
				var highData = dataJson["highData"]
				var lowData = dataJson["lowData"]
				var meanData = dataJson["meanData"]
				var meanSquareData = dataJson["meanSquareData"]
				
				// parse the date / time
				var parseTime = d3.timeParse("%Y/%m/%d");
				
				// sort years ascending
				openData.sort(function(a, b) {return a["date"] + b["date"];})
				closeData.sort(function(a, b) {return a["date"] + b["date"];})
				highData.sort(function(a, b) {return a["date"] + b["date"];})
				lowData.sort(function(a, b) {return a["date"] + b["date"];})
				meanData.sort(function(a, b) {return a["date"] + b["date"];})
				meanSquareData.sort(function(a, b) {return a["date"] + b["date"];})
				
				// format the data
				openData.forEach(function(d) {
				d.date = parseTime(d.date)
				});
				closeData.forEach(function(d) {
					d.date = parseTime(d.date)
					});
				highData.forEach(function(d) {
					d.date = parseTime(d.date)
					});
				lowData.forEach(function(d) {
					d.date = parseTime(d.date)
					});
				meanData.forEach(function(d) {
					d.date = parseTime(d.date)
					});
				meanSquareData.forEach(function(d) {
					d.date = parseTime(d.date)
					});
				
				draw(openData, closeData, highData, lowData, meanData, meanSquareData);
			}
		}
	}

	// removes old chart, appens a new
	d3.select("g").remove();
	var svg = d3.select("#chart").append("g").attr("transform", "translate(" + marginLeft + "," + marginTop + ")");
	
	// Tooltip div & move the invisible tooltip div away from the side end, to
	// fix screen sizing
	var tooltip = d3.select("body").append("div")
     .attr("class", "tooltip")
     .style("opacity", 0)
     .style("left", "0px")
     .style("top", "0px");
	
		// title for the chart
	   svg.append("text")
	   .attr("fill", "black")
	   .attr("text-anchor", "middle")
	   .attr("transform", "translate("+ (width/2) + "," +(0 - height/50) + ")")
	   .text(activeMarker.getTitle() + " Stock Data");

	function draw(openData, closeData, highData, lowData, meanData, meanSquareData) {
		svg.append("g");
	
		// new Array with all dates
		var allDatesMixed = [];
		
		for(var i = 0; i < openData.length; i++){
			allDatesMixed.push(openData[i].date);
		}

		
		// set Scales (range = length of axis && domain = min & max values of
		// axis)
		var xScale = d3.scaleTime().domain([ d3.min(allDatesMixed) , d3.max(allDatesMixed) ]).range([ 0, width ]);
		
		// new Array with all values
		var allValuesMixed = [];
		
		for(var i = 0; i < openData.length; i++){
			allValuesMixed.push(openData[i].value);
			allValuesMixed.push(closeData[i].value);
			allValuesMixed.push(highData[i].value);
			allValuesMixed.push(lowData[i].value);
			//mean & meansquare not needed, beacause between
		}
		
		var yScale = d3.scaleLinear().domain([ d3.min(allValuesMixed), d3.max(allValuesMixed) ]).range([ height, 0 ]);
		
		// append Axis
		var xAxis = svg.append("g")
		   .attr("transform", "translate(0," + height + ")")
		   .call(d3.axisBottom(xScale))
		var yAxis = svg.append("g")
		   .call(d3.axisLeft(yScale));
		   
		var zoom = d3.zoom()
		    .scaleExtent([0.3, 3])  // This control how much you can unzoom
		    .extent([[0, 0], [width, height]])
		    .on("zoom", updateChart);
			
		// add an invisible rect on top of the chart area,to recover pointer
		// events
		svg.select("g").append("rect")
		    .attr("width", width)
		    .attr("height", height)
		    .style("fill", "none")
		    .style("pointer-events", "all")
		    .call(zoom);
			  
		   
		// Add a clipPath: everything out of this area won't be drawn.
		var clip = svg.append("SVG:clipPath")
		    .attr("id", "clip")
		    .append("SVG:rect")
		    .attr("width", width )
		    .attr("height", height )
		    .attr("x", 0)
		    .attr("y", 0);
		svg.select("g").attr("clip-path", "url(#clip)");
		   	   	   
		   // add lineplot
		   svg.select("g")
		   	  .data([openData])
		      .append("path")
		          .attr("class", "open")
		      	  .attr("stroke-width", 2)
		      	  .attr("opacity", "1")
	              .attr("stroke", "blue")
	              .attr("d", d3.line()
	          		    .curve(d3.curveMonotoneX)
	        		    .x(function(d) { return xScale(d.date); })
	        		    .y(function(d) { return yScale(d.value); }));
		   
		  
		   svg.select("g")
		   	  .data([closeData])
		      .append("path")
		      	  .attr("class", "close")
		      	  .attr("stroke-width", 2)
		      	  .attr("opacity", "1")
	              .attr("stroke", "red")
	              .attr("d", d3.line()
	          		    .curve(d3.curveMonotoneX)
	        		    .x(function(d) { return xScale(d.date); })
	        		    .y(function(d) { return yScale(d.value); }));
		   
		   svg.select("g")
		   	  .data([highData])
		      .append("path")
		      	  .attr("class", "high")
		      	  .attr("stroke-width", 2)
		      	  .attr("opacity", "1")
	              .attr("stroke", "green")
	              .attr("d", d3.line()
	          		    .curve(d3.curveMonotoneX)
	        		    .x(function(d) { return xScale(d.date); })
	        		    .y(function(d) { return yScale(d.value); }));
		   
		   svg.select("g")
		   	  .data([lowData])
		      .append("path")
		      	  .attr("class", "low")
		      	  .attr("stroke-width", 2)
		      	  .attr("opacity", "1")
	              .attr("stroke", "yellow")
	              .attr("d", d3.line()
	          		    .curve(d3.curveMonotoneX)
	        		    .x(function(d) { return xScale(d.date); })
	        		    .y(function(d) { return yScale(d.value); }));
		   
		   svg.select("g")
		   	  .data([meanData])
		      .append("path")
		      	  .attr("class", "mean")
		      	  .attr("stroke-width", 2)
		      	  .attr("opacity", "1")
	              .attr("stroke", "purple")
	              .attr("d", d3.line()
	          		    .curve(d3.curveMonotoneX)
	        		    .x(function(d) { return xScale(d.date); })
	        		    .y(function(d) { return yScale(d.value); }));
		   
		   svg.select("g")
		   	  .data([meanSquareData])
		      .append("path")
		      	  .attr("class", "meanSquare")
		      	  .attr("stroke-width", 2)
		      	  .attr("opacity", "1")
	              .attr("stroke", "orange")
	              .attr("d", d3.line()
	          		    .curve(d3.curveMonotoneX)
	        		    .x(function(d) { return xScale(d.date); })
	        		    .y(function(d) { return yScale(d.value); }));
		   
		   
// add scatterplot
		
		svg.select("g").selectAll("circle").filter(".open")
	      .data(openData)
	      .enter()
	      .append("circle")
	        .attr("class", "open")

		
		svg.select("g").selectAll("circle").filter(".close")
	      .data(closeData)
	      .enter()
	      .append("circle")
	        .attr("class", "close")
	    
	    svg.select("g").selectAll("circle").filter(".high")
	      .data(highData)
	      .enter()
	      .append("circle")
	        .attr("class", "high")
	    
	    svg.select("g").selectAll("circle").filter(".low")
	      .data(lowData)
	      .enter()
	      .append("circle")
	        .attr("class", "low")
	        
	    svg.select("g").selectAll("circle").filter(".mean")
	      .data(meanData)
	      .enter()
	      .append("circle")
	        .attr("class", "mean")
	    
	    svg.select("g").selectAll("circle").filter(".meanSquare")
	      .data(meanSquareData)
	      .enter()
	      .append("circle")
	        .attr("class", "meanSquare")
	        
	    svg.select("g").selectAll("circle")   
	        .attr("fill", "black")
	        .attr("opacity", "1")
	        .attr("stroke", "none")
	        .attr("cx", function(d) { return xScale(d.date) })
	        .attr("cy", function(d) { return yScale(d.value) })
	        .attr("r", circleRadius)
	        .on("mouseover", function(d) {
		        d3.select(this)
	          .transition()
		          .duration(duration)
		          .attr("r", circleRadiusHover);
		        
		          tooltip.transition()
	               .duration(50)
	               .style("opacity", 1);
		          
		          tooltip.html(d.value)
		          .style("left", (d3.event.pageX - 25) + "px")
		          .style("top", (d3.event.pageY - 25) + "px");
		      })
		    .on("mouseout", function(d) {
		        d3.select(this) 
		          .transition()
		          .duration(duration)
		          .attr("r", circleRadius);
		        
		        tooltip.transition()
	               .duration(500)
	               .style("opacity", 0);
		      });
		
		
		
	var legend = svg.append("g")
        .attr("font-size", 10)
        .attr("text-anchor", "end")
        .append("g")
        .attr("transform",  "translate(-"+ width +"," + height*1.1 +")")
        console.log(width)
    
    legend.append("rect")
    	.attr("class", "open")
        .attr("x", width - 17)
        .attr("width", 15)
        .attr("height", 15)
        .attr("fill", "blue")
        .attr("stroke", "blue")
        .attr("stroke-width",2)
        .attr("transform",  "translate("+ width*2/100 +",0)")
        .on("click",function(d) { updateLegendFilter(".open") })   
    legend.append("text")
        	.attr("x", width - 24)
        	.attr("y", 9.5)
        	.attr("fill", "black")
        	.attr("dy", "0.32em")
        	.attr("transform",  "translate("+ width*8/100 +",0)")
        	.text("Open");
   
    legend.append("rect")
		.attr("class", "close")
		.attr("x", width - 17)
		.attr("width", 15)
		.attr("height", 15)
		.attr("fill", "red")
		.attr("stroke", "red")
		.attr("stroke-width",2)
		.attr("transform",  "translate("+ width*12/100 +",0)")
		.on("click",function(d) { updateLegendFilter(".close") })
    legend.append("text")
		.attr("x", width - 24)
		.attr("y", 9.5)
        .attr("fill", "black")
		.attr("dy", "0.32em")
		.attr("transform",  "translate("+ width*18/100 +",0)")
		.text("Close");
    

    legend.append("rect")
		.attr("class", "high")
		.attr("x", width - 17)
		.attr("width", 15)
		.attr("height", 15)
		.attr("fill", "green")
		.attr("stroke", "green")
		.attr("stroke-width",2)
		.attr("transform",  "translate("+ width*22/100 +",0)")
		.on("click",function(d) { updateLegendFilter(".high") });
    legend.append("text")
		.attr("x", width - 24)
		.attr("y", 9.5)
		.attr("fill", "black")
		.attr("dy", "0.32em")
		.attr("transform",  "translate("+ width*28/100 +",0)")
		.text("High");

    legend.append("rect")
    	.attr("class", "low")
    	.attr("x", width - 17)
    	.attr("width", 15)
    	.attr("height", 15)
        .attr("fill", "yellow")
        .attr("stroke", "yellow")
        .attr("stroke-width",2)
        .attr("transform",  "translate("+ width*32/100 +",0)")
        .on("click",function(d) { updateLegendFilter(".low") });
    legend.append("text")
		.attr("x", width - 24)
		.attr("y", 9.5)
		.attr("fill", "black")
		.attr("dy", "0.32em")
		.attr("transform",  "translate("+ width*38/100 +",0)")
		.text("Low");
    
    legend.append("rect")
		.attr("class", "mean")
		.attr("x", width - 17)
		.attr("width", 15)
		.attr("height", 15)
		.attr("fill", "purple")
    	.attr("stroke", "purple")
    	.attr("stroke-width",2)
    	.attr("transform",  "translate("+ width*42/100 +",0)")
    	.on("click",function(d) { updateLegendFilter(".mean") });
    legend.append("text")
		.attr("x", width - 24)
		.attr("y", 9.5)
      	.attr("fill", "black")
		.attr("dy", "0.32em")
		.attr("transform",  "translate("+ width*48/100 +",0)")
		.text("Mean");

    legend.append("rect")
    	.attr("class", "meanSquare")
    	.attr("x", width - 17)
    	.attr("width", 15)
    	.attr("height", 15)
    	.attr("fill", "orange")
    	.attr("stroke", "orange")
    	.attr("stroke-width",2)
    	.attr("transform",  "translate("+ width*52/100 +",0)")
    	.on("click",function(d) { updateLegendFilter(".meanSquare") });
    legend.append("text")
    	.attr("x", width - 24)
    	.attr("y", 9.5)
    	.attr("fill", "black")
    	.attr("dy", "0.32em")
    	.attr("transform",  "translate("+ width*61/100 +",0)")
    	.text("MeanSquare");
         
    function updateLegendFilter(classId){
    	var circle = svg.selectAll("circle").filter(classId);
    	var path = svg.selectAll("path").filter(classId);
    	var rect = svg.selectAll("rect").filter(classId);
    	if(circle.attr("opacity") == "0"){
    		circle.attr("opacity", "1")
    		path.attr("opacity", "1")
    		rect.attr("fill-opacity", "1")
    	} else {
    		circle.attr("opacity", "0")
    		path.attr("opacity", "0")
    		rect.attr("fill-opacity", "0")
    	}
    }
    
	  function updateChart() {

		    // recover the new scale
		    var newX = d3.event.transform.rescaleX(xScale);
		    var newY = d3.event.transform.rescaleY(yScale);

		    // update axes with these new boundaries
		    xAxis.call(d3.axisBottom(newX))
		    yAxis.call(d3.axisLeft(newY))

		    // update Line position
		    svg.select("g")
		      .selectAll("path")
		      .attr("d", d3.line()
	          	.curve(d3.curveMonotoneX)
	            .x(function(d) { return newX(d.date); })
	            .y(function(d) { return newY(d.value); }));
		    
		    // update circle position
		    svg.select("g")
		      .selectAll("circle")
		      .attr('cx', function(d) {return newX(d.date)})
		      .attr('cy', function(d) {return newY(d.value)});

		  }
	}
}