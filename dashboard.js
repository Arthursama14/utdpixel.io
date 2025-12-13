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

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const dayMap = ["sun_times","mon_times","tue_times","wed_times","thur_times","fri_times","sat_times"];
    const todayIndex = now.getDay(); // 0=Sunday

    // Group resources by category
    const categories = {};
    data.forEach(item => {
        if (!categories[item.category]) categories[item.category] = [];
        categories[item.category].push(item);
    });

    for (const cat in categories) {
        // Filter only open resources
        const openResources = categories[cat].filter(res => {
            const todayValue = res[dayMap[todayIndex]];
            const range = parseTimeRange(todayValue);
            if (!range) return false;

            const [start, end] = range;
            return start < end
                ? currentMinutes >= start && currentMinutes <= end
                : currentMinutes >= start || currentMinutes <= end;
        });

        if (openResources.length === 0) continue; // skip category if no open resource

        // Create category section
        const section = document.createElement("div");
        section.className = "category-section";

        const title = document.createElement("h3");
        title.textContent = cat;
        section.appendChild(title);

        const sectionGrid = document.createElement("div");
        sectionGrid.className = "category-grid";

        // Add resource boxes
        openResources.forEach(res => {
            const box = document.createElement("div");
            box.className = "resource-box";
            box.textContent = res.resource;
            box.title = res[dayMap[todayIndex]]; // tooltip shows time
            sectionGrid.appendChild(box);
        });

        section.appendChild(sectionGrid);
        grid.appendChild(section);
    }
}
