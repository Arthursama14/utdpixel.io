// ---------------------- Load CSV ----------------------
Papa.parse("resources.csv", {
    download: true,
    header: true,
    complete: function(results) {
        const data = results.data;
        createDashboard(data);
    }
});

// ---------------------- Helper: parse time range ----------------------
function parseTimeRange(rangeStr) {
    if (!rangeStr || rangeStr.toLowerCase().includes("closed")) return null;

    const parts = rangeStr.split("-");
    if (parts.length !== 2) return null;

    const parse = t => {
        t = t.trim();
        const [time, meridiem] = t.split(" ");
        let [hours, minutes] = time.split(":").map(Number);
        if (meridiem.toLowerCase() === "pm" && hours !== 12) hours += 12;
        if (meridiem.toLowerCase() === "am" && hours === 12) hours = 0;
        return hours * 60 + minutes; // minutes since midnight
    };

    return [parse(parts[0]), parse(parts[1])];
}

// ---------------------- Create Dashboard ----------------------
function createDashboard(data) {
    const grid = document.getElementById("grid");
    grid.innerHTML = ""; // clear any previous content

    // Group by category
    const categories = {};
    data.forEach(item => {
        if (!categories[item.category]) categories[item.category] = [];
        categories[item.category].push(item);
    });

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const dayMap = ["sun_times","mon_times","tue_times","wed_times","thur_times","fri_times","sat_times"];
    const todayIndex = now.getDay(); // 0=Sunday

    for (const cat in categories) {
        const section = document.createElement("div");
        section.className = "category-section";

        const title = document.createElement("h3");
        title.textContent = cat;
        section.appendChild(title);

        const table = document.createElement("table");

        const headerRow = document.createElement("tr");
        ["Resource", "Open Now?"].forEach(h => {
            const th = document.createElement("th");
            th.textContent = h;
            headerRow.appendChild(th);
        });
        table.appendChild(headerRow);

        // Iterate over resources in this category
        categories[cat].forEach(res => {
            const todayValue = res[dayMap[todayIndex]];
            const range = parseTimeRange(todayValue);

            // Skip if closed or not in time range
            if (!range) return;

            const [start, end] = range;

            // Handle ranges crossing midnight
            const isOpenNow = start < end
                ? currentMinutes >= start && currentMinutes <= end
                : currentMinutes >= start || currentMinutes <= end;

            if (!isOpenNow) return;

            // Create table row
            const tr = document.createElement("tr");

            const tdName = document.createElement("td");
            tdName.textContent = res.resource;
            tr.appendChild(tdName);

            const tdOpen = document.createElement("td");
            tdOpen.textContent = "Open";
            tdOpen.style.color = "limegreen";
            tdOpen.title = todayValue; // tooltip shows exact hours
            tr.appendChild(tdOpen);

            table.appendChild(tr);
        });

        section.appendChild(table);
        grid.appendChild(section);
    }
}
