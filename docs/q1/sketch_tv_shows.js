function _order(Inputs) {
    const select = Inputs.select(
      new Map([
        ["Alphabetical", (a, b) => a.genre.localeCompare(b.genre)],
        ["Average Duration (seasons), Ascending", (a, b) => a.avgDuration - b.avgDuration],
        ["Average Duration (seasons), Descending", (a, b) => b.avgDuration - a.avgDuration]
      ])
    );
    
    return select;
  }
  
  function _chart(d3,data) {
    // Specify the chart’s dimensions.
    const width = 1300;
    const height = 400;
    const marginTop = 50;
    const marginRight = 0;
    const marginBottom = 30;
    const marginLeft = 40;
    
    // Declare the x (horizontal position) scale and the corresponding axis generator.
    const x = d3.scaleBand()
      .domain(data.map(d => d.genre))
      .range([marginLeft, width - marginRight])
      .padding(0.1);
  
    const xAxis = d3.axisBottom(x).tickSizeOuter(0);
  
    // Declare the y (vertical position) scale.
    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.avgDuration)]).nice()
      .range([height - marginBottom, marginTop]);
  
    // Create the SVG container.
    const svg = d3.create("svg")
        .attr("viewBox", [0, 0, width, height])
        .attr("style", `max-width: ${width}px; height: auto; font: 10px sans-serif; overflow: visible;`);
  
    // Add title to the chart
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", marginTop * 0.75)
      .attr("text-anchor", "middle")
      .style("font-size", "28px")
      .style("fill", "#69bfb7") // Subdued text color
      .text("Average TV Show Duration by Genre");
  
    // Create a bar for each letter.
    const bar = svg.append("g")
      .selectAll("rect")
      .data(data)
      .join("rect")
        // .style("mix-blend-mode", "multiply") // Darker color when bars overlap during the transition.
        .attr("x", d => x(d.genre))
        .attr("y", d => y(d.avgDuration))
        .attr("height", d => y(0) - y(d.avgDuration))
        .attr("width", x.bandwidth())
        .attr("fill", (d, i) => d3.interpolateCool(i / (data.length - 1)));
  
    // Create the axes.
    const gx = svg.append("g")
        .attr("transform", `translate(0,${height - marginBottom})`)
        .call(xAxis)
        .call(g => g.selectAll("text")
          .style("text-anchor", "end")
          .attr("dx", "-.8em")
          .attr("dy", ".15em")
          .attr("transform", "rotate(-45)")
          .style("fill", "#f2f2f2"))
        .call(g => g.selectAll("line")
          .style("stroke", "#f2f2f2"))  // Make tick lines light colored
        .call(g => g.select(".domain")
          .style("stroke", "#f2f2f2"));  // Make axis line light colored
  
    const gy = svg.append("g")
          .attr("transform", `translate(${marginLeft},0)`)
          .call(d3.axisLeft(y)
          .tickFormat(d => Math.round(d)) 
            .ticks(10))
          .call(g => g.selectAll("text")
            .style("fill", "#f2f2f2"))  // Make text light colored
          .call(g => g.selectAll("line")
            .style("stroke", "#f2f2f2"))  // Make tick lines light colored
          .call(g => g.select(".domain")
            .style("stroke", "#f2f2f2"));  // Make axis line light colored
  
    // Return the chart, with an update function that takes as input a domain
    // comparator and transitions the x axis and bar positions accordingly. 
    return Object.assign(svg.node(), {
      update(order) {
        x.domain(data.sort(order).map(d => d.genre));
  
        const t = svg.transition()
            .duration(750);
  
        bar.data(data, d => d.genre)
            .order()
          .transition(t)
            .delay((d, i) => i * 20)
            .attr("x", d => x(d.genre))
            .attr("y", d => y(d.avgDuration))
            .attr("height", d => y(0) - y(d.avgDuration))
            .attr("width", x.bandwidth())
            .attr("fill", (d, i) => d3.interpolateCool(i / (data.length - 1)));
  
        gx.transition(t)
            .call(xAxis)
          .selectAll(".tick")
            .delay((d, i) => i * 20);
      }
    });
  }
  
  function _update(chart,order) {return(
    chart.update(order)
  )}
  
  function _data(FileAttachment) {return(
    FileAttachment("tv_shows.csv").csv({typed: true})
  )}
  
  function _trigger($0,d3,Event,invalidation)
  {
    const input = $0.input;
    const interval = d3.interval(() => {
      input.selectedIndex = (input.selectedIndex + 1) % input.length;
      input.dispatchEvent(new Event("input", {bubbles: true}));
    }, 4000);
    const clear = () => interval.stop();
    input.addEventListener("change", clear, {once: true});
    invalidation.then(() => (clear(), input.removeEventListener("change", clear)));
  }
  
  export default function define(runtime, observer) {
    const main = runtime.module();
    function toString() { return this.url; }
    const fileAttachments = new Map([
      ["tv_shows.csv", {url: new URL("./data/tv_shows.csv", import.meta.url), mimeType: "text/csv", toString}]
    ]);
  
    main.builtin("FileAttachment", runtime.fileAttachments(name => fileAttachments.get(name)));
    main.variable(observer("viewof order")).define("viewof order", ["Inputs"], _order);
    main.variable(observer("chart")).define("chart", ["d3","data"], _chart);
  
    main.define("order", ["Generators", "viewof order"], (G, _) => G.input(_));
    
    main.variable(observer("update")).define("update", ["chart","order"], function(chart, order) {
      const result = _update(chart, order);
      return Object.assign(document.createElement("div"), {
        style: "display: none;",  
        value: result
      });
    });
  
    main.variable(observer("trigger")).define("trigger", ["viewof order","d3","Event","invalidation"], function(viewof_order, d3, Event, invalidation) {
      const result = _trigger(viewof_order, d3, Event, invalidation);
      return Object.assign(document.createElement("div"), {
        style: "display: none;",
        value: result
      });
    });
  
    main.define("data", ["FileAttachment"], _data);

    document.addEventListener('DOMContentLoaded', () => {
      const items = document.querySelectorAll('.a li');
      const prevButton = document.getElementById('prev');
      const nextButton = document.getElementById('next');
      let currentIndex = 0;

      // Initialize the first item as active
      items[currentIndex].classList.add('active');

      // Show the next item
      nextButton.addEventListener('click', () => {
          items[currentIndex].classList.remove('active');
          currentIndex = (currentIndex + 1) % items.length; // Loop back to the start
          items[currentIndex].classList.add('active');
      });

      // Show the previous item
      prevButton.addEventListener('click', () => {
          items[currentIndex].classList.remove('active');
          currentIndex = (currentIndex - 1 + items.length) % items.length; // Loop back to the end
          items[currentIndex].classList.add('active');
      });
    });
  
    return main;
  }