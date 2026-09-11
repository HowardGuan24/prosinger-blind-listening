if (window.BLIND_MANIFEST) {
  // Score collection has moved to CloudBase; keep the legacy Google endpoint inert.
  window.BLIND_MANIFEST.submission_endpoint = "";
  window.BLIND_MANIFEST.cloudbase = {
    env_id: "prosing-eval-d1gbd5bgnc7e58575",
    assign_rpc: "prosing_assign_questionnaire",
    submit_rpc: "prosing_store_submission",
  };
}
