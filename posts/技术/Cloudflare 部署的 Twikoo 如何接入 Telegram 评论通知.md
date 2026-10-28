---
title: Cloudflare 部署的 Twikoo 如何接入 Telegram 评论通知
description: 以青鸾小栈为例，记录 Twikoo + Cloudflare Workers + D1 接入 Telegram Bot 即时推送的配置方法、工作原理与排错步骤。
slug: twikoo-telegram-notification
date: 2026/10/28 16:35:00
updated: 2026/10/28 16:41:17
categories: 
  - 技术
tags:
  - Cloudflare
  - Telegram
  - 网站
---

博客部署后，评论能正常显示，不代表站长能及时发现新留言。我的博客 [青鸾小栈](https://qingluanx.com/) 使用 **Twikoo** 作为评论系统，后端运行在 **Cloudflare Workers**，评论数据保存在 **Cloudflare D1**，并通过 **Telegram Bot** 接收即时通知。本文记录这一方案的配置方式及其实现原理。

## 一、整体架构

本方案不需要额外部署通知服务器，也不需要 Telegram Webhook。Twikoo 内置的 **pushoo** 消息推送功能，可以将新评论通知转发至 Telegram。

```text
访客在 qingluanx.com 发表评论
             │
             ▼
     Twikoo 前端提交评论
             │
             ▼
   Cloudflare Workers（Twikoo 后端）
             │
             ├── 校验并写入 Cloudflare D1
             │
             └── 执行评论后续处理
                        │
                        ▼
                  Twikoo 通知模块
                        │
                        ▼
                 pushoo（telegram）
                        │
                        ▼
                Telegram Bot API
                        │
                        ▼
                  站长收到通知
```

这里需要区分三个角色：**Workers** 负责执行 Twikoo 后端代码，**D1** 负责保存评论与配置，**Telegram Bot** 负责将消息送达指定聊天。

本站公开的 [twikoo-cloudflare 仓库](https://github.com/wangshiyulin/twikoo-cloudflare) 可用于参考 Cloudflare 适配方式，参考教程：

[在 Cloudflare Workers 上部署 Twikoo 评论系统极简教程 | 青鸾小栈](https://qingluanx.com/Cloudflare-Twikoo)

下文只涉及即时通知配置，不重复整个 Twikoo 的部署过程。

---

## 二、创建 Telegram 机器人
### 1. 获取 Bot Token
在 Telegram 中搜索 [@BotFather](https://t.me/BotFather)，发送：

```text
/newbot
```

按照提示填写机器人名称和用户名。创建成功后，BotFather 会提供一段 **Bot Token**，格式类似：

```text
123456789:AAExampleTokenReplaceWithYourOwn
```

这段令牌用于调用 Telegram Bot API，相当于机器人的操作凭证，应妥善保管。

### 2. 获取 Chat ID

先打开刚创建的机器人，点击 **Start** 或发送 `/start`，让机器人能够向你的私人会话发送消息。

然后打开 [@userinfobot](https://t.me/userinfobot)，获取当前 Telegram 账号的数字 **Chat ID**，例如：

```text
987654321
```

Bot Token 标识“由哪个机器人发送”，Chat ID 标识“发送到哪个聊天”。本文采用站长与机器人的私人聊天，不建议把包含访客信息的通知发往公开群组或频道。

## 三、在 Twikoo 中配置即时通知

进入博客评论区，打开 **Twikoo 管理面板**，登录后找到**配置管理**中的**即时通知**设置。不同版本的界面布局可能略有差异，核心配置项如下：

| 配置项 | 填写内容 |
| --- | --- |
| `PUSHOO_CHANNEL` | `telegram` |
| `PUSHOO_TOKEN` | `Bot Token#Chat ID` |
| `BLOGGER_EMAIL` | 站长在 Twikoo 中使用的邮箱（按实际需要配置） |

其中 `PUSHOO_TOKEN` 必须使用英文半角 `#` 连接两部分：

```text
123456789:AAExampleTokenReplaceWithYourOwn#987654321
```

保存配置即可。**无需在 Cloudflare Workers 中新建环境变量，也无需另写一个 Worker 负责转发通知**；这里的参数由 Twikoo 管理面板管理，保存在其后端配置中。

配置完成后，Twikoo 将通过 pushoo 的 `telegram` 通道请求 Telegram Bot API，把符合通知条件的评论推送到指定 Chat ID。

## 四、验证通知是否生效

建议按以下顺序测试：

1. 确认已向自己的机器人发送过 `/start`。
2. 在 Twikoo 管理面板保存 `PUSHOO_CHANNEL` 和 `PUSHOO_TOKEN`。
3. 使用 **非站长邮箱** 在博客任意文章下发表一条测试评论。
4. 检查评论是否成功保存，再查看 Telegram 是否收到新评论消息。

测试时不要直接使用 `BLOGGER_EMAIL` 对应的邮箱：Twikoo 会识别博主身份，相关评论不一定触发面向博主的即时提醒。使用无痕窗口可以避免浏览器自动填入站长身份信息，但关键仍是测试评论的邮箱。

如果评论发布成功而 Telegram 没有收到提醒，可以分别排查：

| 现象 | 排查方向 |
| --- | --- |
| 评论也无法提交 | 先检查 Workers 请求、D1 数据库及 Twikoo 服务是否正常 |
| 评论成功，但完全没有提醒 | 检查 `PUSHOO_CHANNEL` 是否为 `telegram`，`PUSHOO_TOKEN` 是否正确保存 |
| Telegram 机器人没有响应 | 是否先点击 Start；Bot Token 是否有效；Chat ID 是否对应正确聊天 |
| 用站长邮箱测试收不到 | 改用其他邮箱重新提交测试评论 |
| 偶尔收不到或延迟 | 查看 Cloudflare Workers 的实时日志，排查 Telegram API 请求失败、网络超时或后续通知处理异常 |

在 Cloudflare 控制台进入 **Workers & Pages → 对应 Worker → Logs（日志）**，可根据控制台界面查看请求日志或启用实时日志。注意不要公开日志中可能出现的令牌、邮箱、评论内容或 IP 地址。

## 五、通知实际是怎样发出的？

从本站公开的 Cloudflare 适配源码可以看出，评论提交请求由 `COMMENT_SUBMIT` 事件处理。核心流程可概括为：

```js
// 以下为流程示意，并非可直接替换的完整源码
const comment = await save(data)            // 保存评论到 D1
await postSubmit(comment)                    // 进行提交后的处理

// postSubmit 内部执行：
await postCheckSpam(comment, config)         // 垃圾评论检测
await sendNotice(comment, config, getParentComment) // 通知处理
```

`sendNotice` 属于 Twikoo 的通知模块。启用 Telegram 通道后，通知模块借助 pushoo 适配 Telegram 的接口格式，最终由 Telegram Bot API 向指定聊天发送消息。

这里有两个容易混淆的概念：

- **主动推送**：Twikoo 后端在处理评论后主动请求 Telegram API；这是本站使用的方式。
- **Telegram Webhook**：Telegram 将机器人收到的消息或事件回调给你的服务器；接收博客新评论通知并不需要它。

因此，整套配置不需要给机器人设置 Webhook 地址，也不要求服务器持续轮询 Telegram。

此外，**评论保存成功与通知发送成功不是同一件事**。在本站公开的 Cloudflare 适配代码中，评论先写入 D1，再执行后续通知；通知阶段报错不必然导致已保存的评论消失。因此出现“评论正常、Telegram 没有提醒”时，应优先定位通知链路，而不是直接怀疑数据库。

## 六、几个注意事项

**1. 不要泄露 Bot Token。** 它不应出现在网页前端、公开仓库、截图或文章示例中。如果意外泄露，应在 BotFather 中重新生成令牌并更新 Twikoo 配置。

**2. 尽量使用私人聊天接收通知。** 评论通知可能携带访客昵称、评论内容、邮箱或 IP 等信息，不适合直接推送到公共频道。

**3. Telegram 即时通知不等于访客回复邮件通知。** 此方案主要用于提醒博主。若希望评论者收到被回复的提醒，还需另外配置 Twikoo 的邮件通知功能。Cloudflare Workers 环境不适合直接使用传统 SMTP 连接，应采用兼容的 HTTP 邮件 API 方案。

**4. 注意运行环境的出站网络。** Telegram Bot API 需要后端能够访问 `api.telegram.org`。本站使用 Cloudflare Workers 发起请求；如果换成其他服务器部署，应单独确认服务器到 Telegram API 的网络连通性。

### 参考资料

- [青鸾小栈](https://qingluanx.com/)
- [本站 twikoo-cloudflare 公开仓库](https://github.com/wangshiyulin/twikoo-cloudflare)
- [Twikoo 官方：pushoo / Telegram 通道](https://twikoo.js.org/pushoo.html)
- [Twikoo 官方：Cloudflare Workers 部署](https://twikoo.js.org/backend.html)
