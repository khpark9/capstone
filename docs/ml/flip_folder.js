document.addEventListener('DOMContentLoaded', () => {
    const calendar = document.getElementById('calendar');
    const genreDisplay = document.getElementById('genre-display');
    const selectedYear = document.getElementById('selected-year');
    const genreList = document.getElementById('genre-list');

    // Gradient colors (in RGB format)
    const colors = [
        [118, 115, 217], // Purple (#7673d9)
        [242, 209, 201], // Salmon (#F2D1C9)
        [242, 242, 242], // White (#f2f2f2)
        [105, 191, 183]  // Green (#69bfb7)
    ];

    // Function to interpolate between two colors
    function interpolateColor(color1, color2, factor) {
        return color1.map((c, i) => Math.round(c + (color2[i] - c) * factor));
    }

    // Function to generate the gradient color for a block
    function getGradientColor(index, total) {
        const section = 1 / (colors.length - 1); // Divide into gradient sections
        const factor = (index / total) % section / section; // Factor within section
        const startColor = Math.floor(index / (total / (colors.length - 1)));
        const endColor = Math.min(startColor + 1, colors.length - 1);

        const color = interpolateColor(colors[startColor], colors[endColor], factor);
        return `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
    }

    // Parse the CSV file using Papa Parse
    Papa.parse('./data/top_genre_per_year.csv', {
        download: true,
        header: true,
        complete: function (results) {
            const data = results.data; // Parsed data from the CSV
            const years = Object.keys(data[0]).slice(1).filter(year => year.trim() !== '');
            const totalYears = years.length;

            // Create a cell for each year
            years.forEach((year, index) => {
                const yearCell = document.createElement('div');
                yearCell.className = 'year';
                yearCell.textContent = year;
                yearCell.style.backgroundColor = getGradientColor(index, totalYears); // Assign gradient color
                calendar.appendChild(yearCell);

                yearCell.addEventListener('click', () => {
                    // Update the genre display for the selected year
                    selectedYear.textContent = `Top Genres for ${year}`;
                    genreList.innerHTML = ''; // Clear previous genres
                
                    // Collect and sort genres by count for the selected year
                    const genresForYear = [];
                
                    data.forEach(row => {
                        const genre = row['']; // First column (Genre name)
                        const count = row[year]; // Count for the selected year
                
                        if (count) {
                            genresForYear.push({ genre, count: Number(count) });
                        }
                    });
                
                    // Sort genres by count (greatest to least)
                    genresForYear.sort((a, b) => b.count - a.count);
                
                    // Append sorted genres to the genre list
                    genresForYear.forEach(item => {
                        const genreText = document.createElement('p');
                        genreText.textContent = `${item.genre}: ${item.count} entries`;
                        genreList.appendChild(genreText);
                    });
                
                    // Show the genre display
                    genreDisplay.classList.remove('hidden');
                });                
            });
        }
    });
});
