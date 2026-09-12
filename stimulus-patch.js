(function applyStimulusRevision() {
  if (!window.BLIND_MANIFEST) return;
  window.BLIND_MANIFEST.stimulus_set_revision = "2026-09-12-vibrato06-r2";
  const testCase = window.BLIND_MANIFEST.cases.find(item => item.case_id === "vibrato_06");
  if (!testCase) return;
  testCase.instruction = "第二个‘的’、‘往’：±20c @ 5Hz";
  testCase.stimulus_revision = "vibrato06-second-de-r2";
  const candidateAudio = {
    cand_281b2c0bfc951a: "media/cases/vibrato_06/cand_281b2c0bfc951a_r2.wav",
    cand_b7091f8ee8a751: "media/cases/vibrato_06/cand_b7091f8ee8a751_r2.wav",
  };
  for (const candidate of testCase.candidates) {
    if (candidateAudio[candidate.candidate_id]) candidate.audio = candidateAudio[candidate.candidate_id];
  }
})();
