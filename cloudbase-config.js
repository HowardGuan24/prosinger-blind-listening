window.PROSING_PROXY_ENDPOINT = "https://prosing-eval-d1gbd5bgnc7e58575-1407828387.ap-shanghai.app.tcloudbase.com/prosing-api";

if (window.BLIND_MANIFEST) {
  window.BLIND_MANIFEST.submission_endpoint = "";
  window.BLIND_MANIFEST.cloudbase = {
    proxy_endpoint: window.PROSING_PROXY_ENDPOINT,
  };
}
