"use strict";

const REFRESH_INTERVAL_MILLISECONDS = 30_000;
const LISTENER_LABELS = {
  vocal_experience: "有声乐经验",
  music_experience: "有音乐经验",
  no_music_experience: "无音乐经验",
};
const METRIC_LABELS = {
  naturalness: "自然度",
  singer_similarity: "歌手相似度",
  technique_accuracy: "技巧准确率",
  technique_quality: "技巧质量",
};

function formatNumber(value) {
  return new Intl.NumberFormat("zh-CN").format(Number(value) || 0);
}

function formatDuration(seconds) {
  const totalSeconds = Number(seconds);
  if (!Number.isFinite(totalSeconds) || totalSeconds <= 0) return "—";
  const minutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = Math.round(totalSeconds % 60);
  return `${minutes}分${remainingSeconds}秒`;
}

function formatTime(value) {
  if (!value) return "尚无提交";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "尚无提交";
  return `最近提交 ${date.toLocaleString("zh-CN", {hour12: false})}`;
}

function renderBars(containerId, items, labelForItem) {
  const container = document.getElementById(containerId);
  const maximum = Math.max(1, ...items.map(item => Number(item.submissions) || 0));
  container.innerHTML = items.map(item => {
    const submissions = Number(item.submissions) || 0;
    const width = submissions === 0 ? 0 : Math.max(7, (submissions / maximum) * 100);
    return `<div class="bar-row">
      <span class="bar-label">${labelForItem(item)}</span>
      <span class="bar-track" aria-hidden="true"><span class="bar-fill" style="width:${width}%"></span></span>
      <span class="bar-value">${formatNumber(submissions)}</span>
    </div>`;
  }).join("");
}

function renderDaily(items) {
  const container = document.getElementById("daily-chart");
  const maximum = Math.max(1, ...items.map(item => Number(item.submissions) || 0));
  container.innerHTML = items.map(item => {
    const submissions = Number(item.submissions) || 0;
    const height = submissions === 0 ? 4 : Math.max(12, (submissions / maximum) * 130);
    const date = new Date(`${item.date}T00:00:00`);
    const label = `${date.getMonth() + 1}/${date.getDate()}`;
    return `<div class="day-column">
      <span class="day-value">${submissions}</span>
      <span class="day-bar" style="height:${height}px"></span>
      <span class="day-label">${label}</span>
    </div>`;
  }).join("");
}

function renderMetrics(items) {
  const container = document.getElementById("metric-grid");
  container.innerHTML = items.map(item => {
    const meanScore = item.mean_score === null || item.mean_score === undefined
      ? "—"
      : Number(item.mean_score).toFixed(2);
    return `<div class="metric-card">
      <span>${METRIC_LABELS[item.metric] || item.label}</span>
      <strong>${meanScore}</strong>
      <small>${formatNumber(item.score_count)} 条评分</small>
    </div>`;
  }).join("");
}

function renderDashboard(data) {
  const summary = data.summary || {};
  document.getElementById("total-submissions").textContent = formatNumber(summary.total_submissions);
  document.getElementById("today-submissions").textContent = formatNumber(summary.today_submissions);
  document.getElementById("score-rows").textContent = formatNumber(summary.score_rows);
  document.getElementById("average-active-time").textContent = formatDuration(summary.average_active_seconds);
  document.getElementById("latest-submission").textContent = formatTime(summary.latest_received_at);
  document.getElementById("generated-at").textContent = `数据更新时间：${new Date(data.generated_at).toLocaleString("zh-CN", {hour12: false})}`;
  document.getElementById("test-count").textContent = `另有 ${formatNumber(summary.test_submissions)} 条测试记录未计入`;

  renderDaily(Array.isArray(data.daily) ? data.daily : []);
  renderBars("form-list", Array.isArray(data.forms) ? data.forms : [], item => item.form_id);
  renderBars(
    "listener-list",
    Array.isArray(data.listener_types) ? data.listener_types : [],
    item => LISTENER_LABELS[item.listener_type] || item.label,
  );
  renderMetrics(Array.isArray(data.metrics) ? data.metrics : []);
}

async function fetchStats() {
  const endpoint = window.PROSING_PROXY_ENDPOINT;
  if (!endpoint) throw new Error("统计接口尚未配置");
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({action: "stats"}),
  });
  if (!response.ok) throw new Error(`统计接口返回 ${response.status}`);
  const data = await response.json();
  if (!data || data.ok !== true) throw new Error(data && data.error ? data.error : "统计接口返回异常");
  return data;
}

async function refreshDashboard() {
  const status = document.querySelector(".live-status");
  const statusText = document.getElementById("refresh-status");
  const button = document.getElementById("refresh-button");
  button.disabled = true;
  status.classList.remove("is-error");
  statusText.textContent = "正在刷新";
  try {
    renderDashboard(await fetchStats());
    status.classList.add("is-live");
    statusText.textContent = "实时数据 · 30 秒刷新";
  } catch (error) {
    status.classList.remove("is-live");
    status.classList.add("is-error");
    statusText.textContent = "读取失败，请重试";
    console.error(error);
  } finally {
    button.disabled = false;
  }
}

document.getElementById("refresh-button").addEventListener("click", refreshDashboard);
refreshDashboard();
window.setInterval(refreshDashboard, REFRESH_INTERVAL_MILLISECONDS);
