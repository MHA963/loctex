---
name: wsjf-backlog-prioritization
description: Weighted Shortest Job First (WSJF) and RICE mathematical prioritization scoring engine for agile backlogs.
---

# 📊 WSJF & RICE Backlog Prioritization Engine

The **WSJF Prioritization Skill** applies quantitative mathematical ranking to feature requests, technical debt remediation, and bug fixes.

## 🧮 1. WSJF Formula (Weighted Shortest Job First)
$$\text{WSJF} = \frac{\text{Cost of Delay (CoD)}}{\text{Job Size / Duration}}$$
Where $\text{Cost of Delay} = \text{User-Business Value} + \text{Time Criticality} + \text{Risk Reduction / Opportunity Enablement}$.

## 🎯 2. RICE Scoring Framework
$$\text{RICE Score} = \frac{\text{Reach} \times \text{Impact} \times \text{Confidence}}{\text{Effort}}$$

## 📋 3. Automated Prioritization Matrix
| Feature / Task | CoD (1-10) | Job Size (1-10) | WSJF Score | Priority Tier |
| :--- | :---: | :---: | :---: | :---: |
| **Idempotency & Race Condition Fix** | 9 | 2 | **4.5** | 🥇 **P0 (Urgent)** |
| **UXAI Visual Mockup Approval Gate** | 8 | 2 | **4.0** | 🥇 **P0 (Critical)** |
| **Multi-Channel Payout Ledger** | 8 | 4 | **2.0** | 🥈 **P1 (High)** |
| **Dark Mode Semantic Customizer** | 5 | 5 | **1.0** | 🥉 **P2 (Standard)** |
