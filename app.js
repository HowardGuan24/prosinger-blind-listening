const STORAGE_KEY = "prosinger_blind_listening_v1";
const METRIC_NAMES = {
  naturalness: "自然度",
  singer_similarity: "歌手相似度",
  technique_accuracy: "技巧准确率",
  technique_quality: "技巧质量",
};

let manifest = null;
let state = loadState();

function loadState() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {participant_id: "", ratings: {}, notes: {}}; }
  catch (_) { return {participant_id: "", ratings: {}, notes: {}}; }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  document.getElementById("save-status").textContent = `已自动保存 · ${new Date().toLocaleTimeString()}`;
  updateProgress();
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"})[char]);
}

function ratingKey(caseId, candidateId, metric) { return `${caseId}|${candidateId}|${metric}`; }

function audioPlayer(path) { return `<audio controls preload="none" src="${escapeHtml(path)}"></audio>`; }

function scoreControl(caseId, candidateId, metric) {
  const key = ratingKey(caseId, candidateId, metric);
  const selected = state.ratings[key];
  const buttons = [0,1,2,3,4].map(score => `
    <label><input type="radio" name="${escapeHtml(key)}" value="${score}" ${Number(selected) === score ? "checked" : ""}><b>${score}</b></label>`).join("");
  return `<div class="score-row"><span>${METRIC_NAMES[metric]}</span><div class="score-buttons" data-rating-key="${escapeHtml(key)}">${buttons}</div></div>`;
}

function candidateCell(testCase, candidate) {
  return `<td class="candidate-cell"><div class="candidate-label">${escapeHtml(candidate.display_label)}</div>${audioPlayer(candidate.audio)}<div class="score-grid">${testCase.metrics.map(metric => scoreControl(testCase.case_id, candidate.candidate_id, metric)).join("")}</div></td>`;
}

function caseRow(testCase, candidateCount) {
  const details = testCase.kind === "composite"
    ? `<p><strong>歌词：</strong>${escapeHtml(testCase.lyrics)}</p><p><strong>技巧：</strong>${escapeHtml(testCase.instruction)}</p>`
    : `${testCase.lyrics ? `<p><strong>歌词：</strong>${escapeHtml(testCase.lyrics)}</p>` : ""}<p><strong>技巧：</strong>${escapeHtml(testCase.instruction)}</p>`;
  const cells = testCase.candidates.map(candidate => candidateCell(testCase, candidate)).join("");
  const padding = Array.from({length: candidateCount - testCase.candidates.length}, () => "<td></td>").join("");
  return `<tr data-case-id="${escapeHtml(testCase.case_id)}"><td class="case-info"><h3>${escapeHtml(testCase.title)}</h3>${details}<textarea class="notes" data-note-key="${escapeHtml(testCase.case_id)}" placeholder="可选备注">${escapeHtml(state.notes[testCase.case_id] || "")}</textarea></td><td class="source-cell"><strong>Original source</strong>${audioPlayer(testCase.source_audio)}</td>${cells}${padding}</tr>`;
}

function tableForCases(cases) {
  const candidateCount = Math.max(...cases.map(item => item.candidates.length));
  const candidateHeaders = Array.from({length: candidateCount}, (_, index) => `<th>匿名候选 ${String.fromCharCode(65 + index)}</th>`).join("");
  const candidateColumns = Array.from({length: candidateCount}, () => '<col class="candidate-column">').join("");
  const minWidth = 360 + 300 + candidateCount * 360;
  return `<div class="table-wrap"><table style="min-width:${minWidth}px"><colgroup><col class="case-column"><col class="source-column">${candidateColumns}</colgroup><thead><tr><th>样本与要求</th><th>原始音频</th>${candidateHeaders}</tr></thead><tbody>${cases.map(item => caseRow(item, candidateCount)).join("")}</tbody></table></div>`;
}

function render() {
  const app = document.getElementById("app");
  const sections = [];
  for (const [technique, techniqueName] of Object.entries(manifest.technique_names)) {
    const cases = manifest.cases.filter(item => item.kind === "single" && item.technique === technique);
    sections.push(`<section><div class="section-heading"><h2>${escapeHtml(techniqueName)}</h2><div class="tech-reference"><strong>技巧参考 Technique reference</strong>${audioPlayer(manifest.technique_references[technique])}</div></div>${tableForCases(cases)}</section>`);
  }
  const compositeCases = manifest.cases.filter(item => item.kind === "composite");
  sections.push(`<section><div class="section-heading"><h2>复合技巧 Composite techniques</h2><p>请结合歌词和技巧分配，评价候选歌声的技巧准确率与技巧质量。</p></div>${tableForCases(compositeCases)}</section>`);
  app.innerHTML = sections.join("");
  bindInputs();
  updateProgress();
}

function bindInputs() {
  document.querySelectorAll("input[type=radio]").forEach(input => input.addEventListener("change", event => {
    state.ratings[event.target.name] = Number(event.target.value);
    saveState();
  }));
  document.querySelectorAll("textarea[data-note-key]").forEach(input => input.addEventListener("input", event => {
    state.notes[event.target.dataset.noteKey] = event.target.value;
    saveState();
  }));
}

function expectedRatingKeys() {
  return manifest.cases.flatMap(testCase => testCase.candidates.flatMap(candidate => testCase.metrics.map(metric => ratingKey(testCase.case_id, candidate.candidate_id, metric))));
}

function updateProgress() {
  if (!manifest) return;
  const expected = expectedRatingKeys();
  const done = expected.filter(key => state.ratings[key] !== undefined).length;
  document.getElementById("progress-text").textContent = `${done} / ${expected.length}`;
  const progress = document.getElementById("progress-bar");
  progress.max = expected.length;
  progress.value = done;
  document.querySelectorAll("tr[data-case-id]").forEach(row => {
    const caseId = row.dataset.caseId;
    const keys = expected.filter(key => key.startsWith(`${caseId}|`));
    row.classList.toggle("complete", keys.every(key => state.ratings[key] !== undefined));
  });
}

function resultPayload() {
  const rows = [];
  for (const testCase of manifest.cases) {
    for (const candidate of testCase.candidates) {
      for (const metric of testCase.metrics) {
        rows.push({
          participant_id: state.participant_id,
          case_id: testCase.case_id,
          kind: testCase.kind,
          technique: testCase.technique || "composite",
          candidate_id: candidate.candidate_id,
          display_label: candidate.display_label,
          metric,
          score: state.ratings[ratingKey(testCase.case_id, candidate.candidate_id, metric)] !== undefined
            ? state.ratings[ratingKey(testCase.case_id, candidate.candidate_id, metric)]
            : "",
          note: state.notes[testCase.case_id] || "",
        });
      }
    }
  }
  return {schema_version: 1, exported_at: new Date().toISOString(), participant_id: state.participant_id, rows};
}

function download(name, content, mime) {
  const blob = new Blob([content], {type: mime});
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 1000);
}

function requireParticipant() {
  if (state.participant_id.trim()) return true;
  alert("请先填写听众编号。");
  document.getElementById("participant-id").focus();
  return false;
}

function csvEscape(value) {
  const text = String(value === undefined || value === null ? "" : value);
  return /[",\n]/.test(text) ? `"${text.split('"').join('""')}"` : text;
}

document.getElementById("participant-id").value = state.participant_id;
document.getElementById("participant-id").addEventListener("input", event => { state.participant_id = event.target.value.trim(); saveState(); });
document.getElementById("export-json").addEventListener("click", () => {
  if (!requireParticipant()) return;
  download(`prosinger_blind_${state.participant_id}.json`, JSON.stringify(resultPayload(), null, 2), "application/json");
});
document.getElementById("export-csv").addEventListener("click", () => {
  if (!requireParticipant()) return;
  const rows = resultPayload().rows;
  const fields = Object.keys(rows[0]);
  const csv = [fields.join(","), ...rows.map(row => fields.map(field => csvEscape(row[field])).join(","))].join("\n");
  download(`prosinger_blind_${state.participant_id}.csv`, csv, "text/csv;charset=utf-8");
});
document.getElementById("clear-ratings").addEventListener("click", () => {
  if (!confirm("确认清空当前浏览器中的所有评分和备注？")) return;
  state = {participant_id: state.participant_id, ratings: {}, notes: {}};
  saveState();
  render();
});

manifest = window.BLIND_MANIFEST;
if (manifest) render();
else document.getElementById("app").innerHTML = '<p class="loading">加载失败：缺少 manifest.js。</p>';
