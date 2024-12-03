let table; 
let genres = []; 
let years = [];
let data = {}; 
let maxVal; 
let currentLine = 0; 
let animationStep = 0; 

// for the legend
let completedLines = []; 
let lineColors = {};

let width = 1200;
let height = 600;

function preload() {
    table = loadTable("./data/genre_count_per_year.csv", "csv", "header");
}

function setup() {
    canvas = createCanvas(width, height); 
    canvas.parent('graph');
    frameRate(60); 

    years = table.getColumn("release_year").map(Number); // Extract years (x-axis)
    genres = ['Drama', 'Comedy', 'Action', 'International', 'Romance', 'Travel', 'Action & Adventure', 'Horror', 'Documentary', 'Kids']; // only looking at significant genres

    // console.log(years); 

    // get data for each genre and initialize animation steps
    for (let genre of genres) {
        data[genre] = table.getColumn(genre).map(Number);
        lineColors[genre] = color(random(100, 255), random(100, 255), random(100, 255)); // Assign random colors
    }

    maxVal = Math.max(...Object.values(data).flat());

    drawAxes();
}

function draw() {
    background(30); 
    drawAxes();
    drawLegend(); 

    for (let genre of completedLines) {
        drawFullLine(genre, lineColors[genre]);
    }

    if (currentLine < genres.length) {
        animateLine(genres[currentLine], color(random(100, 255), random(100, 255), random(100, 255)));

        if (animationStep >= data[genres[currentLine]].length - 1) {
            animationStep = 0; 
            completedLines.push(genres[currentLine]); 
            currentLine++;
        }
    } else {
        noLoop(); // Stop the animation when all lines are drawn
    }
}

function drawAxes() {
    background(30); 
    stroke(255); 
    line(50, height - 50, width - 50, height - 50); 
    line(50, 50, 50, height - 50); 

    // labels for x-axis
    for (let i = 0; i < years.length; i++) {
        // console.log(i);
        let x = map(i, 0, years.length - 1, 50, width - 50);
        noStroke();
        fill(255);
        textAlign(RIGHT);
        push();
        translate(x, 570); // Move to label position
        rotate(-PI / 4); // Rotate 45 degrees
        if (years[i] % 5 == 0) {
            text(years[i], 0, 0);
        }
        pop();
    }

    // labels for y-axis
    for (let i = 0; i <= 10; i++) {
        let y = map(i, 0, 10, height - 50, 50);
        noStroke();
        fill(255);
        textAlign(RIGHT);
        text((maxVal / 10 * i).toFixed(0), 40, y);
    }
}

function animateLine(genre, lineColor) {
    stroke(lineColor);
    strokeWeight(2);
    noFill();

    beginShape();
    for (let i = 0; i <= animationStep; i++) {
        let x = map(i, 0, years.length - 1, 50, width - 50); // Map x-axis
        let y = map(data[genre][i], 0, maxVal, height - 50, 50); // Map y-axis
        vertex(x, y);
    }
    endShape();

    animationStep++;
}


function drawFullLine(genre, lineColor) {
    stroke(lineColor);
    strokeWeight(2);
    noFill();

    beginShape();
    for (let i = 0; i < data[genre].length; i++) {
        let x = map(i, 0, years.length - 1, 50, width - 50); // Map x-axis
        let y = map(data[genre][i], 0, maxVal, height - 50, 50); // Map y-axis
        vertex(x, y);
    }
    endShape();
}

function drawLegend() {
    fill(255);
    textSize(14);
    textAlign(LEFT);

    let xStart = 60; 
    let yStart = 60; 
    let ySpacing = 20; 

    let i = 0;
    for (let genre of completedLines) {
        fill(lineColors[genre]); // Use the line's color in the legend
        rect(xStart, yStart + i * ySpacing - 10, 10, 10); // Draw color box
        fill(255); // Reset to white for text
        text(genre, xStart + 20, yStart + i * ySpacing); // Draw genre name
        i++;
    }
}
