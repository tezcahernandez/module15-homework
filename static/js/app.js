buildGauge = (WFREQ) => {
    // Enter a speed between 0 and 180
    var level = WFREQ;

    // Trig to calc meter point
    var degrees = 9 - level,
        radius = .5;
    var radians = degrees * Math.PI / 9;
    var x = radius * Math.cos(radians);
    var y = radius * Math.sin(radians);

    // Path: may have to change to create a better triangle
    var mainPath = 'M -.0 -0.025 L .0 0.025 L ',
        pathX = String(x),
        space = ' ',
        pathY = String(y),
        pathEnd = ' Z';
    var path = mainPath.concat(pathX, space, pathY, pathEnd);

    var data = [{
        type: 'scatter',
        x: [0], y: [0],
        marker: { size: 28, color: '850000' },
        showlegend: false,
        name: 'speed',
        text: level,
        hoverinfo: 'text+name'
    },
    {
        values: [50 / 9, 50 / 9, 50 / 9, 50 / 9, 50 / 9, 50 / 9, 50 / 9, 50 / 9, 50 / 9, 50],
        rotation: 90,
        text: ["8-9", "7-8", "6-7", "5-6", "4-5", "3-4", "2-3", "1-2", "0-1", ""],
        textinfo: 'text',
        textposition: 'inside',
        marker: {
            colors: ['#0A2F51', '#0E4D64',
                '#137177', '#188977',
                '#1D9A6C', '#48B16D',
                '#74C67A', '#ADDAA1',
                '#DEEDCF',
                'rgba(255, 255, 255, 0)']
        },
        labels: ["8-9", "7-8", "6-7", "5-6", "4-5", "3-4", "2-3", "1-2", "0-1", ""],
        // labels: ['151-180', '121-150', '91-120', '61-90', '31-60', '0-30', ''],
        hoverinfo: 'label',
        hole: .5,
        type: 'pie',
        showlegend: false
    }];

    var layout = {
        shapes: [{
            type: 'path',
            path: path,
            fillcolor: '850000',
            line: {
                color: '850000'
            }
        }],
        title: '<b>Belly Button Washing Frequency</b><br>Scrubs per Week',
        height: 600,
        width: 600,
        xaxis: {
            zeroline: false, showticklabels: false,
            showgrid: false, range: [-1, 1]
        },
        yaxis: {
            zeroline: false, showticklabels: false,
            showgrid: false, range: [-1, 1]
        }
    };

    Plotly.newPlot('gauge', data, layout);
}
buildMetadata = async (sample) => {

    // @TODO: Complete the following function that builds the metadata panel

    // Use `d3.json` to fetch the metadata for a sample
    let urlMetadata = `/metadata/${sample}`;
    let sampleData = await d3.json(urlMetadata);

    // Use d3 to select the panel with id of `#sample-metadata`
    let sampleMetadataRef = d3.select("#sample-metadata");

    // Use `.html("") to clear any existing metadata
    sampleMetadataRef.html("");

    // Use `Object.entries` to add each key and value pair to the panel
    // Hint: Inside the loop, you will need to use d3 to append new
    // tags for each key-value in the metadata.
    row = sampleMetadataRef.append("tr");
    Object.entries(sampleData).forEach(function ([key, value]) {
        tdElement = row.append("td")
        // div.classed("bubles", true);
        tdElement.append("h5").html(`<strong>${key}</strong>`);
        tdElement.append("h5").html(`${value}`);
        // sampleMetadataRef.append("h5").html(`<strong>${key}</strong>`);
        // sampleMetadataRef.append("h5").html(`${value}`);
    });

    // BONUS: Build the Gauge Chart
    buildGauge(sampleData.WFREQ);
}

buildCharts = async (sample) => {

    // @TODO: Use `d3.json` to fetch the sample data for the plots
    var urlSamples = `/samples/${sample}`;
    let data = await d3.json(urlSamples);

    // @TODO: Build a Bubble Chart using the sample data
    const x_values = data.otu_ids;
    const y_values = data.sample_values;
    const m_sizes = data.sample_values;
    const m_colors = data.otu_ids;
    const t_values = data.otu_labels;

    const trace1 = {
        x: x_values,
        y: y_values,
        text: t_values,
        mode: 'markers',
        marker: {
            color: m_colors,
            size: m_sizes
        }
    };

    let dataTrace = [trace1];

    const bubbleLayout = {
        xaxis: { title: "OTU ID" },
    };

    Plotly.newPlot('bubble', dataTrace, bubbleLayout);


    // @TODO: Build a Pie Chart
    // HINT: You will need to use slice() to grab the top 10 sample_values,
    // otu_ids, and labels (10 each).
    const pie_values = data.sample_values.slice(0, 10);
    const pie_labels = data.otu_ids.slice(0, 10);
    const pie_hover = data.otu_labels.slice(0, 10);

    dataTrace = [{
        values: pie_values,
        labels: pie_labels,
        hovertext: pie_hover,
        type: 'pie'
    }];

    Plotly.newPlot('pie', dataTrace);
}

function init() {
    // Grab a reference to the dropdown select element
    var selector = d3.select("#selDataset");

    // Use the list of sample names to populate the select options
    d3.json("/names").then((sampleNames) => {
        sampleNames.forEach((sample) => {
            selector
                .append("option")
                .text(sample)
                .property("value", sample);
        });

        // Use the first sample from the list to build the initial plots
        const firstSample = sampleNames[0];
        buildCharts(firstSample);
        buildMetadata(firstSample);
    });
}

function optionChanged(newSample) {
    // Fetch new data each time a new sample is selected
    buildCharts(newSample);
    buildMetadata(newSample);
}

// Initialize the dashboard
init();
