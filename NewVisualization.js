// let charts = [];

function createVisualization(textColors, tokens, metrics, showPadding) {
    // const colors = d3.interpolateRainbow;

    if (!showPadding) {
        // check <pad> tokens in tokens and remove the items in these positions in all arrays
        const padIndices = tokens.map((token, index) => token === "<pad>" ? index : -1).filter(index => index !== -1);
        textColors = textColors.filter((_, index) => !padIndices.includes(index));
        tokens = tokens.filter((_, index) => !padIndices.includes(index));
        metrics = metrics.map(metric => Object.fromEntries(Object.entries(metric).map(([key, values]) => [key, values.filter((_, index) => !padIndices.includes(index))])));
    }

    const margin = { top: 20, right: 100, bottom: 30, left: 50 };

    const containerWidth = document.getElementById('chart-container').clientWidth;
    const width = containerWidth - margin.left - margin.right;

    const containerHeight = document.getElementById('chart-container').clientHeight;
    const height = Math.max(containerHeight - margin.top - margin.bottom, 200);

    function getTextColor(bgColor) {
        if (!bgColor) return "#000000";

        let r, g, b;
        if (bgColor.startsWith("#")) {
            [r, g, b] = [1, 3, 5].map(i => parseInt(bgColor.slice(i, i + 2), 16));
        } else if (bgColor.startsWith("rgb")) {
            [r, g, b] = bgColor.match(/\d+/g).map(Number);
        } else {
            [r, g, b] = [0, 2, 4].map(i => parseInt(bgColor.slice(i, i + 2), 16));
        }

        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        return luminance > 0.5 ? '#000000' : '#ffffff';
    }

    // Create text visualization
    const textContainer = d3.select("#text-container");
    tokens.forEach((token, index) => {
        textContainer.append("span")
            .text(token)
            .style("background-color", textColors[index])
            .style("color", getTextColor(textColors[index]))
            .on("mouseover", () => highlightPosition(index))
            .on("mouseout", removeHighlight);
    });

    let charts = [];
    for (let metric of metrics) {
        // let metric = metrics[0];
        // Create chart
        let svg = d3.select("#chart-container")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        let x = d3.scaleLinear()
            .domain([0, tokens.length - 1])
            .range([0, width]);

        const valuesFlat = Object.values(metric).flat();

        const y = d3.scaleLinear()
            .domain([Math.min(0, d3.min(valuesFlat)), d3.max(valuesFlat)])
            .range([height, 0]);

        // Add X axis
        svg.append("g")
            .attr("transform", `translate(0,${height})`)
            .style("font-size", "15px")
            .call(d3.axisBottom(x));

        // Add Y axis
        svg.append("g")
            .style("font-size", "15px")
            .call(d3.axisLeft(y));

        // Add lines
        Object.entries(metric).forEach(([key, values], index) => {
            const line = d3.line()
                .x((d, i) => x(i))
                .y(d => y(d));

            svg.append("path")
                .datum(values)
                .attr("fill", "none")
                .attr("stroke", d3.schemeCategory10[index % 10])
                .attr("stroke-width", 1.5)
                .attr("d", line)
        });

        // Add legend
        const legend = svg.append("g")
            .attr("font-family", "sans-serif")
            .attr("font-size", 15)
            .attr("text-anchor", "start")
            .selectAll("g")
            .data(Object.keys(metric))
            .enter().append("g")
            .attr("transform", (d, i) => `translate(${10},${i * 20})`);

        legend.append("rect")
            .attr("x", 0)
            .attr("width", 19)
            .attr("height", 19)
            .attr("fill", (d, i) => d3.schemeCategory10[i % 10]);

        legend.append("text")
            .attr("x", 24)
            .attr("y", 9.5)
            .attr("dy", "0.32em")
            .text(d => d);

        // Add invisible overlay for mouse tracking
        svg.append("rect")
            .attr("width", width)
            .attr("height", height)
            .style("fill", "none")
            .style("pointer-events", "all")
            .on("mousemove", (event) => {
                const [xPos] = d3.pointer(event);
                const index = Math.round(x.invert(xPos));
                highlightPosition(index);
            })
            .on("mouseout", removeHighlight);

        charts.push([svg, x, y]);
    }

    // Highlight functions
    function highlightPosition(index) {
        d3.select("#text-container")
            .selectAll("span")
            // make bold
            .style("font-weight", (d, i) => i === index ? "bold" : "normal")
            .style("text-decoration", (d, i) => i === index ? "underline" : "none");

        charts.forEach(([chart, x, y], i) => {
            chart.selectAll(".highlight-line").remove();
            chart.selectAll(".highlight-values").remove();


            chart.append("line")
                .attr("class", "highlight-line")
                .attr("x1", x(index))
                .attr("x2", x(index))
                .attr("y1", 0)
                .attr("y2", height)
                .attr("stroke", "red")
                .attr("stroke-width", 1);

            const valueGroup = chart.append("g")
                .attr("class", "highlight-values")
                .attr("transform", `translate(${x(index)},0)`);

            Object.entries(metrics[i]).forEach(([key, values], j) => {
                valueGroup.append("text")
                    .attr("x", 5)
                    .attr("y", y(values[index]))
                    .attr("fill", d3.schemeCategory10[j % 10])
                    .attr("font-size", "18px")
                    .text(`${values[index].toFixed(2)}`);
            });
        })

    }

    function removeHighlight() {
        d3.select("#text-container")
            .selectAll("span")
            .style("text-decoration", "none")
            .style("font-weight", "normal");

        charts.forEach(([chart, _, __]) => {
            chart.selectAll(".highlight-line").remove();
            chart.selectAll(".highlight-values").remove();
        });
    }
}