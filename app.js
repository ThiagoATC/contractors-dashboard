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
    const height = Math.max((Number(item.value || 0) / maxValue) * maxHeight, 4);
    bar.style.height = height + "px";

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

    const userCell = `
      <td>
        ${item.SamAccountName || ""}
        ${item.IsLatest ? "<span class='badge-latest'>Latest</span>" : ""}
      </td>
    `;

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

fetch("dashboard-data.json")
  .then(r => r.json())
  .then(data => {
    document.getElementById("generatedAt").textContent = "Generated at: " + (data.generatedAt || "-");

    document.getElementById("totalBase").textContent = Number(data.summary.totalBase || 0).toLocaleString("en-US");
    document.getElementById("totalDeleted").textContent = Number(data.summary.totalDeleted || 0).toLocaleString("en-US");
    document.getElementById("totalLicensesFreed").textContent = Number(data.summary.totalLicensesFreed || 0).toLocaleString("en-US");
    document.getElementById("totalCostSaved").textContent = formatCurrency(data.summary.totalCostSaved || 0);

    applyTrend("trendTotalBase", data.trends?.totalBase);
    applyTrend("trendDeleted", data.trends?.deleted);
    applyTrend("trendLicenses", data.trends?.licenses);
    applyTrend("trendCost", data.trends?.cost);

    createBars("usersChart", data.charts?.usersByPeriod, "users-bar", 190, false);
    createBars("costChart", data.charts?.costByMonth, "cost-bar", 190, true);

    createChips("countryChips", data.dailyBreakdown?.country);
    createChips("licenseTypeChips", data.dailyBreakdown?.licenseType);

    createLicenseMetrics("deletedByLicense", data.deletedByLicenseType);
    createRecentDeletedTable(data.recentDeletedUsers);
  })
  .catch(err => {
    console.error(err);
    alert("Error loading dashboard-data.json");
  });
