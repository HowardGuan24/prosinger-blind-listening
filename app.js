const STORAGE_KEY = "prosing_blind_listening_v6";
const METRIC_NAMES = {
  naturalness: "自然度",
  singer_similarity: "歌手相似度",
  technique_accuracy: "技巧准确率",
  technique_quality: "技巧质量",
};
const METRIC_NAMES_ENGLISH = {
  naturalness: "Naturalness",
  singer_similarity: "Singer similarity",
  technique_accuracy: "Technique accuracy",
  technique_quality: "Technique quality",
};
const TECHNIQUE_NAMES_LOCALIZED = {
  zh: {
    pharyngeal: "咽音",
    breathy: "气声",
    mix: "混声",
    falsetto: "假声",
    vibrato: "颤音",
    glissando: "滑音",
  },
  en: {
    pharyngeal: "Pharyngeal",
    breathy: "Breathy",
    mix: "Mixed voice",
    falsetto: "Falsetto",
    vibrato: "Vibrato",
    glissando: "Glissando",
  },
};
const RATING_LABELS_ENGLISH = {
  naturalness: {1: "Very unnatural", 2: "Unnatural", 3: "Fair", 4: "Natural", 5: "Very natural"},
  singer_similarity: {1: "No match", 2: "Slight match", 3: "Partial match", 4: "Mostly matches", 5: "Full match"},
  technique_accuracy: {1: "No match", 2: "Slight match", 3: "Partial match", 4: "Mostly matches", 5: "Full match"},
  technique_quality: {1: "Very poor", 2: "Poor", 3: "Fair", 4: "Good", 5: "Excellent"},
};
const PAGE_COPY = {
  zh: {
    documentTitle: "Prosing 歌唱技巧盲听评测",
    pageTitle: "Prosing 歌唱技巧盲听评测",
    pageIntro: "请使用耳机，在安静环境中完成 24 个样本打分，大约需要 15 分钟。",
    guideTitle: "评测指引",
    guideCopy: "本次测评包含六组单一技巧转换评测和六条复合技巧转换评测。每个单一技巧组均提供一段由专业歌手演唱的对应技巧参考音频。请先听参考音频，再对匿名候选结果进行评分。完成所有结果的评分后，请点击“上传评分”按钮。",
    criteriaTitle: "评分标准",
    naturalnessTitle: "自然度 · 1–5",
    naturalnessCopy: "仅评价歌声是否听感自然、连贯，以及是否存在明显失真。",
    similarityTitle: "歌手相似度 · 1–5",
    similarityCopy: "仅评价生成音频中的歌手与原始音频中的歌手是否一致。",
    accuracyTitle: "技巧准确率 · 1–5",
    accuracyCopy: "仅评价目标技巧是否出现在指定的时间位置。",
    qualityTitle: "技巧质量 · 1–5",
    qualityCopy: "仅评价生成的技巧是否明显、自然。",
    scaleCopy: "所有指标均采用 1–5 分，1 表示表现最低，5 表示表现最高。请独立判断四项指标，不要用某一项的好坏代替另一项。",
    progressUnit: " 个样本完成",
    submitResults: "上传评分",
    clearRatings: "清空评分",
    loadingCopy: "正在加载测试清单……",
    footer: "评分会保存在当前浏览器；完成后请点击“上传评分”。",
  },
  en: {
    documentTitle: "Prosing Singing Technique Listening Evaluation",
    pageTitle: "Prosing Singing Technique Listening Evaluation",
    pageIntro: "Please use headphones and rate 24 samples in a quiet environment. The evaluation takes approximately 15 minutes.",
    guideTitle: "Evaluation guide",
    guideCopy: "This evaluation contains six single-technique conversion groups and six composite-technique conversion samples. Each single-technique group provides a corresponding technique reference performed by a professional singer. Listen to the reference before rating the anonymized candidates. After rating all results, click “Submit ratings.”",
    criteriaTitle: "Rating criteria",
    naturalnessTitle: "Naturalness · 1–5",
    naturalnessCopy: "Evaluate only whether the singing sounds natural and coherent, without obvious distortion.",
    similarityTitle: "Singer similarity · 1–5",
    similarityCopy: "Evaluate only whether the singer in the generated audio matches the singer in the original audio.",
    accuracyTitle: "Technique accuracy · 1–5",
    accuracyCopy: "Evaluate only whether the target technique occurs at the specified time positions.",
    qualityTitle: "Technique quality · 1–5",
    qualityCopy: "Evaluate only whether the rendered technique is perceptible and natural.",
    scaleCopy: "All metrics use a 1–5 scale, where 1 indicates the lowest performance and 5 the highest. Rate each metric independently; do not use one aspect as a substitute for another.",
    progressUnit: " samples completed",
    submitResults: "Submit ratings",
    clearRatings: "Clear ratings",
    loadingCopy: "Loading the evaluation set…",
    footer: "Ratings are saved in this browser. Click “Submit ratings” when finished.",
  },
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
  if (saveStatus) saveStatus.textContent = `${localized("已自动保存", "Saved")} · ${new Date().toLocaleTimeString()}`;
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

function currentLanguage() {
  const form = currentForm();
  return form && form.language === "en" ? "en" : "zh";
}

function localized(chinese, english) {
  return currentLanguage() === "en" ? english : chinese;
}

function metricName(metric) {
  return currentLanguage() === "en" ? METRIC_NAMES_ENGLISH[metric] : METRIC_NAMES[metric];
}

function applyPageLanguage() {
  const language = currentLanguage();
  const copy = PAGE_COPY[language];
  document.documentElement.lang = language === "en" ? "en" : "zh-CN";
  document.title = copy.documentTitle;
  const textById = {
    "page-title": copy.pageTitle,
    "page-intro": copy.pageIntro,
    "guide-title": copy.guideTitle,
    "guide-copy": copy.guideCopy,
    "criteria-title": copy.criteriaTitle,
    "naturalness-title": copy.naturalnessTitle,
    "naturalness-copy": copy.naturalnessCopy,
    "similarity-title": copy.similarityTitle,
    "similarity-copy": copy.similarityCopy,
    "accuracy-title": copy.accuracyTitle,
    "accuracy-copy": copy.accuracyCopy,
    "quality-title": copy.qualityTitle,
    "quality-copy": copy.qualityCopy,
    "scale-copy": copy.scaleCopy,
    "progress-unit": copy.progressUnit,
    "submit-results": copy.submitResults,
    "clear-ratings": copy.clearRatings,
    "loading-copy": copy.loadingCopy,
    "page-footer": copy.footer,
  };
  for (const [elementId, text] of Object.entries(textById)) {
    const element = document.getElementById(elementId);
    if (element) element.textContent = text;
  }
}

function localizedCaseTitle(testCase) {
  if (currentLanguage() !== "en") return testCase.title;
  const number = String(testCase.title).match(/\d+/)?.[0] || "";
  return number ? `Sample ${number}` : testCase.title;
}

function localizedCandidateLabel(candidate) {
  const suffix = String(candidate.display_label).replace(/^Candidate\s*/i, "");
  return localized(`候选 ${suffix}`, `Candidate ${suffix}`);
}

function localizedInstruction(instruction) {
  if (currentLanguage() === "en") return instruction;
  return String(instruction)
    .replace(/pharyngeal/gi, "咽音")
    .replace(/breathy/gi, "气声")
    .replace(/falsetto/gi, "假声")
    .replace(/vibrato/gi, "颤音")
    .replace(/glissando/gi, "滑音")
    .replace(/mixed voice/gi, "混声")
    .replace(/\bmix\b/gi, "混声")
    .replace(/(\d+)c\b/g, "$1音分")
    .replace(/cents?/gi, "音分")
    .replace(/Hz/gi, "赫兹")
    .replace(/\bv1\b/gi, "第一版");
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
    const scaleLabel = currentLanguage() === "en"
      ? RATING_LABELS_ENGLISH[metric][score]
      : scale.labels[String(score)];
    const accessibleLabel = `${metricName(metric)}: ${scaleLabel}`;
    return `<label><input type="radio" name="${escapeHtml(key)}" value="${score}" aria-label="${escapeHtml(accessibleLabel)}" ${Number(selected) === score ? "checked" : ""}><b title="${escapeHtml(scaleLabel)}">${score}</b></label>`;
  }).join("");
  return `<div class="score-row"><span>${metricName(metric)}</span><div class="score-buttons" style="--score-count:${scale.values.length}" data-rating-key="${escapeHtml(key)}">${buttons}</div></div>`;
}

function candidateCell(testCase, candidate) {
  return `<td class="candidate-cell"><div class="candidate-label">${escapeHtml(localizedCandidateLabel(candidate))}</div>${audioPlayer(candidate.audio)}<div class="score-grid">${testCase.metrics.map(metric => scoreControl(testCase.case_id, candidate.candidate_id, metric)).join("")}</div></td>`;
}

function caseRow(testCase, candidateCount) {
  const lyricsLabel = localized("歌词", "Lyrics");
  const techniqueLabel = localized("技巧要求", "Technique instruction");
  const notesLabel = localized("可选备注", "Optional notes");
  const separator = localized("：", ": ");
  const details = `${testCase.lyrics ? `<p><strong>${lyricsLabel}${separator}</strong>${escapeHtml(testCase.lyrics)}</p>` : ""}<p><strong>${techniqueLabel}${separator}</strong>${escapeHtml(localizedInstruction(testCase.instruction))}</p>`;
  const cells = testCase.candidates.map(candidate => candidateCell(testCase, candidate)).join("");
  const padding = Array.from({length: candidateCount - testCase.candidates.length}, () => "<td></td>").join("");
  return `<tr data-case-id="${escapeHtml(testCase.case_id)}"><td class="case-info"><h3>${escapeHtml(localizedCaseTitle(testCase))}</h3>${details}<textarea class="notes" data-note-key="${escapeHtml(testCase.case_id)}" placeholder="${escapeHtml(notesLabel)}">${escapeHtml(state.notes[testCase.case_id] || "")}</textarea></td><td class="source-cell"><strong>${localized("原始音频", "Original audio")}</strong>${audioPlayer(testCase.source_audio)}</td>${cells}${padding}</tr>`;
}

function tableForCases(cases) {
  if (!cases.length) return "";
  const candidateCount = Math.max(...cases.map(item => item.candidates.length));
  const candidateHeaders = Array.from({length: candidateCount}, (_, index) => `<th>${localized("匿名候选", "Candidate")} ${String.fromCharCode(65 + index)}</th>`).join("");
  const candidateColumns = Array.from({length: candidateCount}, () => '<col class="candidate-column">').join("");
  const candidateWidth = (65 / candidateCount).toFixed(4);
  return `<div class="table-wrap"><table style="--candidate-width:${candidateWidth}%"><colgroup><col class="case-column"><col class="source-column">${candidateColumns}</colgroup><thead><tr><th>${localized("样本与要求", "Sample and instruction")}</th><th>${localized("原始音频", "Original source")}</th>${candidateHeaders}</tr></thead><tbody>${cases.map(item => caseRow(item, candidateCount)).join("")}</tbody></table></div>`;
}

function referenceCard(technique) {
  const form = currentForm();
  const referenceSet = form && form.reference_set ? form.reference_set : "zh";
  const reference = manifest.technique_references[referenceSet][technique];
  const title = localized("技巧参考", "Technique reference");
  const controlLabel = localized("无技巧", "Without technique");
  const techniqueLabel = localized("有技巧", "With technique");
  return `<div class="tech-reference"><strong>${title}</strong><div class="reference-pair"><div class="reference-item"><span>${controlLabel}</span>${audioPlayer(reference.control)}</div><div class="reference-item"><span>${techniqueLabel}</span>${audioPlayer(reference.technique)}</div></div></div>`;
}

function render() {
  const app = document.getElementById("app");
  const visibleCases = activeCases();
  if (!visibleCases.length) {
    app.innerHTML = `<section class="form-empty"><h2>${localized("问卷加载失败", "Failed to load the evaluation")}</h2><p>${localized("请刷新页面；若问题仍然存在，请联系研究者。", "Refresh the page. If the problem persists, contact the researcher.")}</p></section>`;
    updateProgress();
    return;
  }
  const sections = [];
  const techniqueNames = TECHNIQUE_NAMES_LOCALIZED[currentLanguage()];
  for (const [technique, techniqueName] of Object.entries(techniqueNames)) {
    const cases = visibleCases.filter(item => item.kind === "single" && item.technique === technique);
    sections.push(`<section><div class="section-heading"><h2>${escapeHtml(techniqueName)}</h2>${referenceCard(technique)}</div>${tableForCases(cases)}</section>`);
  }
  const compositeCases = visibleCases.filter(item => item.kind === "composite");
  sections.push(`<section><div class="section-heading"><h2>${localized("复合技巧", "Composite techniques")}</h2><p>${localized("请结合歌词和技巧分配，评价候选歌声的技巧准确率与技巧质量。", "Evaluate technique accuracy and quality using the lyrics and assigned technique program.")}</p></div>${tableForCases(compositeCases)}</section>`);
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
  alert(localized("问卷分配失败，请刷新页面或联系研究者。", "The evaluation could not be assigned. Refresh the page or contact the researcher."));
  return false;
}

async function submitResults() {
  if (!requireForm()) return;
  if (!manifest.submission_endpoint) {
    alert(localized("评分接收接口尚未配置，请联系研究者。", "The submission endpoint is not configured. Contact the researcher."));
    return;
  }
  const total = activeCases().length;
  if (completedCaseCount() !== total) {
    alert(localized(`请先完成当前问卷的 ${total} 个样本。`, `Please complete all ${total} samples before submitting.`));
    return;
  }
  const button = document.getElementById("submit-results");
  const status = document.getElementById("submission-status");
  button.disabled = true;
  status.className = "submission-status";
  status.textContent = localized("正在提交……", "Submitting…");
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
    status.textContent = localized("提交成功，感谢参与。", "Submitted successfully. Thank you for participating.");
  } catch (error) {
    status.className = "submission-status error";
    status.textContent = localized(
      `上传失败（${error.message}），评分仍保存在当前浏览器，请稍后重试。`,
      `Submission failed (${error.message}). Your ratings remain saved in this browser; please try again later.`,
    );
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
  if (!confirm(localized(
    `确认清空问卷 ${state.form_id} 的评分和备注？`,
    `Clear all ratings and notes for Form ${state.form_id}?`,
  ))) return;
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
  applyPageLanguage();
  const submitButton = document.getElementById("submit-results");
  submitButton.disabled = !manifest.submission_endpoint;
  if (!manifest.submission_endpoint) {
    document.getElementById("submission-status").textContent = localized("在线提交接口待配置", "Submission endpoint not configured");
    document.getElementById("page-footer").textContent = localized("当前部署尚未配置写入端点，请联系研究者。", "This deployment has no submission endpoint. Contact the researcher.");
  }
  render();
}
else {
  const englishRequested = (new URLSearchParams(window.location.search).get("form") || "").toUpperCase() === "C";
  document.documentElement.lang = englishRequested ? "en" : "zh-CN";
  document.getElementById("app").innerHTML = englishRequested
    ? '<p class="loading">Failed to load: manifest.js is missing.</p>'
    : '<p class="loading">加载失败：缺少 manifest.js。</p>';
}
