// ---------------------- Load CSV ----------------------
Papa.parse("resources.csv", {
    download: true,
    header: true,
    complete: function (results) {
        createDashboard(results.data);
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
    grid.innerHTML = "";

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const dayMap = [
        "sun_times",
        "mon_times",
        "tue_times",
        "wed_times",
        "thur_times",
        "fri_times",
        "sat_times"
    ];
    const todayIndex = now.getDay();

    // ---------------- Dashboard Wrapper ----------------
    const dashboard = document.createElement("div");
    dashboard.id = "dashboard";
    grid.parentElement.insertBefore(dashboard, grid);
    dashboard.appendChild(grid);

    // ---------------- Info Panel ----------------
    const infoPanel = document.createElement("div");
    infoPanel.id = "infoPanel";
    infoPanel.classList.add("collapsed");
    infoPanel.innerHTML = `
        <button id="infoToggle">☰</button>
        <div id="infoContent">
            <em>Click a resource to see details...</em>
        </div>
    `;
    dashboard.appendChild(infoPanel);

    const infoContent = infoPanel.querySelector("#infoContent");
    const toggleBtn = infoPanel.querySelector("#infoToggle");

    toggleBtn.addEventListener("click", () => {
        infoPanel.classList.toggle("collapsed");
    });

    // ---------------- Group by Category ----------------
    const categories = {};
    data.forEach(item => {
        if (!categories[item.category]) categories[item.category] = [];
        categories[item.category].push(item);
    });

    // ---------------- Build UI ----------------
    for (const cat in categories) {
        const openResources = categories[cat].filter(res => {
            const todayValue = res[dayMap[todayIndex]];
            const range = parseTimeRange(todayValue);
            if (!range) return false;

            const [start, end] = range;
            return start < end
                ? currentMinutes >= start && currentMinutes <= end
                : currentMinutes >= start || currentMinutes <= end;
        });

        if (!openResources.length) continue;

        const section = document.createElement("div");
        section.className = "category-section";

        const title = document.createElement("h3");
        title.textContent = cat;
        section.appendChild(title);

        const sectionGrid = document.createElement("div");
        sectionGrid.className = "category-grid";

        // ---------------- Resource Boxes ----------------
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

            let countdownInterval = null;

            box.addEventListener("click", () => {
                infoPanel.classList.remove("collapsed");
                if (countdownInterval) clearInterval(countdownInterval);

                function updatePanel() {
                    const todayValue = res[dayMap[todayIndex]];
                    let countdownHTML = "";

                    const range = parseTimeRange(todayValue);
                    if (range) {
                        let [start, end] = range;
                        const now = new Date();
                        const nowMins = now.getHours() * 60 + now.getMinutes();

                        let minsLeft;
                        if (start < end) {
                            minsLeft = end - nowMins;
                        } else {
                            minsLeft = nowMins <= end
                                ? end - nowMins
                                : (1440 - nowMins) + end;
                        }

                        if (minsLeft > 0 && minsLeft <= 90) {
                            const h = Math.floor(minsLeft / 60);
                            const m = minsLeft % 60;
                            const urgent = minsLeft <= 30 ? "urgent" : "";

                            countdownHTML = `
                                <p class="countdown ${urgent}">
                                    ⏳ Closing in ${h}h ${m}m
                                </p>
                            `;
                        }
                    } else {
                        countdownHTML = `<p><strong>Status:</strong> Closed today</p>`;
                    }

                    infoContent.innerHTML = `
                        <h3>${res.resource}</h3>
                        <p><strong>Category:</strong> ${res.category}</p>
                        ${res.img ? `<img src="${res.img}" alt="${res.resource}">` : ""}
                        ${res.web ? `<p><a href="${res.web}" target="_blank">Visit Website</a></p>` : ""}
                        <p><strong>Today's Hours:</strong> ${todayValue}</p>
                        ${countdownHTML}
                    `;
                }

                updatePanel();
                countdownInterval = setInterval(updatePanel, 60000);
            });

            sectionGrid.appendChild(box);
        });

        section.appendChild(sectionGrid);
        grid.appendChild(section);
    }
}

