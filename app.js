function formatCurrency(value) {
  const n = Number(value || 0);
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

function toArray(value) {
  if (Array.isArray(value)) return value;
  if (value == null) return [];
  return [value];
}

function applyTrend(elementId, trendObj) {
  const el = document.getElementById(elementId);
  if (!el || !trendObj) return;
  el.textContent = trendObj.text || "—";
  el.classList.remove("trend-up", "trend-down", "trend-neutral");
  if (trendObj.type === "up") el.classList.add("trend-up");
  else if (trendObj.type === "down") el.classList.add("trend-down");
  else el.classList.add("trend-neutral");
}

function createBars(containerId, items, className, maxHeight, isCurrency) {
  const container = document.getElementById(containerId);
  const safeItems = toArray(items);
  container.innerHTML = "";

  if (!safeItems.length) {
    container.innerHTML = "<div style='color:#64748b;'>No data</div>";
    return;
  }

  const maxValue = Math.max(...safeItems.map(x => Number(x.value || 0)), 1);

  safeItems.forEach(item => {
    const col = document.createElement("div");
    col.className = "chart-col";

    const val = document.createElement("div");
    val.className = "chart-value";
    val.textContent = isCurrency ? formatCurrency(item.value) : Number(item.value || 0).toLocaleString("en-US");

    const bar = document.createElement("div");
    bar.className = "chart-bar " + className;
    bar.style.height = Math.max((Number(item.value || 0) / maxValue) * maxHeight, 4) + "px";

    const label = document.createElement("div");
    label.className = "chart-label";
    label.textContent = item.label || "";

    col.appendChild(val);
    col.appendChild(bar);
    col.appendChild(label);
    container.appendChild(col);
  });
}

function createChips(containerId, items) {
  const container = document.getElementById(containerId);
  const safeItems = toArray(items);
  container.innerHTML = "";

  if (!safeItems.length) {
    container.innerHTML = "<div style='color:#64748b;'>No data</div>";
    return;
  }

  safeItems.forEach(item => {
    const chip = document.createElement("div");
    chip.className = "chip";
    chip.textContent = (item.label || "") + " · " + (item.value || 0);
    container.appendChild(chip);
  });
}

function createLicenseMetrics(containerId, items) {
  const container = document.getElementById(containerId);
  const safeItems = toArray(items);
  container.innerHTML = "";

  if (!safeItems.length) {
    container.innerHTML = "<div style='color:#64748b;'>No data</div>";
    return;
  }

  const maxValue = Math.max(...safeItems.map(x => Number(x.value || 0)), 1);

  safeItems.forEach(item => {
    const row = document.createElement("div");
    row.className = "metric-row";

    const head = document.createElement("div");
    head.className = "metric-head";

    const name = document.createElement("div");
    name.className = "metric-name";
    name.textContent = item.label || "";

    const value = document.createElement("div");
    value.className = "metric-value";
    value.textContent = item.value || 0;

    head.appendChild(name);
    head.appendChild(value);

    const track = document.createElement("div");
    track.className = "metric-track";

    const fill = document.createElement("div");
    fill.className = "metric-fill";
    fill.style.width = Math.max((Number(item.value || 0) / maxValue) * 100, 4) + "%";

    track.appendChild(fill);
    row.appendChild(head);
    row.appendChild(track);

    container.appendChild(row);
  });
}

function createLicensesByRegion(containerId, items) {
  const container = document.getElementById(containerId);
  const safeItems = toArray(items);
  container.innerHTML = "";

  if (!safeItems.length) {
    container.innerHTML = "<div style='color:#64748b;'>No data</div>";
    return;
  }

  safeItems.forEach(regionItem => {
    const block = document.createElement("div");
    block.className = "region-block";

    const title = document.createElement("div");
    title.className = "region-title";
    title.textContent = regionItem.region || "Other";
    block.appendChild(title);

    const wrap = document.createElement("div");
    wrap.className = "region-chip-wrap";

    toArray(regionItem.countries).forEach(country => {
      const chip = document.createElement("div");
      chip.className = "region-chip";

      if (country.countryCode) {
        const img = document.createElement("img");
        img.className = "flag-icon";
        img.src = `https://hatscripts.github.io/circle-flags/flags/${country.countryCode}.svg`;
        img.alt = country.country || "";
        img.loading = "lazy";
        chip.appendChild(img);
      }

      const text = document.createElement("span");
      text.innerHTML = `${country.country || "Unknown"} · <strong>${Number(country.licenses || 0).toLocaleString("en-US")}</strong> <span class="region-cost">(${formatCurrency(country.cost || 0)})</span>`;
      chip.appendChild(text);

      wrap.appendChild(chip);
    });

    block.appendChild(wrap);
    container.appendChild(block);
  });
}

function createRecentDeletedTable(items) {
  const tbody = document.getElementById("recentDeletedTable");
  const safeItems = toArray(items);
  tbody.innerHTML = "";

  if (!safeItems.length) {
    tbody.innerHTML = "<tr><td colspan='6'>No data</td></tr>";
    return;
  }

  safeItems.forEach(item => {
    const tr = document.createElement("tr");
    const userCell = `<td>${item.SamAccountName || ""}${item.IsLatest ? "<span class='badge-latest'>Latest</span>" : ""}</td>`;

    tr.innerHTML = `
      ${userCell}
      <td>${item.DisplayName || ""}</td>
      <td>${item.DeletionDate || ""}</td>
      <td>${item.Country || ""}</td>
      <td>${item.License || ""}</td>
      <td>${formatCurrency(item.LicensesTotalCost || 0)}</td>
    `;

    tbody.appendChild(tr);
  });
}

function normalizeCountryKey(value) {
  return String(value || "").trim().toUpperCase();
}

const countryCoordinates = {
  "US": { x: 18, y: 30 }, "USA": { x: 18, y: 30 }, "UNITED STATES": { x: 18, y: 30 },
  "BR": { x: 26, y: 67 }, "BRAZIL": { x: 26, y: 67 },
  "IN": { x: 69, y: 43 }, "INDIA": { x: 69, y: 43 },
  "MX": { x: 14, y: 40 }, "MEXICO": { x: 14, y: 40 },
  "CA": { x: 17, y: 20 }, "CANADA": { x: 17, y: 20 },
  "AR": { x: 28, y: 84 }, "ARGENTINA": { x: 28, y: 84 },
  "CO": { x: 21, y: 52 }, "COLOMBIA": { x: 21, y: 52 },
  "CL": { x: 24, y: 80 }, "CHILE": { x: 24, y: 80 },
  "PE": { x: 22, y: 61 }, "PERU": { x: 22, y: 61 },
  "GB": { x: 47, y: 24 }, "UK": { x: 47, y: 24 }, "UNITED KINGDOM": { x: 47, y: 24 },
  "DE": { x: 50, y: 27 }, "GERMANY": { x: 50, y: 27 },
  "FR": { x: 48, y: 30 }, "FRANCE": { x: 48, y: 30 },
  "ES": { x: 46, y: 34 }, "SPAIN": { x: 46, y: 34 },
  "IT": { x: 51, y: 33 }, "ITALY": { x: 51, y: 33 },
  "NL": { x: 49, y: 26 }, "NETHERLANDS": { x: 49, y: 26 },
  "PL": { x: 53, y: 27 }, "POLAND": { x: 53, y: 27 },
  "SE": { x: 53, y: 19 }, "SWEDEN": { x: 53, y: 19 },
  "NO": { x: 51, y: 16 }, "NORWAY": { x: 51, y: 16 },
  "FI": { x: 56, y: 17 }, "FINLAND": { x: 56, y: 17 },
  "ZA": { x: 55, y: 78 }, "SOUTH AFRICA": { x: 55, y: 78 },
  "NG": { x: 48, y: 52 }, "NIGERIA": { x: 48, y: 52 },
  "AE": { x: 61, y: 40 }, "UAE": { x: 61, y: 40 }, "UNITED ARAB EMIRATES": { x: 61, y: 40 },
  "SA": { x: 58, y: 42 }, "SAUDI ARABIA": { x: 58, y: 42 },
  "IL": { x: 57, y: 36 }, "ISRAEL": { x: 57, y: 36 },
  "TR": { x: 56, y: 32 }, "TURKEY": { x: 56, y: 32 },
  "CN": { x: 76, y: 33 }, "CHINA": { x: 76, y: 33 },
  "JP": { x: 84, y: 33 }, "JAPAN": { x: 84, y: 33 },
  "KR": { x: 82, y: 31 }, "SOUTH KOREA": { x: 82, y: 31 },
  "SG": { x: 74, y: 55 }, "SINGAPORE": { x: 74, y: 55 },
  "MY": { x: 73, y: 57 }, "MALAYSIA": { x: 73, y: 57 },
  "ID": { x: 78, y: 60 }, "INDONESIA": { x: 78, y: 60 },
  "TH": { x: 72, y: 52 }, "THAILAND": { x: 72, y: 52 },
  "VN": { x: 74, y: 49 }, "VIETNAM": { x: 74, y: 49 },
  "PH": { x: 79, y: 50 }, "PHILIPPINES": { x: 79, y: 50 },
  "AU": { x: 84, y: 76 }, "AUSTRALIA": { x: 84, y: 76 },
  "NZ": { x: 93, y: 84 }, "NEW ZEALAND": { x: 93, y: 84 }
};

function createCountryMap(containerId, items) {
  const container = document.getElementById(containerId);
  const safeItems = toArray(items);
  if (!container) return;

  container.querySelectorAll(".map-marker").forEach(el => el.remove());
  if (!safeItems.length) return;

  safeItems.forEach(item => {
    const key = normalizeCountryKey(item.label);
    const point = countryCoordinates[key];
    if (!point) return;

    const marker = document.createElement("div");
    marker.className = "map-marker";
    marker.style.left = point.x + "%";
    marker.style.top = point.y + "%";
    marker.setAttribute("data-label", `${item.label} · ${item.value || 0}`);
    marker.title = `${item.label}: ${item.value || 0}`;
    container.appendChild(marker);
  });
}

fetch("dashboard-data.json")
  .then(r => r.json())
  .then(data => {
    document.getElementById("generatedAt").textContent = "Generated at: " + (data.generatedAt || "-");
    document.getElementById("totalBase").textContent = Number(data.summary.totalBase || 0).toLocaleString("en-US");
    document.getElementById("totalDeleted").textContent = Number(data.summary.totalDeleted || 0).toLocaleString("en-US");
    document.getElementById("totalLicensesFreed").textContent = Number(data.summary.totalLicensesFreed || 0).toLocaleString("en-US");
    document.getElementById("totalCostSaved").textContent = formatCurrency(data.summary.totalCostSaved || 0);
    document.getElementById("cleanupBaseline").textContent = "Cleanup baseline: " + Number(data.summary.cleanupBaseline || 0).toLocaleString("en-US");

    applyTrend("trendTotalBase", data.trends?.totalBase);
    applyTrend("trendDeleted", data.trends?.deleted);
    applyTrend("trendLicenses", data.trends?.licenses);
    applyTrend("trendCost", data.trends?.cost);

    createBars("usersChart", data.charts?.usersByPeriod, "users-bar", 190, false);
    createBars("costChart", data.charts?.costByMonth, "cost-bar", 190, true);
    createChips("countryChips", data.dailyBreakdown?.country);
    createChips("licenseTypeChips", data.dailyBreakdown?.licenseType);
    createLicenseMetrics("deletedByLicense", data.deletedByLicenseType);
    createCountryMap("countryMap", data.dailyBreakdown?.country);
    createLicensesByRegion("licensesByRegion", data.licensesByRegion);
    createRecentDeletedTable(data.recentDeletedUsers);
  })
  .catch(err => {
    console.error(err);
    alert("Error loading dashboard-data.json");
  });
