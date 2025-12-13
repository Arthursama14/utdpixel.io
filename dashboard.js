// Load the CSV
Papa.parse("resources.csv", {
    download: true,
    header: true,
    complete: function(results) {
        const data = results.data;
        createDashboard(data);
    }
});

function createDashboard(data) {
    const grid = document.getElementById("grid");

    // Group by category
    const categories = {};
    data.forEach(item => {
        if (!categories[item.category]) categories[item.category] = [];
        categories[item.category].push(item);
    });

    // Create a section for each category
    for (const cat in categories) {
        const section = document.createElement("div");
        section.className = "category-section";
        const title = document.createElement("h3");
        title.textContent = cat;
        section.appendChild(title);

        const table = document.createElement("table");
        const headerRow = document.createElement("tr");
        ["Resource", "Open Today?"].forEach(h => {
            const th = document.createElement("th");
            th.textContent = h;
            headerRow.appendChild(th);
        });
        table.appendChild(headerRow);

        // Today’s day index (0=Sunday, 1=Monday…)
        const todayIndex = new Date().getDay();
        const dayColumns = ["sun_times","mon_timesTue_times","tue_times","wed_times","thur_times","fri_times","sat_times"];

        categories[cat].forEach(res => {
            const tr = document.createElement("tr");
            const tdName = document.createElement("td");
            tdName.textContent = res.resource;
            tr.appendChild(tdName);

            const tdOpen = document.createElement("td");
            const dayField = dayColumns[todayIndex] || "";
            const isOpen = res[dayField] && res[dayField] !== "";
            tdOpen.textContent = isOpen ? "Open" : "Closed";
            tr.appendChild(tdOpen);

            table.appendChild(tr);
        });

        section.appendChild(table);
        grid.appendChild(section);
    }
}
