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

    data.forEach(res => {
        const todayValue = res[dayMap[todayIndex]];
        const range = parseTimeRange(todayValue);

        // Skip if closed or not in current time
        if (!range) return;

        const [start, end] = range;
        const isOpenNow = start < end
            ? currentMinutes >= start && currentMinutes <= end
            : currentMinutes >= start || currentMinutes <= end;

        if (!isOpenNow) return;

        // Create square box for resource
        const box = document.createElement("div");
        box.className = "resource-box";
        box.textContent = res.resource;
        box.title = todayValue; // hover shows hours
        grid.appendChild(box);
    });
}
