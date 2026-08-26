# MPLAD Sentinel: Source-Grounded Product Facts

## What the official scheme sources establish

MPLADS is administered by the Ministry of Statistics and Programme Implementation. Its purpose is to enable Members of Parliament to recommend durable community assets based on locally felt needs, including drinking water, primary education, public health, sanitation, roads, and related public infrastructure [1]. The official MoSPI page states that Lok Sabha MPs recommend works in their constituencies, Rajya Sabha MPs may recommend works anywhere in the state from which they were elected, and nominated MPs may recommend works anywhere in the country [1].

The eSAKSHI portal became effective from 1 April 2023 and digitizes recommendations, sanctions, execution updates, and stakeholder inputs. The 2026 PIB release states that District Authorities perform feasibility checks, sanction works, designate Implementing Agencies, and that sanctioned works are generally required to be completed within one year. Vendor payment requests and progress updates are entered through the portal, and photographs and supporting documents can be uploaded at payment stages [2].

The PIB release also establishes an important data boundary: pre-1 April 2023 implementation was physical, so work-level recommendations and sanctions are not uniformly available in eSAKSHI for earlier years. This must be shown in the product as a coverage/data-quality note rather than silently presented as a complete historical series [2].

The CAG performance-audit page documents MPLADS as a scheme in which MPs identify works while district-level functionaries hold technical, financial, and administrative sanction responsibilities. It also provides a historical audit report that can serve as a validation/reference source, not as a live detection dataset [3].

## Exact product requirements from the supplied SIH26102 brief

The proposed system should ingest multi-year, multi-state project and expenditure records into a unified schema. It should detect four required irregularity categories: financial anomalies, duplicate or near-duplicate projects, execution delays, and statistical or behavioral outliers. It should produce an explainable 0–100 risk score at project level, with roll-ups to MP and district/state views. It should support two audiences: a public transparency view and an authenticated investigator/audit view with case flagging, notes, and exportable audit trails.

The brief’s proposed detection core includes Benford and cost-distribution checks, utilization/completion mismatch, multivariate outlier models, NLP similarity plus geographic clustering for duplicate or ghost-project candidates, time-bound execution and SLA-breach checks, SC/ST allocation compliance checks, and vendor/implementing-agency graph analysis. These are proposed capabilities of MPLAD Sentinel, not claims that the current static prototype is already connected to production data.

The proposed composite score is: financial anomaly 30%; duplicate/ghost-project 25%; delay 20%; compliance 15%; vendor/agency graph 10%. Each score component must produce a human-readable reason string. Public language should use “review recommended,” “data inconsistency,” or “requires verification,” not accuse an MP, agency, vendor, or district of fraud.

## Content decisions for the website

The landing page will lead with the problem and the operating distinction: eSAKSHI records what was recommended, sanctioned, paid, and completed; MPLAD Sentinel is a proposed intelligence layer that checks those records for patterns requiring human review. The feature narrative will explicitly show the flow: sources → ingestion and normalization → four detection engines → explainable score → public and investigator views.

The public view will describe aggregate transparency signals, drill-down by state/constituency/district, utilization and completion timelines, and cautious review language. The investigator view will describe ranked queues, reason breakdowns, similar-project links, vendor/agency relationships, case states such as under review/confirmed/false positive, and PDF/CSV export as proposed workflow features.

All prototype metrics and queue rows will be labeled as demo or illustrative unless connected to a verified dataset. The site will disclose the post-2023 eSAKSHI coverage boundary and the need to validate public data exports before production use.

## References

[1]: https://www.mospi.gov.in/about-us/mplads — Ministry of Statistics and Programme Implementation, “Member of Parliament Local Area Development Scheme (MPLADS).”
[2]: https://www.pib.gov.in/PressReleasePage.aspx?PRID=2235932 — Press Information Bureau, “Revamped public dashboard of MPLADS eSAKSHI portal,” 6 March 2026.
[3]: https://cag.gov.in/en/audit-report/details/2341 — Comptroller and Auditor General of India, “Report No. 31 of 2010 - Performance Audit of Civil on Member of Parliament Local area Development Scheme.”
