# Prosing blind listening site

This directory is the **public deployment bundle**. Candidate systems are anonymized.

## Local preview

```bash
python3 -m http.server 8000 --directory site
```

Then open `http://localhost:8000`.

## GitHub Pages

Create a separate public repository, copy only the contents of `site/` into it, push to
`main`, and configure **Settings → Pages → Deploy from a branch → main / (root)**.

Do not publish `../private/answer_key.json`.

## Result submission

GitHub Pages cannot store submissions by itself. Rebuild with an HTTPS collection endpoint:

```bash
python build_site.py --overwrite --submission-endpoint "https://YOUR-ENDPOINT"
```

The endpoint receives one complete questionnaire as a JSON body using `text/plain;charset=UTF-8`.
Without an endpoint, the submit button is disabled and JSON/CSV export remains available.

Chinese questionnaires A1, A2, B1, and B2 each contain 12 cases: three cases for each
of three single techniques plus three composite cases. Together they retain all 48 cases
from the original A/B pool without duplication. English questionnaire C retains 24 cases.
Technique references appear immediately before the evaluation block where they are needed.
