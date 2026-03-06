(() => {
  const BLOCK_RE = /^:::\s*([a-z0-9-]+)\s*$/i;
  const CLOSE_RE = /^:::\s*$/;
  const DAY_MS = 24 * 60 * 60 * 1000;
  const WEEK_MS = 7 * DAY_MS;
  const ISO_WEEK_ANCHOR_DAY = -3; // 1969-12-29 (Monday of 1970-W01)
  const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  function parseScalar(raw) {
    const value = String(raw ?? "").trim().replace(/\s*:::\s*$/, "").trim();
    if (!value) return "";
    const quoted = value.match(/^"(.*)"$/) || value.match(/^'(.*)'$/);
    return quoted ? quoted[1] : value;
  }

  function parseLinesToObject(lines) {
    const out = {};
    let pendingKey = null;
    let pendingObj = null;

    for (const rawLine of lines) {
      const line = String(rawLine ?? "");
      const trimmed = line.trim();
      if (!trimmed || trimmed === ":::" || trimmed.startsWith("#")) continue;

      const kv = line.match(/^([a-z0-9_-]+)\s*:\s*(.*)$/i);
      if (kv) {
        const key = kv[1].toLowerCase();
        const value = kv[2];
        if (value) {
          out[key] = parseScalar(value);
          pendingKey = null;
          pendingObj = null;
        } else {
          pendingKey = key;
          pendingObj = null;
          if (!Array.isArray(out[key])) out[key] = [];
        }
        continue;
      }

      const item = line.match(/^ {2}-\s+(.+)$/);
      if (item && pendingKey) {
        const list = Array.isArray(out[pendingKey]) ? out[pendingKey] : [];
        out[pendingKey] = list;
        const objectKV = item[1].match(/^([a-z0-9_-]+)\s*:\s*(.+)$/i);
        let pushed = null;
        if (objectKV) {
          pendingObj = { [objectKV[1].toLowerCase()]: parseScalar(objectKV[2]) };
          pushed = pendingObj;
        } else {
          pendingObj = null;
          pushed = parseScalar(item[1]);
        }
        list.push(pushed);
        if (pendingKey === "tracks" || pendingKey === "milestones") {
          out.__rowOrder = Array.isArray(out.__rowOrder) ? out.__rowOrder : [];
          out.__rowOrder.push({ kind: pendingKey.slice(0, -1), index: list.length - 1 });
        }
        continue;
      }

      const cont = line.match(/^ {4}([a-z0-9_-]+)\s*:\s*(.+)$/i);
      if (cont && pendingObj) {
        pendingObj[cont[1].toLowerCase()] = parseScalar(cont[2]);
      }
    }

    return out;
  }

  function parseFence(text) {
    const raw = String(text ?? "");
    const trimmed = raw.trim();
    if (!trimmed.startsWith(":::")) return null;
    const lines = trimmed.split(/\r?\n/);
    if (lines.length < 2) return null;
    const head = lines[0].trim();
    const tail = lines[lines.length - 1].trim();
    const m = head.match(BLOCK_RE);
    if (!m || !CLOSE_RE.test(tail)) return null;
    const type = m[1].toLowerCase();
    if (type !== "gantt") return null;
    return { type, data: parseLinesToObject(lines.slice(1, -1)) };
  }

  function parseListItemObject(li) {
    const parts = [];
    for (const child of li.querySelectorAll(":scope > p")) {
      const text = (child.textContent || "").trim();
      if (text) parts.push(text);
    }
    const raw = parts.length ? parts.join("\n") : (li.textContent || "").trim();
    const lines = raw
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && line !== ":::");
    const obj = {};
    for (const line of lines) {
      const kv = line.match(/^([a-z0-9_-]+)\s*:\s*(.+)$/i);
      if (!kv) continue;
      obj[kv[1].toLowerCase()] = parseScalar(kv[2]);
    }
    if (Object.keys(obj).length > 0) return obj;
    return { label: parseScalar(raw) };
  }

  function parseGanttNodes(firstLines, between, endNode) {
    const out = parseLinesToObject(firstLines);
    let pendingKey = null;

    for (const [key, value] of Object.entries(out)) {
      if (Array.isArray(value)) pendingKey = key;
    }

    const nodes = [...between, endNode];
    for (const node of nodes) {
      const tag = String(node.tagName || "").toUpperCase();
      if (tag === "P") {
        const lines = (node.textContent || "").split(/\r?\n/);
        for (const rawLine of lines) {
          const line = rawLine.trim();
          if (!line || line === ":::" || line.startsWith("#")) continue;
          const kv = line.match(/^([a-z0-9_-]+)\s*:\s*(.*)$/i);
          if (!kv) continue;
          const key = kv[1].toLowerCase();
          const value = kv[2];
          if (value) {
            out[key] = parseScalar(value);
            pendingKey = null;
          } else {
            pendingKey = key;
            if (!Array.isArray(out[key])) out[key] = [];
          }
        }
        continue;
      }

      if ((tag === "UL" || tag === "OL") && pendingKey) {
        const items = [];
        for (const li of node.querySelectorAll(":scope > li")) {
          items.push(parseListItemObject(li));
          if (pendingKey === "tracks" || pendingKey === "milestones") {
            out.__rowOrder = Array.isArray(out.__rowOrder) ? out.__rowOrder : [];
            out.__rowOrder.push({ kind: pendingKey.slice(0, -1), index: items.length - 1 });
          }
        }
        const existing = Array.isArray(out[pendingKey]) ? out[pendingKey] : [];
        const base = existing.length;
        out[pendingKey] = existing.concat(items);
        if (base > 0 && Array.isArray(out.__rowOrder)) {
          for (let i = out.__rowOrder.length - items.length; i < out.__rowOrder.length; i++) {
            if (out.__rowOrder[i] && typeof out.__rowOrder[i].index === "number") {
              out.__rowOrder[i].index += base;
            }
          }
        }
        pendingKey = null;
      }
    }

    return out;
  }

  function isoWeekMondayUtcMs(year, week) {
    const jan4 = new Date(Date.UTC(year, 0, 4));
    const jan4Weekday = (jan4.getUTCDay() + 6) % 7;
    const weekOneMonday = jan4.getTime() - jan4Weekday * DAY_MS;
    return weekOneMonday + (week - 1) * WEEK_MS;
  }

  function isoWeekFromDayOrdinal(dayOrdinal) {
    const date = new Date(dayOrdinal * DAY_MS);
    const day = (date.getUTCDay() + 6) % 7;
    const thursday = new Date(date.getTime() + (3 - day) * DAY_MS);
    const year = thursday.getUTCFullYear();
    const firstThursday = new Date(Date.UTC(year, 0, 4));
    const firstThursdayDay = (firstThursday.getUTCDay() + 6) % 7;
    const firstThursdayOrdinal = Math.floor(firstThursday.getTime() / DAY_MS) + (3 - firstThursdayDay);
    const week = Math.floor((Math.floor(thursday.getTime() / DAY_MS) - firstThursdayOrdinal) / 7) + 1;
    return { year, week };
  }

  function isoWeeksInYear(year) {
    const dec28 = new Date(Date.UTC(year, 11, 28));
    const info = isoWeekFromDayOrdinal(Math.floor(dec28.getTime() / DAY_MS));
    return info.week;
  }

  function parseWeekOrdinal(value) {
    const match = String(value || "").trim().match(/^(\d{4})-W(\d{2})$/i);
    if (!match) return null;
    const year = Number.parseInt(match[1], 10);
    const week = Number.parseInt(match[2], 10);
    if (week < 1 || week > isoWeeksInYear(year)) return null;
    const mondayDayOrdinal = Math.floor(isoWeekMondayUtcMs(year, week) / DAY_MS);
    return Math.floor((mondayDayOrdinal - ISO_WEEK_ANCHOR_DAY) / 7);
  }

  function parseMonthOrdinal(value) {
    const match = String(value || "").trim().match(/^(\d{4})-(\d{2})$/);
    if (!match) return null;
    const year = Number.parseInt(match[1], 10);
    const month = Number.parseInt(match[2], 10);
    if (month < 1 || month > 12) return null;
    return year * 12 + (month - 1);
  }

  function parseUnitOrdinal(value, unit) {
    if (unit === "week") return parseWeekOrdinal(value);
    if (unit === "month") return parseMonthOrdinal(value);
    return null;
  }

  function weekLabelFromOrdinal(ordinal) {
    const mondayDayOrdinal = ISO_WEEK_ANCHOR_DAY + ordinal * 7;
    const info = isoWeekFromDayOrdinal(mondayDayOrdinal);
    return { year: info.year, week: info.week, label: `W${String(info.week).padStart(2, "0")}` };
  }

  function monthLabelFromOrdinal(ordinal) {
    const year = Math.floor(ordinal / 12);
    const month = (ordinal % 12) + 1;
    return { year, month, label: MONTH_NAMES[month - 1] || `M${month}` };
  }

  function weekAxisContextLabel(startInfo, endInfo) {
    if (!startInfo || !endInfo) return "";
    const startWeek = `W${String(startInfo.week).padStart(2, "0")}`;
    const endWeek = `W${String(endInfo.week).padStart(2, "0")}`;
    if (startInfo.year === endInfo.year) {
      return `ISO Weeks ${startWeek}-${endWeek} (${startInfo.year})`;
    }
    return `ISO Weeks ${startWeek} '${String(startInfo.year).slice(-2)}-${endWeek} '${String(
      endInfo.year,
    ).slice(-2)}`;
  }

  function weekLabelStepForUnits(totalUnits) {
    if (totalUnits > 24) return 4;
    if (totalUnits > 16) return 2;
    return 1;
  }

  function buildAxisCellLabel(unit, info, prev, index, totalUnits) {
    const isEdge = index === 0 || index === totalUnits - 1;
    if (unit === "week") {
      const step = weekLabelStepForUnits(totalUnits);
      const show = index % step === 0 || isEdge;
      if (!show) return "";
      const yearChanged = !prev || prev.year !== info.year;
      const weekNumber = String(info.week).padStart(2, "0");
      const base = `W${weekNumber}`;
      const suffix = isEdge || yearChanged ? ` '${String(info.year).slice(-2)}` : "";
      return `${base}${suffix}`;
    }

    const yearChanged = !prev || prev.year !== info.year;
    const showYear = info.month === 1 || yearChanged;
    const suffix = showYear ? ` '${String(info.year).slice(-2)}` : "";
    return `${info.label}${suffix}`;
  }

  function toPositiveInt(value, fallback) {
    const parsed = Number.parseInt(String(value ?? ""), 10);
    if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
    return parsed;
  }

  function toDepth(value, fallback) {
    const parsed = Number.parseInt(String(value ?? ""), 10);
    if (!Number.isFinite(parsed) || parsed < 1) return fallback;
    return parsed;
  }

  function clampRange(start, end, axisStart, axisEnd) {
    const clampedStart = Math.max(start, axisStart);
    const clampedEnd = Math.min(end, axisEnd);
    if (clampedEnd < clampedStart) return null;
    return { start: clampedStart, end: clampedEnd };
  }

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null && text !== "") node.textContent = String(text);
    return node;
  }

  function renderGantt(rawData) {
    const data = rawData && typeof rawData === "object" ? rawData : {};
    const unit = String(data["time-unit"] || "week").trim().toLowerCase();
    const axisStart = parseUnitOrdinal(data["time-start"], unit);
    const axisEnd = parseUnitOrdinal(data["time-end"], unit);
    if (axisStart == null || axisEnd == null || axisEnd < axisStart) return null;

    const totalUnits = axisEnd - axisStart + 1;
    const maxDepth = toPositiveInt(data["max-depth"], Number.MAX_SAFE_INTEGER);
    const maxTracks = toPositiveInt(data["max-tracks"], Number.MAX_SAFE_INTEGER);
    const todayOrdinal = parseUnitOrdinal(data.today, unit);

    const tracks = Array.isArray(data.tracks) ? data.tracks : [];
    const milestones = Array.isArray(data.milestones) ? data.milestones : [];
    const trackRows = [];
    for (const track of tracks) {
      const item = track && typeof track === "object" ? track : {};
      trackRows.push({
        kind: "track",
        label: String(item.label || "").trim(),
        depth: toDepth(item.depth, 1),
        start: parseUnitOrdinal(item.start, unit),
        end: parseUnitOrdinal(item.end, unit),
        status: String(item.status || "planned").trim().toLowerCase(),
      });
    }
    const milestoneRows = [];
    for (const milestone of milestones) {
      const item = milestone && typeof milestone === "object" ? milestone : {};
      milestoneRows.push({
        kind: "milestone",
        label: String(item.label || "").trim(),
        depth: toDepth(item.depth, 1),
        date: parseUnitOrdinal(item.date, unit),
      });
    }
    const rows = [];
    const rowOrder = Array.isArray(data.__rowOrder) ? data.__rowOrder : [];
    if (rowOrder.length > 0) {
      for (const entry of rowOrder) {
        if (!entry || typeof entry !== "object") continue;
        if (entry.kind === "track" && Number.isInteger(entry.index) && trackRows[entry.index]) {
          rows.push(trackRows[entry.index]);
          continue;
        }
        if (
          entry.kind === "milestone" &&
          Number.isInteger(entry.index) &&
          milestoneRows[entry.index]
        ) {
          rows.push(milestoneRows[entry.index]);
        }
      }
    } else {
      rows.push(...trackRows, ...milestoneRows);
    }

    const visibleRows = rows.filter((row) => row.depth <= maxDepth);
    const hiddenCount = visibleRows.length > maxTracks ? visibleRows.length - maxTracks : 0;
    const renderedRows = hiddenCount > 0 ? visibleRows.slice(0, maxTracks) : visibleRows;

    const root = el("div", "kitfly-visual kitfly-planning-gantt");
    root.setAttribute("data-kitfly-visual", "gantt");
    root.style.setProperty("--kitfly-gantt-units", String(totalUnits));
    root.classList.add(unit === "week" ? "is-week" : "is-month");

    const weekLabelStep = unit === "week" ? weekLabelStepForUnits(totalUnits) : 1;
    const weekCompact = unit === "week" && weekLabelStep > 1;
    if (weekCompact) root.classList.add("is-week-compact");
    if (unit === "week" && weekLabelStep > 2) root.classList.add("is-week-ultra-compact");
    if (unit === "week") root.classList.add("has-week-context");

    const label = String(data.label || "").trim();
    if (label) {
      root.appendChild(el("div", "kitfly-gantt-title", label));
    }

    if (unit === "week") {
      const axisContextRow = el("div", "kitfly-gantt-row kitfly-gantt-axis-context-row");
      axisContextRow.appendChild(el("div", "kitfly-gantt-label kitfly-gantt-axis-label", ""));
      const context = el("div", "kitfly-gantt-axis-context");
      const startInfo = weekLabelFromOrdinal(axisStart);
      const endInfo = weekLabelFromOrdinal(axisEnd);
      context.textContent = weekAxisContextLabel(startInfo, endInfo);
      axisContextRow.appendChild(context);
      root.appendChild(axisContextRow);
    }

    const axisRow = el("div", "kitfly-gantt-row kitfly-gantt-axis-row");
    axisRow.appendChild(el("div", "kitfly-gantt-label kitfly-gantt-axis-label", ""));
    const axis = el("div", "kitfly-gantt-axis");
    for (let i = 0; i < totalUnits; i++) {
      const ordinal = axisStart + i;
      const cell = el("div", "kitfly-gantt-axis-cell");
      if (i === 0 || i === totalUnits - 1) cell.classList.add("is-edge");
      const info = unit === "week" ? weekLabelFromOrdinal(ordinal) : monthLabelFromOrdinal(ordinal);
      const prev = i > 0 ? (unit === "week" ? weekLabelFromOrdinal(ordinal - 1) : monthLabelFromOrdinal(ordinal - 1)) : null;
      const text = buildAxisCellLabel(unit, info, prev, i, totalUnits);
      if (text) {
        cell.textContent = text;
        cell.classList.add("is-labeled");
      }
      axis.appendChild(cell);
    }
    if (todayOrdinal != null && todayOrdinal >= axisStart && todayOrdinal <= axisEnd) {
      const today = el("div", "kitfly-gantt-today");
      const left = ((todayOrdinal - axisStart + 0.5) / totalUnits) * 100;
      today.style.left = `${left}%`;
      axis.appendChild(today);
    }
    axisRow.appendChild(axis);
    root.appendChild(axisRow);

    for (const row of renderedRows) {
      const rowEl = el("div", "kitfly-gantt-row");
      const labelEl = el("div", "kitfly-gantt-label", row.label || "");
      labelEl.style.setProperty("--kitfly-gantt-depth", String(row.depth || 1));
      labelEl.classList.add(`depth-${Math.min(Math.max(row.depth || 1, 1), 3)}`);
      rowEl.appendChild(labelEl);

      const chartEl = el("div", "kitfly-gantt-chart");
      chartEl.style.setProperty("--kitfly-gantt-units", String(totalUnits));

      if (todayOrdinal != null && todayOrdinal >= axisStart && todayOrdinal <= axisEnd) {
        const today = el("div", "kitfly-gantt-today");
        const left = ((todayOrdinal - axisStart + 0.5) / totalUnits) * 100;
        today.style.left = `${left}%`;
        chartEl.appendChild(today);
      }

      if (row.kind === "track" && row.start != null && row.end != null) {
        const clipped = clampRange(row.start, row.end, axisStart, axisEnd);
        if (clipped) {
          const bar = el("div", "kitfly-gantt-bar");
          const status = ["planned", "active", "complete", "blocked"].includes(row.status)
            ? row.status
            : "planned";
          bar.classList.add(`is-${status}`);
          bar.classList.add(`depth-${Math.min(Math.max(row.depth || 1, 1), 3)}`);
          const left = ((clipped.start - axisStart) / totalUnits) * 100;
          const width = ((clipped.end - clipped.start + 1) / totalUnits) * 100;
          bar.style.left = `${left}%`;
          bar.style.width = `${width}%`;
          chartEl.appendChild(bar);
        }
      }

      if (row.kind === "milestone" && row.date != null && row.date >= axisStart && row.date <= axisEnd) {
        const marker = el("div", "kitfly-gantt-milestone");
        marker.classList.add(`depth-${Math.min(Math.max(row.depth || 1, 1), 3)}`);
        const left = ((row.date - axisStart + 0.5) / totalUnits) * 100;
        marker.style.left = `${left}%`;
        chartEl.appendChild(marker);
      }

      rowEl.appendChild(chartEl);
      root.appendChild(rowEl);
    }

    if (hiddenCount > 0) {
      const moreRow = el("div", "kitfly-gantt-row kitfly-gantt-overflow-row");
      moreRow.appendChild(el("div", "kitfly-gantt-label", `+${hiddenCount} more`));
      moreRow.appendChild(el("div", "kitfly-gantt-chart"));
      root.appendChild(moreRow);
    }

    return root;
  }

  function tryReplaceSingleNode(node) {
    const parsed = parseFence(node.textContent || "");
    if (!parsed || parsed.type !== "gantt") return false;
    const rendered = renderGantt(parsed.data);
    if (!rendered) return false;
    node.replaceWith(rendered);
    return true;
  }

  function tryReplaceFragmentedFence(start) {
    const startText = String(start.textContent || "");
    const lines = startText.split(/\r?\n/);
    const firstLine = (lines[0] || "").trim();
    const open = firstLine.match(BLOCK_RE);
    if (!open || open[1].toLowerCase() !== "gantt") return false;

    const between = [];
    let endNode = null;
    let cur = start.nextElementSibling;
    while (cur) {
      const hasClose = String(cur.textContent || "")
        .split(/\r?\n/)
        .map((line) => line.trim())
        .some((line) => line === ":::");
      if (hasClose) {
        endNode = cur;
        break;
      }
      between.push(cur);
      cur = cur.nextElementSibling;
    }
    if (!endNode) return false;

    const data = parseGanttNodes(lines.slice(1), between, endNode);
    const rendered = renderGantt(data);
    if (!rendered) return false;

    start.parentNode.insertBefore(rendered, start);
    const toRemove = [start, ...between, endNode];
    for (const node of toRemove) node.remove();
    return true;
  }

  function apply(root) {
    const containers = root.querySelectorAll(".slide, .content");
    for (const container of containers) {
      for (const node of container.querySelectorAll("p, pre, code")) {
        if (node.closest(".kitfly-planning-gantt")) continue;
        tryReplaceSingleNode(node);
      }

      let changed = true;
      while (changed) {
        changed = false;
        const paragraphs = container.querySelectorAll("p");
        for (const p of paragraphs) {
          if (p.closest(".kitfly-planning-gantt")) continue;
          const text = (p.textContent || "").trim();
          if (!text.startsWith(":::")) continue;
          if (tryReplaceFragmentedFence(p)) {
            changed = true;
            break;
          }
        }
      }
    }
  }

  if (typeof document === "undefined") {
    globalThis.__kitflyPlanningVisualsTest = {
      parseFence,
      buildAxisCellLabel,
      weekAxisContextLabel,
      weekLabelStepForUnits,
      parseUnitOrdinal,
      weekLabelFromOrdinal,
      monthLabelFromOrdinal,
    };
  } else {
    function start() {
      apply(document);
    }

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", start);
    } else {
      start();
    }
  }
})();
