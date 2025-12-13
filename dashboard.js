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
        return hours * 60 + minutes;
    };

    return [parse(parts[0]), parse(parts[1])];
}

// ---------------------- Create Dashboard ----------------------
function createDashboard(data) {
    const grid = document.getElementById("grid");
    grid.innerHTML = ""; // clear previous content

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const dayMap = ["sun_times","mon_times","tue_times","wed_times","thur_times","fri_times","sat_times"];
    const todayIndex = now.getDay();

    // Info panel container
    const infoPanel = document.createElement("div");
    infoPanel.id = "infoPanel";
    infoPanel.style.padding = "15px";
    infoPanel.style.marginTop = "20px";
    infoPanel.style.background = "rgba(0,0,0,0.5)";
    infoPanel.style.color = "#ffffff";
    infoPanel.style.borderRadius = "10px";
    infoPanel.innerHTML = "<em>Click a resource to see details...</em>";
    grid.parentElement.appendChild(infoPanel);

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

        if (openResources.length === 0) continue; // skip empty categories

        const section = document.createElement("div");
        section.className = "category-section";

        const title = document.createElement("h3");
        title.textContent = cat;
        section.appendChild(title);

        const sectionGrid = document.createElement("div");
        sectionGrid.className = "category-grid";

        // Resource boxes
        openResources.forEach(res => {
            const box = document.createElement("div");
            box.className = "resource-box";

            if (res.img) {
                const img = document.createElement("img");
                img.src = res.img;
                img.alt = res.resource;
                img.className = "resource-img";
                box.appendChild(img);
            } else {
                box.textContent = res.resource;
            }

            // Click event: show info panel
            let countdownInterval = null;

box.addEventListener("click", () => {
    if (countdownInterval) clearInterval(countdownInterval);

    function updatePanel() {
        const todayValue = res[dayMap[todayIndex]];
        let countdownHTML = "";

        const range = parseTimeRange(todayValue);
        if (range) {
            let [start, end] = range;

            const now = new Date();
            let nowMins = now.getHours() * 60 + now.getMinutes();

            let minsLeft;
            if (start < end) {
                minsLeft = end - nowMins;
            } else {
                minsLeft = nowMins <= end
                    ? end - nowMins
                    : (24 * 60 - nowMins) + end;
            }

            if (minsLeft > 0 && minsLeft <= 90) {
                const hours = Math.floor(minsLeft / 60);
                const minutes = minsLeft % 60;
                const urgentClass = minsLeft <= 30 ? "urgent" : "";

                countdownHTML = `
                    <p class="countdown ${urgentClass}">
                        ⏳ Closing in ${hours}h ${minutes}m
                    </p>
                `;
            }
        } else {
            countdownHTML = `<p><strong>Status:</strong> Closed for today</p>`;
        }

        infoPanel.innerHTML = `
            <h3>${res.resource}</h3>
            <p><strong>Category:</strong> ${res.category}</p>
            ${res.img ? `<img src="${res.img}" alt="${res.resource}" style="max-width:200px; margin:10px 0;">` : ""}
            ${res.web ? `<p><a href="${res.web}" target="_blank">Visit Website</a></p>` : ""}
            <p><strong>Today's Hours:</strong> ${todayValue}</p>
            ${countdownHTML}
        `;
    }

    updatePanel();
    countdownInterval = setInterval(updatePanel, 60000); // refresh every minute
});



            sectionGrid.appendChild(box);
        });

        section.appendChild(sectionGrid);
        grid.appendChild(section);
    }
}
