(function applyStimulusPatch() {
  if (!window.BLIND_MANIFEST) return;
  const testCase = window.BLIND_MANIFEST.cases.find(item => item.case_id === "vibrato_06");
  if (!testCase) return;
  testCase.instruction = "第二个‘的’、‘往’：±20c @ 5Hz";
  const candidateAudio = {
    cand_281b2c0bfc951a: "media/cases/vibrato_06/cand_281b2c0bfc951a.wav?v=20260912b",
    cand_b7091f8ee8a751: "media/cases/vibrato_06/cand_b7091f8ee8a751.wav?v=20260912b",
  };
  for (const candidate of testCase.candidates) {
    if (candidateAudio[candidate.candidate_id]) candidate.audio = candidateAudio[candidate.candidate_id];
  }
})();
