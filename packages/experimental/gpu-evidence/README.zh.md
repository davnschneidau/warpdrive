---
description: "Warpdrive 内存调查与对比所用的带出处的 GPU 证据文档。"
kind: "package-library"
---

# @deepseek-ai/dsh-gpu-evidence

[English](README.md) | 中文

## Summary

带出处的 GPU 证据文档：校验、Nsight 风格内存负载视图模型、双次运行对比约束，以及 megakernel 时间线归约。夹具必须标记；夹具上的 Measured 指向夹具表，而非本机实采。

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

从 Host 工具或 Client 调查 UI 导入 `parseGpuEvidence`、`buildMemoryOverview`、`inspectMemoryPath`、`compareEvidenceMetrics`。无 Nsight 导出时用 `fixtures/memory-baseline.json` 演示。

### 何时选择

需要在不编造指标的前提下展示或推理 GPU 剖析/编译证据时选择本库。优先通过后续适配器接入 NVIDIA 导出，不要对 Nsight 界面做截图解析。

<a id="understand-the-implementation"></a>
## 理解实现

每条指标与产物带 `ProvenanceKind`。内存路径声明 `measured_traffic`、`architectural` 或 `unavailable`。时间线忙碌覆盖使用区间并集。对比在夹具标记、架构或采集器不一致时拒绝。

<a id="further-exploration"></a>
## 延伸阅读

- [架构评审](../../../prototypes/warpdrive-gpu/ARCHITECTURE.md)
- [设计说明](../../../prototypes/warpdrive-gpu/DESIGN.md)
- Client 停靠：`@deepseek-ai/dsh-client-ui-gpu-investigation`

<a id="model-experience"></a>
## 模型体验

间接：`@deepseek-ai/dsh-tool-gpu-evidence` 向智能体暴露校验后的摘要与路径检查。本库不注册工具。

<a id="known-limitations-and-deferred-work"></a>
## 已知限制与延后工作

- 尚无实时 Nsight Compute SQLite/CSV 适配器——仅有版本化 JSON 夹具与校验 API。
- Megakernel 时间线归约已就绪，但首个停靠里程碑是内存调查。
- 指令与源码映射可能不完整；调用方必须暴露缺口。

<a id="dev-note"></a>
## 开发说明

模式版本为 `GPU_EVIDENCE_SCHEMA_VERSION`。仅在有迁移策略时升级。
