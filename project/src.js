(async () => {
    console.log("hello world!")

    var svg = d3.select("#left").append("svg")
                                .attr("width", 783)
                                .attr("height", 650);
    width = +svg.attr("width"),
    height = +svg.attr("height");

    // location tested on https://www.d3indepth.com/geographic/
    var projection = d3.geoMercator()
                       .center([85, 42])
                       .scale(1800)
                       .translate([width / 2, height / 2])


    // test location of Urumqi (works so far)
    // svg.append("circle")
    //    .attr("r",5)
    //    .attr("transform", function() {
    //     return "translate(" + projection([88,44]) + ")";
    // });

    d3.queue()
	  .defer(d3.json, 'xinjiang-autonomous-region_1167.geojson')
	  .defer(d3.json, 'facilities.geojson')
	  .await(plot);

    function plot(error, xinjiang, sites) {
        if (error) throw error;

        map_data = xinjiang.features.filter(
            function(d) {
                return d.properties; // .shapeName == "#level2Adm"
            }
        )

        site_data = sites.features.filter(
            function(d) {
                return d.properties;
            }
        )

        // tooltip showing 2ndAdm names
        let tooltip_div = d3.select('body')
                        .append('div')
                        .style('position', 'absolute')
                        .style('z-index', '10')
                        .style('visibility', 'hidden')
                        .style('background-color', 'white')
                        .style('border', 'solid')
                        .style('border-width', '2px')
                        .style('border-radius', '5px')
                        .style('padding', '5px');

        // tooltip showing site names
        let tooltip_site = d3.select('body')
                        .append('div')
                        .style('position', 'absolute')
                        .style('z-index', '10')
                        .style('visibility', 'hidden')
                        .style('background-color', 'lightblue')
                        .style('border', 'solid')
                        .style('border-width', '2px')
                        .style('padding', '5px');

        // draw the map
        svg.append("g")
           .selectAll("path")
           .data(map_data)
           .enter()
           .append("path")
           .attr("d", d3.geoPath().projection(projection))
           .on('mouseover', function() {
            d3.select(this).attr('stroke-width', 3);
            tooltip_div.style('visibility', 'visible');
           })
           .on('mousemove', function(d) {
            tooltip_div
              .style('top', d3.event.pageY - 10 + 'px')
              .style('left', d3.event.pageX + 10 + 'px')
              .text(`${d.properties.name}`);
           })
           .on('mouseout', function() {
            d3.select(this).attr('stroke-width', 1);
            tooltip_div.style('visibility', 'hidden');
           })

        // draw the sites
        svg.selectAll("circle")
           .data(site_data) // csv worked bad
           .enter()
           .append("circle")
           .attr("cx", function(d) { 
            return projection([d.geometry.coordinates[0], d.geometry.coordinates[1]])[0]
           })
           .attr("cy", function(d) { 
            return projection([d.geometry.coordinates[0], d.geometry.coordinates[1]])[1]
           })
           .attr("r", 3)
           .attr("id", function(d) {
            return "z" + `${d.properties["facility type"]}`; // add "z" for better regex compatibility...
           })
           .on('mouseover', function() {
            d3.select(this).attr('r', 6);
            tooltip_site.style('visibility', 'visible');
           })
           .on('mousemove', function(d) {
            tooltip_site
              .style('top', d3.event.pageY - 10 + 'px')
              .style('left', d3.event.pageX + 10 + 'px')
              .text('Site: ' + `${d.properties.Name}`);
           })
           .on('mouseout', function() {
            d3.select(this).attr('r', 3);
            tooltip_site.style('visibility', 'hidden');
           })
           // show information on click
           .on('click', function(d) {
            d3.selectAll(".information").remove();
            d3.select("#information_parent")
              .append("p")
              .text(`${d.properties.Name}` + 
                    " (" +
                    `${d.properties["corroboration level"]}` +
                    ") " +
                    " is a " + 
                    `${d.properties["facility type"]}` + 
                    " in " + 
                    `${d.properties.Town}` + 
                    ", " + 
                    `${d.properties.Prefecture}` +
                    ".")
              .classed('information', true);
            // console.log(d.properties.Name);
           })
    }

    // jQuery functions for selecting sites

    $('.filter_button').on("click", function() {
        $('circle[id^=z]').hide();
        var id = $(this).attr('id');
        $(`circle[id^=${id}]`).show(); //match the div with id ends with the character and show
    });

    // have to create separate function for all_site button...
    $('.unfilter_button').on("click", function() {
        $(`circle[id^=z]`).show(); //match the div with id ends with the character and show
    });
    
})();