---
name: rag-context-compressor
description: Semantic token chunking, Reciprocal Rank Fusion (RRF), and context-budget token optimization for RAG queries.
---

# 🧠 RAG Context Compressor & Semantic Chunking

The **RAG Context Compressor Skill** maximizes token efficiency by filtering out irrelevant context and ranking chunks using Reciprocal Rank Fusion (RRF).

## 🧭 1. Reciprocal Rank Fusion (RRF) Ranking
$$RRF\_Score(d) = \sum_{m \in M} \frac{1}{k + r_m(d)}$$
Where $k = 60$ and $r_m(d)$ is the rank of document $d$ in retrieval system $m$ (Dense Vector vs Sparse BM25).

## ✂️ 2. Context Compaction Pipeline:
1. Strip duplicate markdown headers and redundant boilerplate.
2. Truncate long code blocks to active function signatures.
3. Fit context strictly within defined token budgets (e.g. 4000 tokens) to minimize latency and inference costs.
