---
description: "Warpdrive GPU 证据文档的右侧停靠内存负载调查。"
kind: "package-library"
---

# @deepseek-ai/dsh-client-ui-gpu-investigation

[English](README.md) | 中文

## Summary

注册 **GPU 内存** 侧栏页签，在校验后的证据夹具上呈现受 Nsight Compute 启发的内存层次调查：路径选择、指标出处、指令/源码关联，以及基线↔候选对比。

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

启用 GPU 调查捆绑包，然后从右侧栏指南打开 **GPU 内存**。夹具横幅保持可见；Measured 标签指向夹具表。

<a id="understand-the-implementation"></a>
## 理解实现

使用 `sidebarRightTabs` 与 `sidebar.right.pane.tab`。视图模型来自 `@deepseek-ai/dsh-gpu-evidence`。样式仅消费 `--dsw-alias-*`。

<a id="further-exploration"></a>
## 延伸阅读

- `@deepseek-ai/dsh-gpu-evidence`
- [设计](../../../prototypes/warpdrive-gpu/DESIGN.md)

<a id="model-experience"></a>
## 模型体验

间接：智能体通过 `@deepseek-ai/dsh-tool-gpu-evidence` 使用同一夹具。本包不注册工具。

<a id="known-limitations-and-deferred-work"></a>
## 已知限制与延后工作

- 仅加载打包夹具；打开任意工作区 JSON 延后。
- 数据含 shared/local 节点，总览强调 global→L1→L2→DRAM 主链。
- 深浅色依赖主题令牌；停靠体交互测试仍偏少。

<a id="dev-note"></a>
## 开发说明

选择状态属于页签实例本地。未来接入路径须保持夹具标记。
