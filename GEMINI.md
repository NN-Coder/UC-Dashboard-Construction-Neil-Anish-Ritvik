You are an expert full-stack developer and data scientist. Build a modern, interactive web application that analyzes and answers the following research question using the provided UC admissions dataset (`dashboard_data.csv`):

> **Question:** How has the correlation between a California public high school's socioeconomic status (`frpm_pct`) and its unexpected UC admission outcomes (`admit_rate_residual`) shifted from the standardized testing era (2017–2019) to the test-blind era (2022–2025)?

---

### Project Architecture & Stack
- **Frontend Framework:** React with Vite or Next.js (App Router).
- **Styling & UI:** Tailwind CSS, Lucide-React icons, clean modern typography, responsive card layouts, and subtle glassmorphic touches.
- **Interactive Visualizations:** Recharts, Chart.js, or Plotly.js for responsive, client-side interactive charts (tooltips, zoom/pan, hover highlights, campus filtering).
- **Data Engine:** Python (Pandas, SciPy, Statsmodels) to preprocess and compute all aggregate statistics, regression models, and correlations, exported to optimized JSON payloads consumed by the frontend.

---

### Key Analysis & Data Requirements
1. **Time-Period Cohorts:**
   - Pre-Test-Blind Era: **2017–2019** (exclude 2020 COVID anomaly and 2021 transition year).
   - Test-Blind Era: **2022–2025** (note: skip 2021–22 missing `frpm_pct` if applicable, filter `.notna()` for both columns).
2. **Key Variables:**
   - Predictor / Socioeconomic Indicator: `frpm_pct` (share of students eligible for free/reduced-price meals).
   - Outcome Metric: `admit_rate_residual` (actual admit rate minus `expected_admit_rate`).
   - Slicing Dimensions: Overall Bay Area / CA Public Schools vs. Campus-by-Campus (e.g., UC Berkeley, UCLA vs. UCSC, UCM).
3. **Statistical Computations:**
   - Pearson ($r$) and Spearman ($\rho$) correlation coefficients with $p$-values.
   - Ordinary Least Squares (OLS) regression: $y = \beta_0 + \beta_1 x$, reporting slope ($\beta_1$), $R^2$, and standard error for both time windows.
   - Difference-in-slopes test / interaction term analysis.

---

### Application Layout & Component Features

#### 1. Hero & Executive Summary
- Bold statement of the research question and immediate, high-level verdict.
- 4 Key Metric Badges:
  - Pre-Test-Blind Correlation ($r_1$) & $R^2$
  - Test-Blind Era Correlation ($r_2$) & $R^2$
  - Net Delta ($\Delta r$) and Statistical Significance ($p$-value)
  - Total Analyzed High Schools / Applicant Cohorts

#### 2. Interactive Visual Showcase
- **Dual Scatter Plot & Regression Viewer:**
  - Interactive scatter plot plotting `frpm_pct` (X-axis) vs. `admit_rate_residual` (Y-axis).
  - Toggle between eras (2017–2019 vs. 2022–2025) or side-by-side view with color-coded trendlines and confidence intervals.
  - Interactive dropdown filter by UC campus (e.g., "All Campuses / Universitywide", "UC Berkeley", "UCLA", "UC San Diego").
  - Hover tooltips showing High School name, City, FRPM %, Residual %, and Applicant volume.
- **Campus-Level Comparison Bar Chart:**
  - Grouped bar chart comparing the shift in correlation ($r$) across individual UC campuses between the two eras.

#### 3. Mathematical & Statistical Deep Dive
- Formatted mathematical breakdown displaying:
  - Residual formula: $\text{Residual} = \text{Admit Rate}_{\text{actual}} - \text{Admit Rate}_{\text{expected}}$
  - Pearson's correlation equation: $r = \frac{\sum (x - \bar{x})(y - \bar{y})}{\sqrt{\sum (x - \bar{x})^2 \sum (y - \bar{y})^2}}$
  - Regression equations for both time periods with plain-English statistical interpretations.

#### 4. Code Showcase & Reproducibility
- Tabbed interactive code viewer displaying clean Python/Pandas snippets used to compute the metrics:
  - *Data Cleaning & Filtering*
  - *Correlation & OLS Regression with `scipy.stats`*
  - *Residual Aggregation across Campuses*
- Copy-to-clipboard functionality and syntax highlighting.

#### 5. Findings & Nuanced Insights
- Structured card layout breaking down:
  - **The Core Finding:** Concise, data-backed explanation of whether test-blind policies narrowed or expanded the socioeconomic residual gap.
  - **Campus Divergence:** Differences between selective flagship campuses vs. broader-access campuses.
  - **Data Caveats:** Notes on redactions for counts $<3$, capped GPA saturation, and school-level aggregation vs. individual student outcomes.

---

### Implementation Instructions
Generate the full directory structure, Python preprocessing script, and complete React/Next.js component code (including Tailwind styles and mock preprocessed data JSON) so the project can be run immediately.