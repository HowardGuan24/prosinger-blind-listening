const STORAGE_KEY = "prosing_blind_listening_v6";
const METRIC_NAMES = {
  naturalness: "自然度",
  singer_similarity: "歌手相似度",
  technique_accuracy: "技巧准确率",
  technique_quality: "技巧质量",
};

let manifest = null;
let state = loadState();

function loadState() {
  const empty = {participant_id: "", form_id: "", ratings: {}, notes: {}, submitted_at: {}, submission_ids: {}};
  try { return {...empty, ...(JSON.parse(localStorage.getItem(STORAGE_KEY)) || {})}; }
  catch (_) { return empty; }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  const saveStatus = document.getElementById("save-status");
  if (saveStatus) saveStatus.textContent = `已自动保存 · ${new Date().toLocaleTimeString()}`;
  updateProgress();
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"})[char]);
}

function ratingKey(caseId, candidateId, metric) { return `${caseId}|${candidateId}|${metric}`; }

function audioPlayer(path) { return `<audio controls preload="none" src="${escapeHtml(path)}"></audio>`; }

function currentForm() {
  return manifest && manifest.forms ? manifest.forms[state.form_id] : null;
}

function activeCases() {
  const form = currentForm();
  if (!form) return [];
  const selected = new Set(form.case_ids);
  return manifest.cases.filter(testCase => selected.has(testCase.case_id));
}

function scoreControl(caseId, candidateId, metric) {
  const key = ratingKey(caseId, candidateId, metric);
  const selected = state.ratings[key];
  const scale = manifest.rating_scales[metric];
  const buttons = scale.values.map(score => {
    const scaleLabel = scale.labels[String(score)];
    const accessibleLabel = `${METRIC_NAMES[metric]}：${scaleLabel}`;
    return `<label><input type="radio" name="${escapeHtml(key)}" value="${score}" aria-label="${escapeHtml(accessibleLabel)}" ${Number(selected) === score ? "checked" : ""}><b title="${escapeHtml(scaleLabel)}">${score}</b></label>`;
  }).join("");
  return `<div class="score-row"><span>${METRIC_NAMES[metric]}</span><div class="score-buttons" style="--score-count:${scale.values.length}" data-rating-key="${escapeHtml(key)}">${buttons}</div></div>`;
}

function candidateCell(testCase, candidate) {
  return `<td class="candidate-cell"><div class="candidate-label">${escapeHtml(candidate.display_label)}</div>${audioPlayer(candidate.audio)}<div class="score-grid">${testCase.metrics.map(metric => scoreControl(testCase.case_id, candidate.candidate_id, metric)).join("")}</div></td>`;
}

function caseRow(testCase, candidateCount) {
  const details = `${testCase.lyrics ? `<p><strong>歌词：</strong>${escapeHtml(testCase.lyrics)}</p>` : ""}<p><strong>技巧：</strong>${escapeHtml(testCase.instruction)}</p>`;
  const cells = testCase.candidates.map(candidate => candidateCell(testCase, candidate)).join("");
  const padding = Array.from({length: candidateCount - testCase.candidates.length}, () => "<td></td>").join("");
  return `<tr data-case-id="${escapeHtml(testCase.case_id)}"><td class="case-info"><h3>${escapeHtml(testCase.title)}</h3>${details}<textarea class="notes" data-note-key="${escapeHtml(testCase.case_id)}" placeholder="可选备注">${escapeHtml(state.notes[testCase.case_id] || "")}</textarea></td><td class="source-cell"><strong>Original source</strong>${audioPlayer(testCase.source_audio)}</td>${cells}${padding}</tr>`;
}

function tableForCases(cases) {
  if (!cases.length) return "";
  const candidateCount = Math.max(...cases.map(item => item.candidates.length));
  const candidateHeaders = Array.from({length: candidateCount}, (_, index) => `<th>匿名候选 ${String.fromCharCode(65 + index)}</th>`).join("");
  const candidateColumns = Array.from({length: candidateCount}, () => '<col class="candidate-column">').join("");
  const candidateWidth = (65 / candidateCount).toFixed(4);
  return `<div class="table-wrap"><table style="--candidate-width:${candidateWidth}%"><colgroup><col class="case-column"><col class="source-column">${candidateColumns}</colgroup><thead><tr><th>样本与要求</th><th>原始音频</th>${candidateHeaders}</tr></thead><tbody>${cases.map(item => caseRow(item, candidateCount)).join("")}</tbody></table></div>`;
}

function render() {
  const app = document.getElementById("app");
  const visibleCases = activeCases();
  if (!visibleCases.length) {
    app.innerHTML = '<section class="form-empty"><h2>问卷加载失败</h2><p>请刷新页面；若问题仍然存在，请联系研究者。</p></section>';
    updateProgress();
    return;
  }
  const sections = [];
  for (const [technique, techniqueName] of Object.entries(manifest.technique_names)) {
    const cases = visibleCases.filter(item => item.kind === "single" && item.technique === technique);
    sections.push(`<section><div class="section-heading"><h2>${escapeHtml(techniqueName)}</h2><div class="tech-reference"><strong>技巧参考 Technique reference</strong>${audioPlayer(manifest.technique_references[technique])}</div></div>${tableForCases(cases)}</section>`);
  }
  const compositeCases = visibleCases.filter(item => item.kind === "composite");
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

function caseRatingKeys(testCase) {
  return testCase.candidates.flatMap(candidate => testCase.metrics.map(metric => ratingKey(testCase.case_id, candidate.candidate_id, metric)));
}

function expectedRatingKeys() {
  return activeCases().flatMap(caseRatingKeys);
}

function completedCaseCount() {
  return activeCases().filter(testCase => caseRatingKeys(testCase).every(key => state.ratings[key] !== undefined)).length;
}

function updateProgress() {
  if (!manifest) return;
  const visibleCases = activeCases();
  const done = completedCaseCount();
  const total = visibleCases.length || 24;
  document.getElementById("progress-text").textContent = `${done} / ${total}`;
  const progress = document.getElementById("progress-bar");
  progress.max = total;
  progress.value = done;
  document.querySelectorAll("tr[data-case-id]").forEach(row => {
    const testCase = visibleCases.find(item => item.case_id === row.dataset.caseId);
    row.classList.toggle("complete", Boolean(testCase) && caseRatingKeys(testCase).every(key => state.ratings[key] !== undefined));
  });
}

function resultPayload() {
  const rows = [];
  for (const testCase of activeCases()) {
    for (const candidate of testCase.candidates) {
      for (const metric of testCase.metrics) {
        const key = ratingKey(testCase.case_id, candidate.candidate_id, metric);
        rows.push({
          participant_id: state.participant_id,
          form_id: state.form_id,
          case_id: testCase.case_id,
          kind: testCase.kind,
          technique: testCase.technique || "composite",
          candidate_id: candidate.candidate_id,
          display_label: candidate.display_label,
          metric,
          score: state.ratings[key] !== undefined ? state.ratings[key] : "",
          note: state.notes[testCase.case_id] || "",
        });
      }
    }
  }
  return {
    schema_version: 2,
    exported_at: new Date().toISOString(),
    participant_id: state.participant_id,
    form_id: state.form_id,
    case_count: activeCases().length,
    rows,
  };
}

function requireForm() {
  if (currentForm()) return true;
  alert("问卷分配失败，请刷新页面或联系研究者。");
  return false;
}

async function submitResults() {
  if (!requireForm()) return;
  if (!manifest.submission_endpoint) {
    alert("评分接收接口尚未配置，请联系研究者。");
    return;
  }
  const total = activeCases().length;
  if (completedCaseCount() !== total) {
    alert(`请先完成当前问卷的 ${total} 个样本。`);
    return;
  }
  const button = document.getElementById("submit-results");
  const status = document.getElementById("submission-status");
  button.disabled = true;
  status.className = "submission-status";
  status.textContent = "正在提交……";
  if (!state.submission_ids[state.form_id]) {
    state.submission_ids[state.form_id] = typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${state.participant_id}-${state.form_id}-${Date.now()}`;
  }
  const payload = {
    ...resultPayload(),
    submission_id: state.submission_ids[state.form_id],
    submitted_at: new Date().toISOString(),
  };
  try {
    const response = await fetch(manifest.submission_endpoint, {
      method: "POST",
      headers: {"Content-Type": "text/plain;charset=UTF-8"},
      body: JSON.stringify(payload),
      redirect: "follow",
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    state.submitted_at[state.form_id] = payload.submitted_at;
    saveState();
    status.className = "submission-status success";
    status.textContent = "提交成功，感谢参与。";
  } catch (error) {
    status.className = "submission-status error";
    status.textContent = `上传失败（${error.message}），评分仍保存在当前浏览器，请稍后重试。`;
  } finally {
    button.disabled = !manifest.submission_endpoint;
  }
}

function anonymousParticipantId() {
  const identifier = typeof crypto.randomUUID === "function"
    ? crypto.randomUUID().replaceAll("-", "").slice(0, 12)
    : `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
  return `listener_${identifier}`;
}

function initializeStudyAssignment() {
  const formIds = Object.keys(manifest.forms);
  const requestedForm = (new URLSearchParams(window.location.search).get("form") || "").toUpperCase();
  if (manifest.forms[requestedForm]) state.form_id = requestedForm;
  else if (!manifest.forms[state.form_id]) state.form_id = formIds[Math.floor(Math.random() * formIds.length)];
  if (!state.participant_id) state.participant_id = anonymousParticipantId();
  saveState();
}

document.getElementById("submit-results").addEventListener("click", submitResults);
document.getElementById("clear-ratings").addEventListener("click", () => {
  if (!requireForm()) return;
  if (!confirm(`确认清空问卷 ${state.form_id} 的评分和备注？`)) return;
  for (const key of expectedRatingKeys()) delete state.ratings[key];
  for (const testCase of activeCases()) delete state.notes[testCase.case_id];
  delete state.submitted_at[state.form_id];
  delete state.submission_ids[state.form_id];
  saveState();
  render();
});

manifest = window.BLIND_MANIFEST;
if (manifest) {
  initializeStudyAssignment();
  const submitButton = document.getElementById("submit-results");
  submitButton.disabled = !manifest.submission_endpoint;
  if (!manifest.submission_endpoint) {
    document.getElementById("submission-status").textContent = "在线提交接口待配置";
    document.getElementById("page-footer").textContent = "当前部署尚未配置写入端点，请联系研究者。";
  }
  render();
}
else document.getElementById("app").innerHTML = '<p class="loading">加载失败：缺少 manifest.js。</p>';
