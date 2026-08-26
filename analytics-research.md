# Analytics Research Notes

## Source-grounded findings

MoSPI describes MPLADS as a workflow where MPs recommend durable community assets, District Authorities examine feasibility/cost/compliance and issue administrative sanction, and Implementing Agencies execute works and update progress. eSAKSHI integrates recommendations, sanctions, and execution, with the revised web-based solution effective from 1 April 2023. The site should therefore visualize the scheme as a staged flow rather than as a single fraud score. Source: https://www.mospi.gov.in/about-us/mplads

The UK Government Analysis Function dashboard guide recommends an inverted-pyramid structure: headline insights first, details in tabs or drill-downs; minimize scrolling and clicks; avoid horizontal scrolling; paginate large tables; use filters; and make chart elements, legends, and data points keyboard-accessible with descriptive labels. Source: https://analysisfunction.civilservice.gov.uk/policy-store/data-visualisation-testing-dashboards-for-design-and-accessibility/

The India Open Government Data portal emphasizes catalog, APIs, sectors, state/central groupings, visualizations, metrics, metadata discovery, and dataset search. MPLAD Sentinel should link to data provenance and expose dataset freshness/coverage rather than imply a connected live API when none exists. Source: https://www.data.gov.in/

## Design implications

The most suitable first analytics layer is a compact overview with four coordinated views: (1) a scheme-stage funnel from recommendation to sanction to execution to completion, (2) an anomaly taxonomy chart for financial, duplicate/ghost, delay, compliance, and agency-network signals, (3) a district/state comparison that can be sorted and filtered without implying guilt, and (4) an explainability panel showing how the weighted score is composed. All demo values must be labeled illustrative until verified records are connected.

## Additional research

The World Bank Centre for Financial Reporting Reform frames public-sector data storytelling as translating facts, numbers, and expert knowledge into comprehensible stories rather than simply displaying more charts. Source: https://cfrr.worldbank.org/publications/data-guide

The Institute of Internal Auditors recommends that dashboards make the audit question and next decision obvious. The strongest recurring pattern is: headline trend, concentration by segment, unusual-signal list, and drill-down to evidence. It also stresses aligned definitions and thresholds, data quality, traceability, and explicit exposure/coverage/direction rather than unexplained red/green indicators. Source: https://www.theiia.org/en/content/articles/global-best-practices/2026/from-data-to-decisions-elevating-internal-audit-with-visualization-and-storytelling/

## Chosen MPLADS visualization system

Use a dashboard-story sequence rather than a dashboard wall: a top-level “what needs review?” summary, then a stage funnel, then anomaly family comparisons, then a concentration view by geography/implementing agency, and finally an explainability drawer for one record. Use a toggle between count and amount where the source supports it. Keep red/coral for review intensity only; use neutral colors for normal volume. Always show coverage period, data freshness, denominator, and “review-recommended, not a finding” language adjacent to risk visuals.
