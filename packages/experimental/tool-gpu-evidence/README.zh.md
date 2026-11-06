---
description: "面向模型的 Warpdrive GPU 内存证据总览、路径检查与对比工具。"
kind: "package-library"
---

# @deepseek-ai/dsh-tool-gpu-evidence

[English](README.md) | 中文

## Summary

注册 `gpu_memory_overview`、`gpu_memory_inspect_path`、`gpu_evidence_compare`，使智能体与停靠 UI 读取同一套校验后的证据文档。夹具结果保持标记。

## Table of Contents

- [使用本包](#use-this-package)
- [理解实现](#understand-the-implementation)
- [延伸阅读](#further-exploration)
- [模型体验](#model-experience)
- [已知限制与延后工作](#known-limitations-and-deferred-work)
- [开发说明](#dev-note)

-----

<a id="use-this-package"></a>
## 使用本包

启用 GPU 调查捆绑包。在工作区接入落地前，工具加载打包夹具。

<a id="understand-the-implementation"></a>
## 理解实现

对 `@deepseek-ai/dsh-gpu-evidence` 的薄 Cordis 插件，无单独指标逻辑。

<a id="further-exploration"></a>
## 延伸阅读

- `@deepseek-ai/dsh-gpu-evidence`
- `@deepseek-ai/dsh-client-ui-gpu-investigation`

<a id="model-experience"></a>
## 模型体验

### 系统提示词

```text
Use gpu_memory_overview and gpu_memory_inspect_path to reason about Warpdrive GPU memory evidence. Fixture documents are labeled; do not claim they are live Nsight captures. Use gpu_evidence_compare for before/after metrics under compatible collection context. Distinguish evidence-backed conclusions from suggestions for further investigation.
```

### 工具

| 工具 | 作用 |
|---|---|
| `gpu_memory_overview` | 夹具发现与路径 |
| `gpu_memory_inspect_path` | 单路径指标、指令、源 |
| `gpu_evidence_compare` | 基线与候选差值及兼容性 |

<a id="known-limitations-and-deferred-work"></a>
## 已知限制与延后工作

- 工具仅打开打包夹具；工作区文件接入延后。
- 不打开 Client 停靠页签（UI 注册独立）。

<a id="dev-note"></a>
## 开发说明

保持工具文案与证据出处词表一致。
