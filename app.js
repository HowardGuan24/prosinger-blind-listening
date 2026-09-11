const STORAGE_KEY = "prosing_blind_listening_v6";
const CHINESE_FORM_IDS = ["A1", "A2", "B1", "B2"];
const ENGLISH_FORM_IDS = ["C1", "C2"];
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
const PITCH_REFERENCE_LYRICS = {
  zh: {
    vibrato: [
      {text: "圆圈勾勒成指"},
      {text: "纹", target: true},
      {text: "，印在"},
      {text: "我", target: true},
      {text: "的嘴"},
      {text: "唇", target: true},
    ],
    glissando: [
      {text: "情人最"},
      {text: "后", target: true},
      {text: "难"},
      {text: "免", target: true},
      {text: "沦"},
      {text: "为", target: true},
      {text: "朋"},
      {text: "友", target: true},
    ],
  },
  en: {
    vibrato: [
      {text: "Edelweiss", target: true},
      {text: ", "},
      {text: "edelweiss", target: true},
    ],
    glissando: [
      {text: "I "},
      {text: "want", target: true},
      {text: " you to "},
      {text: "stay", target: true},
    ],
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
    pageIntro: "请使用耳机，在安静环境中完成 12 个样本打分，大约需要 8 分钟。",
    guideTitle: "评测指引",
    guideCopy: "本次测评包含三组单一技巧转换评测和三条复合技巧转换评测。专业歌手演唱的技巧参考会在对应评测前给出；请先试听参考，再评价匿名候选结果。完成全部评分后，请点击“上传评分”按钮。",
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
    pageIntro: "Please use headphones and rate 12 samples in a quiet environment. The evaluation takes approximately 8 minutes.",
    guideTitle: "Evaluation guide",
    guideCopy: "This evaluation contains three single-technique conversion groups and three composite-technique conversion samples. Technique references performed by professional singers appear before the corresponding evaluation block. Listen to the references before rating the anonymized candidates. After rating all results, click “Submit ratings.”",
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
const CHINESE_INSTRUCTION_OVERRIDES = {
  vibrato_01: "“欢”、“台”：颤音",
  vibrato_02: "“路”：颤音",
  vibrato_03: "“你”：颤音",
  vibrato_04: "“会”：颤音",
  vibrato_05: "“寂”：颤音",
  vibrato_06: "第一个“的”、“往”：颤音",
  gliss_01_hui: "“会”：下滑音",
  gliss_02_si_mei: "“四”：下滑音；“没”：上滑音",
  gliss_03_hei: "“黑”：上滑音",
  gliss_04_dayu: "“境”：上滑音；“游”：下滑音",
  gliss_05_fangyuan: "“那”：上滑音；“稚”：下滑音",
  gliss_06_nanshan: "“一”：下滑音；“梦”：上滑音",
  combo_01_yiluxiangbei: "“你说你好累”：混声；“已无法再爱上谁”：咽音；“谁”：叠加颤音",
  combo_02_gumeng: "“追不上”：同时使用气声和假声",
  combo_03_maoxianmeng: "“当生命每分每秒都为你”：气声；“转动”：咽音",
  combo_04_yujian: "全段：气声；“他在多远的未来”：假声",
  combo_05_wozhidao_a: "“太过”、“以为你会”：混声；“骄纵”：假声；“懂”：颤音",
  combo_06_wozhidao_b: "全段：混声；“动”：叠加颤音",
  combo_07_guangnian: "全段：咽音；“危”：假声；“难中相爱”：混声",
  combo_08_luoyeguigen: "“不胜唏嘘”：假声；“幻化成秋夜”：咽音；“夜”：叠加颤音",
  combo_09_dangnilaole: "全段：同时使用气声和假声",
  combo_10_yuai: "“听雨的”、“一滴滴”：同时使用气声和假声；“呼吸像雨滴”：不添加新技巧，保留原唱已有假声；“渗入我的爱里”：混声",
  combo_11_xiangziyou: "“才”：下滑音并叠加假声；“不快乐”：咽音",
  combo_12_dayu: "“飞远去”：咽音；“飞”：颤音；“看你离我而去”：气声",
};
const ENGLISH_INSTRUCTION_OVERRIDES = {
  en_vibrato_01: "“SONG”: vibrato.",
  en_vibrato_02: "“FEEL”: vibrato.",
  en_vibrato_03: "“APART”: vibrato.",
  en_glissando_01: "“WERE”: downward glissando.",
  en_glissando_02: "“GIRL”: upward glissando.",
  en_glissando_03: "First syllable of “EVERYTHING” (EH V): downward glissando.",
  en_combo_01: "“NEAR” and “FAR”: breathy; “FAR”: vibrato; “WHEREVER YOU ARE”: mixed voice.",
  en_combo_02: "“BABY YOU WOULD TAKE AWAY”: falsetto; “YOU”: downward glissando.",
  en_combo_03: "“YOU AND I”: pharyngeal; “I” and “PACT”: vibrato; “MAKE”: falsetto.",
  en_combo_04: "“LOVE YOU”: pharyngeal; final third of “YOU”: vibrato.",
  en_combo_05: "Entire sample: falsetto and breathy.",
  en_combo_06: "“SO MANY”: breathy; first syllable of “MANY”: upward glissando.",
};

let manifest = null;
let state = loadState();
let explainedGlissandoDirections = new Set();

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

function glissandoLabel(direction) {
  if (currentLanguage() === "en") return direction === "up" ? "upward glissando" : "downward glissando";
  return direction === "up" ? "上滑音" : "下滑音";
}

function replaceTrajectoryData(instruction) {
  return instruction.replace(
    /(?:source-relative pitch delta\s*)?([+-]?\d+)\s*→\s*([+-]?\d+)\s*(?:cents?|音分)/gi,
    (_, startValue, endValue) => glissandoLabel(Number(endValue) > Number(startValue) ? "up" : "down"),
  );
}

function annotateFirstGlissandoDirections(instruction) {
  const labels = currentLanguage() === "en"
    ? {up: "upward glissando", down: "downward glissando"}
    : {up: "上滑音", down: "下滑音"};
  let result = instruction;
  for (const direction of ["up", "down"]) {
    result = result.replaceAll(labels[direction], label => {
      if (explainedGlissandoDirections.has(direction)) return label;
      explainedGlissandoDirections.add(direction);
      const explanation = currentLanguage() === "en"
        ? (direction === "up" ? "from a lower pitch to a higher pitch" : "from a higher pitch to a lower pitch")
        : (direction === "up" ? "从低音滑向高音" : "从高音滑向低音");
      return currentLanguage() === "en" ? `${label} (${explanation})` : `${label}（${explanation}）`;
    });
  }
  return result;
}

function localizedInstruction(testCase) {
  const language = currentLanguage();
  const instructionOverrides = language === "en" ? ENGLISH_INSTRUCTION_OVERRIDES : CHINESE_INSTRUCTION_OVERRIDES;
  const rawInstruction = instructionOverrides[testCase.case_id] || String(testCase.instruction);
  let simplified = rawInstruction
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
    .replace(/\bv1\b/gi, "第一版")
    .replace(/^全段\s+/, "全段：");
  if (language === "en") {
    simplified = rawInstruction
      .replace(/\s*\([^)]*(?:cents?|Hz)[^)]*\)/gi, "")
      .replace(/\s+\./g, ".");
  }
  simplified = replaceTrajectoryData(simplified);
  return annotateFirstGlissandoDirections(simplified);
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
  const details = `${testCase.lyrics ? `<p><strong>${lyricsLabel}${separator}</strong>${escapeHtml(testCase.lyrics)}</p>` : ""}<p><strong>${techniqueLabel}${separator}</strong>${escapeHtml(localizedInstruction(testCase))}</p>`;
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

function referenceLyrics(referenceSet, technique) {
  const segments = PITCH_REFERENCE_LYRICS[referenceSet]?.[technique];
  if (!segments) return "";
  const lyrics = segments.map(segment => {
    const text = escapeHtml(segment.text);
    return segment.target ? `<mark>${text}</mark>` : text;
  }).join("");
  const separator = localized("：", ": ");
  const note = localized("高亮处为技巧位置", "Highlighted words indicate technique locations");
  return `<p class="reference-lyrics"><span class="reference-lyrics-label">${localized("歌词", "Lyrics")}${separator}</span>${lyrics}<span class="reference-lyrics-note">${note}</span></p>`;
}

function referenceCard(technique) {
  const form = currentForm();
  const referenceSet = form && form.reference_set ? form.reference_set : "zh";
  const reference = manifest.technique_references[referenceSet][technique];
  const techniqueName = TECHNIQUE_NAMES_LOCALIZED[currentLanguage()][technique];
  const title = localized(`${techniqueName}参考`, `${techniqueName} reference`);
  const controlLabel = localized("无技巧", "Without technique");
  const techniqueLabel = localized("有技巧", "With technique");
  return `<div class="tech-reference"><strong>${title}</strong>${referenceLyrics(referenceSet, technique)}<div class="reference-pair"><div class="reference-item"><span>${controlLabel}</span>${audioPlayer(reference.control)}</div><div class="reference-item"><span>${techniqueLabel}</span>${audioPlayer(reference.technique)}</div></div></div>`;
}

function render() {
  const app = document.getElementById("app");
  const visibleCases = activeCases();
  explainedGlissandoDirections = new Set();
  if (!visibleCases.length) {
    app.innerHTML = `<section class="form-empty"><h2>${localized("问卷加载失败", "Failed to load the evaluation")}</h2><p>${localized("请刷新页面；若问题仍然存在，请联系研究者。", "Refresh the page. If the problem persists, contact the researcher.")}</p></section>`;
    updateProgress();
    return;
  }
  const sections = [];
  const techniqueNames = TECHNIQUE_NAMES_LOCALIZED[currentLanguage()];
  const activeTechniques = Object.keys(techniqueNames).filter(technique =>
    visibleCases.some(item => item.kind === "single" && item.technique === technique)
  );
  const supplementalTechniques = Object.keys(techniqueNames).filter(technique => !activeTechniques.includes(technique));
  const singleReferenceCopy = localized(
    "以下三种技巧对应本问卷的单一技巧评测。参考音频由专业歌手演唱，仅用于理解目标技巧，无需评分。",
    "These professional-singer references correspond to the single-technique evaluation below. They are provided only to demonstrate each target technique and are not rated.",
  );
  sections.push(`<section class="reference-section"><div class="section-heading compact"><h2>${localized("单一技巧参考", "Single-technique references")}</h2><p>${singleReferenceCopy}</p></div><div class="reference-grid">${activeTechniques.map(referenceCard).join("")}</div></section>`);
  for (const technique of activeTechniques) {
    const techniqueName = techniqueNames[technique];
    const cases = visibleCases.filter(item => item.kind === "single" && item.technique === technique);
    sections.push(`<section><div class="section-heading compact"><h2>${escapeHtml(techniqueName)}</h2></div>${tableForCases(cases)}</section>`);
  }
  const compositeCases = visibleCases.filter(item => item.kind === "composite");
  if (supplementalTechniques.length) {
    const supplementalCopy = localized(
      "以下技巧未在前面的单技巧部分单独评价，但会出现在接下来的复合技巧样本中。请先试听参考音频，无需评分。",
      "The following techniques were not rated separately above but may appear in the composite samples. Listen to these references before continuing; they are not rated.",
    );
    sections.push(`<section class="reference-section"><div class="section-heading compact"><h2>${localized("复合技巧补充参考", "Additional references for composite techniques")}</h2><p>${supplementalCopy}</p></div><div class="reference-grid">${supplementalTechniques.map(referenceCard).join("")}</div></section>`);
  }
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
  const total = visibleCases.length || 12;
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

function showThankYou() {
  const instructions = document.querySelector(".instructions");
  const toolbar = document.querySelector(".toolbar");
  if (instructions) instructions.hidden = true;
  if (toolbar) toolbar.hidden = true;
  document.getElementById("page-intro").textContent = localized("评分已完成。", "Evaluation completed.");
  document.getElementById("app").innerHTML = `
    <section class="thank-you-card">
      <div class="thank-you-icon" aria-hidden="true">✓</div>
      <h2>${localized("提交成功，感谢你的参与！", "Submission complete. Thank you for participating!")}</h2>
      <p>${localized("你的评分已成功上传，现在可以关闭此页面。", "Your ratings have been uploaded successfully. You may now close this page.")}</p>
    </section>`;
  document.getElementById("page-footer").textContent = localized("感谢你的参与。", "Thank you for participating.");
  if (typeof window.scrollTo === "function") window.scrollTo({top: 0, behavior: "smooth"});
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
    const result = await response.json();
    if (!result.ok) throw new Error(result.error || "server_rejected");
    state.submitted_at[state.form_id] = payload.submitted_at;
    saveState();
    showThankYou();
  } catch (error) {
    status.className = "submission-status error";
    status.textContent = localized(
      `上传失败（${error.message}），评分仍保存在当前浏览器，请稍后重试。`,
      `Submission failed (${error.message}). Your ratings remain saved in this browser; please try again later.`,
    );
  } finally {
    button.disabled = !manifest.submission_endpoint || Boolean(state.submitted_at[state.form_id]);
  }
}

function anonymousParticipantId() {
  const identifier = typeof crypto.randomUUID === "function"
    ? crypto.randomUUID().replaceAll("-", "").slice(0, 12)
    : `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
  return `listener_${identifier}`;
}

async function initializeStudyAssignment() {
  const query = new URLSearchParams(window.location.search);
  const englishRequested = (query.get("lang") || "").toLowerCase() === "en"
    || ["C", ...ENGLISH_FORM_IDS].includes((query.get("form") || "").toUpperCase());
  if (!state.participant_id) state.participant_id = anonymousParticipantId();

  if (!manifest.submission_endpoint) return false;
  const eligibleFormIds = englishRequested ? ENGLISH_FORM_IDS : CHINESE_FORM_IDS;
  const preferredForm = eligibleFormIds.includes(state.form_id) ? state.form_id : "";
  try {
    const response = await fetch(manifest.submission_endpoint, {
      method: "POST",
      headers: {"Content-Type": "text/plain;charset=UTF-8"},
      body: JSON.stringify({
        action: "assign",
        participant_id: state.participant_id,
        preferred_form: preferredForm,
        language: englishRequested ? "en" : "zh",
      }),
      redirect: "follow",
    });
    if (!response.ok) return false;
    const assignment = await response.json();
    if (!assignment.ok || !eligibleFormIds.includes(assignment.form_id)) return false;
    state.form_id = assignment.form_id;
    saveState();
    return true;
  } catch (_) {
    return false;
  }
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

async function startStudy() {
  manifest = window.BLIND_MANIFEST;
  if (!manifest) {
    const englishRequested = (new URLSearchParams(window.location.search).get("lang") || "").toLowerCase() === "en"
      || ["C", ...ENGLISH_FORM_IDS].includes((new URLSearchParams(window.location.search).get("form") || "").toUpperCase());
    document.documentElement.lang = englishRequested ? "en" : "zh-CN";
    document.getElementById("app").innerHTML = englishRequested
      ? '<p class="loading">Failed to load: manifest.js is missing.</p>'
      : '<p class="loading">加载失败：缺少 manifest.js。</p>';
    return;
  }

  const assigned = await initializeStudyAssignment();
  if (!assigned) {
    document.getElementById("app").innerHTML = '<section class="form-empty"><h2>问卷分配失败</h2><p>请刷新页面；若问题仍然存在，请联系研究者。</p></section>';
    return;
  }
  applyPageLanguage();
  const submitButton = document.getElementById("submit-results");
  submitButton.disabled = !manifest.submission_endpoint;
  if (!manifest.submission_endpoint) {
    document.getElementById("submission-status").textContent = localized("在线提交接口待配置", "Submission endpoint not configured");
    document.getElementById("page-footer").textContent = localized("当前部署尚未配置写入端点，请联系研究者。", "This deployment has no submission endpoint. Contact the researcher.");
  }
  if (state.submitted_at[state.form_id]) {
    showThankYou();
    return;
  }
  render();
}

startStudy();
