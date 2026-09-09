# ProSinger blind listening site

This directory is the **public deployment bundle**. Candidate systems are anonymized.

## Local preview

```bash
python3 -m http.server 8000 --directory site
```

Then open `http://localhost:8000`.

## GitHub Pages

Create a separate public repository, copy only the contents of `site/` into it, push to
`main`, and configure **Settings → Pages → Deploy from a branch → main / (root)**.

Do not publish `../private/answer_key.json`. Each listener exports a JSON or CSV file and
sends it to the researcher. GitHub Pages is static and does not collect ratings by itself.
