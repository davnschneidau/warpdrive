---
description: "可选官方捆绑包：接入 GPU 证据工具与内存调查停靠。"
kind: "bundle"
---

# @deepseek-ai/dsh-gpu-investigation-bundle

[English](README.md) | 中文

## Summary

可选的 Warpdrive GPU 内存调查组合：共享证据库、模型工具与右侧停靠内存调查 UI。默认产品配置在插件页启用前不会打开。

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

在插件页启用 **GPU 调查**。打开侧栏 **GPU 内存**（指南）以检查已标记的基线夹具、选择 L2↔DRAM，并对比候选 tile 实验。

<a id="understand-the-implementation"></a>
## 理解实现

`cordis.patch.yml` 插入 `tool-gpu-evidence` 与 `client-ui-gpu-investigation`。证据包是二者的库依赖。

<a id="further-exploration"></a>
## 延伸阅读

- [架构](../../../prototypes/warpdrive-gpu/ARCHITECTURE.md)
- [设计](../../../prototypes/warpdrive-gpu/DESIGN.md)

<a id="model-experience"></a>
## 模型体验

通过 `@deepseek-ai/dsh-tool-gpu-evidence` 间接提供。

<a id="known-limitations-and-deferred-work"></a>
## 已知限制与延后工作

- 实时 Nsight 接入与工作区文件打开尚未包含。
- Megakernel 时间线 UI 延后；归约在 `dsh-gpu-evidence`。

<a id="dev-note"></a>
## 开发说明

保持捆绑包相对实验性官方插件的产品隔离规则为默认关闭。
