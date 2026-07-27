# KITENGO GAMING — Marekebisho ya AI + PWA (Install & Offline)

## NILICHOFANYA (bila kugusa maandishi/picha zako)
1. **AI Assistant imerekebishwa** — tatizo lilikuwa Google wamezima kabisa model `gemini-1.5-flash` (Julai 2026), ndiyo maana ilikuwa haijibu kimya kimya. Nimeibadilisha kwenda model inayofanya kazi sasa (`gemini-3.6-flash`), na nimeongeza "fallback" ya kiotomatiki (`gemini-2.5-flash`) endapo Google watabadilisha jina la model tena baadaye — AI haitakwama tena kimya kimya.
2. **Herufi mbovu (encoding bugs) zimerekebishwa** — mshale wa "Rudi Nyuma" na emoji za "📁" zilikuwa zinaonekana kama alama za ajabu (тмЕ, ЁЯУБ) kwa baadhi ya simu/browser.
3. **Faili za PWA zimeongezwa**: `manifest.json`, `sw.js`, na `icons/` — hizi ndizo zinazofanya app iwe "Installable" (Add to Home Screen) na ifanye kazi bila internet baada ya kufunguliwa mara moja.

Mfumo wako wa "long-press kuhariri" (jina, bei, link, picha) kwenye Admin Mode (`#admin`) **haukuguswa kabisa** — bado uko kama ulivyokuwa, unafanya kazi vizuri.

## HATUA ZA DEPLOY (Netlify)
1. Weka `logo.jpg` na `yutong2.jpg` zako mwenyewe kwenye folda hii (hazikuwa kwenye faili ulizonipa)
2. Nenda https://app.netlify.com → "Add new site" → "Deploy manually"
3. Buruta (drag & drop) folda nzima yenye: `index.html`, `game.js`, `manifest.json`, `sw.js`, `icons/`, `logo.jpg`, `yutong2.jpg`
4. Utapata link, mfano `https://jina-lako.netlify.app`

## KU-INSTALL KWENYE SIMU
- **Android (Chrome)**: fungua link → bonyeza "Install App" itakayotokea chini, au vitone vitatu (⋮) → "Install app"
- **iPhone (Safari)**: fungua link → Share → "Add to Home Screen"

Baada ya kuifungua mara moja ukiwa na internet, ukurasa mkuu utahifadhiwa (cached) na utafunguka hata bila internet baadaye.
