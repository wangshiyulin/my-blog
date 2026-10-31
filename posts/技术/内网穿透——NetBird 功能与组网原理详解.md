---
title: 内网穿透——NetBird 功能与组网原理详解
slug: netbird-architecture-and-features
date: 2026/10/31 02:25:55
updated: 2026/10/31 02:25:55
categories:
  - 技术
tags:
  - NetBird
  - 内网穿透
description: 系统理解 NetBird 的控制面与数据面、P2P 与 Relay、虚拟 IP、DNS、访问策略、Networks、Exit Node、自托管及排障方法。
---

NetBird 是建立在 WireGuard 之上的私有组网平台。它不仅提供加密隧道，还负责设备注册、网络地址分配、连接协商、访问控制、DNS 和私有网络路由。理解这些组件，才能知道何时只需安装客户端、何时需要 VPS，以及怎样判断连接是否真正安全、高效。

本文以 2026 年 10 月的 NetBird 官方文档为基础，讨论 NetBird Cloud 和自托管版本的共同原理与主要功能。不同版本、套餐可能影响具体功能是否可用。

相关文章：

[内网穿透——使用公网 IPv4 自托管 NetBird 组建虚拟局域网](/posts/selfhost-netbird-ipv4/)\
[内网穿透——使用域名自托管 NetBird 组建虚拟局域网](/posts/selfhost-netbird-domain/)\
[内网穿透——注册 NetBird Cloud 并组建个人虚拟局域网](/posts/netbird-cloud-guide/)

## 一、NetBird 究竟解决什么问题

普通局域网内，两台设备通常可以直接通过各自的局域网 IP 访问。但一旦分处家庭宽带、校园网、移动网络和云服务器，不同设备的地址、NAT 和防火墙可能阻止彼此建立连接。

NetBird 在这些网络之上建立一个**加密的三层覆盖网络（Overlay Network）**：每台加入的设备称为 Peer，获得独立的 NetBird IP；只要访问策略允许，设备就能通过这个私有 IP 发起连接。

例如：

```text
Android（移动网络） ←→ NetBird ←→ Windows（家庭宽带）
                                  ←→ Linux VPS（云服务器）
```

实际文件数据不一定经过 NetBird 管理服务器。设备能够 P2P 直连时直接传输；无法直连时才通过 Relay。NetBird IP 与真实公网 IP、家庭局域网 IP 是不同的地址概念。

**适合的用途：** 远程桌面、WebDAV/SFTP、SSH、跨设备调用本地 API、访问内网管理页面、连接多地点私有资源，以及按需指定 VPN 互联网出口。

**不等于：** 自动同步文件、自动开启远程桌面、让所有局域网广播协议可用，或者安装后自动成为互联网代理服务器。这些功能需要其他软件或额外配置。

---

## 二、系统架构：控制面与数据面

NetBird 的主要组件分为四类：Client、Management、Signal、Relay。

| 组件 | 主要职责 | 是否承载用户实际业务流量 |
|---|---|---|
| Client（客户端） | 设备认证、创建 WireGuard 接口、应用网络和 DNS 配置 | 是，数据从客户端收发 |
| Management（管理服务） | 注册设备、管理用户、IP、公钥、策略与网络配置 | 通常不承载 Peer 间的业务流量 |
| Signal（信令服务） | 帮助 Peer 交换候选连接地址、协商直连 | 不承载文件等业务流量 |
| Relay（中继服务） | P2P 建立失败时转发 WireGuard 加密数据包 | 仅需要中继时承载转发流量 |

### 1. 控制面（Control Plane）

管理服务器保存设备注册信息、公钥、组和策略，将允许互联的 Peer 信息下发给各客户端；信令服务帮助 Peer 交换建立连接所需的候选网络地址。

控制面决定“谁可以连谁、如何找到对方”，而不是默认转发每一份文件。管理服务需要可用，才能正常注册新设备和接收变更；已有连接在控制面短暂不可达时是否保持，取决于会话、客户端和网络状况，不能把它当作完全无依赖的离线网络。

### 2. 数据面（Data Plane）

数据面负责实际传输 WebDAV 文件、RDP 画面、SSH 流量等。NetBird 客户端建立 WireGuard 隧道，设备间的隧道内容被加密。

直连时：

```text
设备 A ←—— WireGuard P2P ——→ 设备 B
         ↑ 管理与信令负责协调，不转发文件
```

中继时：

```text
设备 A ←—— 加密数据 ——→ Relay ←—— 加密数据 ——→ 设备 B
```

Relay 能转发流量，但不能解密设备间的 WireGuard 数据内容。不过中继和管理平台仍可能看到连接双方、时间、流量量级等元数据；**内容加密不等于完全匿名**。

---

## 三、WireGuard、NAT 穿透与 Relay

### 1. WireGuard 负责什么

WireGuard 是 VPN 隧道的加密及封装机制。NetBird 在此基础上增加身份管理、自动组网、密钥分发协同、NAT 穿透和策略控制。

每个 Peer 拥有自己的加密身份和公私钥。管理服务负责分发必要的 Peer 公钥与网络配置，不需要拿到用于解密 Peer 数据的 WireGuard 私钥。

### 2. 为什么要 NAT 穿透

家庭路由器、运营商 CGNAT 和移动网络通常会隐藏设备的实际地址。为了让两端直接通信，NetBird 使用 ICE/STUN 等技术发现可用地址与端口，再尝试通过 UDP 建立连接。

可把 STUN 理解为协助发现“自己从公网看起来是什么地址和端口”；Signal 协助双方交换地址候选；真正的业务数据仍通过 WireGuard 隧道传输。

P2P 并非必然成功。对称 NAT、严格防火墙、UDP 受限、部分校园网或企业网络都可能导致直连失败。

### 3. Relay 是否不安全

不是。Relay 只转发已经经过 WireGuard 加密的数据包，安全性与“是否经过中继”没有直接等同关系。主要代价是增加一次网络绕行：

- 延迟可能上升；
- 最大吞吐受中继带宽及双方至中继线路影响；
- 自托管 Relay 会消耗 VPS 的出站流量。

NetBird Cloud 提供多地域中继服务；自托管通常由自己的服务器承担中继。如果主要设备位于中国内地，实际速度还受地域、运营商、跨境线路影响，不能只根据云厂商名称推断。

Windows 或 Linux 上查看连接状态：

```bash
netbird status -d
```

重点观察 Management、Signal、Relay 可达性，以及各 Peer 的连接类型。**Relayed 是一种成功的连接方式，而不一定是故障。**

---

## 四、虚拟 IP、私有 DNS 与局域网边界

### 1. NetBird IP 与公网 IP

NetBird 默认从 `100.64.0.0/10` 地址空间分配覆盖网络地址，账户通常拥有自己的网段。一个地址只是示例：`100.80.12.34`。

| 地址类型 | 作用 |
|---|---|
| 公网 IPv4 | VPS 或家庭网络对互联网提供的地址 |
| 家庭 LAN IP（如 `192.168.1.10`） | 同一个家庭局域网内部通信 |
| NetBird IP（如 `100.80.12.34`） | NetBird 已授权设备之间的私有网络通信 |

NetBird IP 不会让设备自动拥有公网入口。其他互联网用户无法仅凭 NetBird IP 访问该设备；对方仍须处于同一受授权的虚拟网络中。

如果一台设备被删除并重新注册，NetBird IP 不保证保持不变；长期引用设备时应考虑 DNS 名称，但也要注意客户端平台的解析设置。

### 2. 自动 Peer 域名

NetBird 可以为设备生成类似 `windows-host.netbird.cloud` 的私有 Peer 域名，便于用名称代替固定 IP。该域名属于 NetBird 的私有解析体系，不等于将设备公开到互联网。

**容易忽略的限制：** 官方文档说明，Linux 默认会处理 NetBird Peer 域名解析；Windows、macOS 和移动设备如果未配置 Nameserver，可能不会自动启用 NetBird DNS。这时直接使用 NetBird IP 更稳妥。

### 3. DNS 设置

管理后台的 **DNS → Nameservers** 可以配置要下发给设备的 DNS 服务器、匹配域名（Split DNS）、默认 DNS（Primary Nameserver）和搜索域名（Search Domains）。

例如，只有 `home.internal` 交给家庭 DNS 解析，其余网站继续使用正常 DNS。错误的 DNS 规则可能让设备出现“隧道已连接但网页打不开”的现象。

### 4. 为什么不等于完整二层局域网

NetBird 主要是三层 IP 路由网络，不是把不同地点的以太网交换机直接拼接在一起。因此：

- 按明确 IP 访问 SSH、WebDAV、RDP 等 TCP/UDP 服务通常可以；
- 依赖广播、多播、mDNS 或其他二层自动发现的服务，不一定能被另一地点自动找到；
- 设备自动发现失败时，可以先尝试使用 NetBird IP 或明确配置私有 DNS。

---

## 五、Peers、Groups、Policies 与 Setup Keys

### 1. Peers：设备是什么

Peer 是加入 NetBird 的一个设备实例，可以是 Windows、Android、VPS、NAS、路由器，或其他安装了 NetBird 客户端的环境。

Dashboard → **Peers** 可查看设备在线状态、虚拟 IP、客户端版本、分组等信息。删除 Peer 是撤销该设备的组网身份，不等于从设备系统卸载应用。

### 2. Groups：把哪些设备归类

Group 是一组 Peer 的集合，例如：

- `personal-devices`：手机与笔记本；
- `home-servers`：家庭 Windows、NAS 网关；
- `cloud-servers`：云上 Linux VPS。

一个 Peer 可以加入多个 Group。Group 本身不放行访问，必须由策略指定谁访问谁。

### 3. Policies：谁能访问谁

Access Control Policy 用来源组（Source）、目标组（Destination）、协议、端口、方向等定义访问权限。无策略授权的 Peer 流量默认被拒绝；但**新建账户通常自带一个允许所有设备互访的 `Default` 策略**，因此初始体验相当于全互通网络。

例如，只允许手机和笔记本访问家庭 Windows 的 WebDAV：

| 选项 | 示例配置 |
|---|---|
| Source | `personal-devices` |
| Destination | `home-servers` |
| Protocol | TCP |
| Port | `8080` |
| Direction | 按需求选择 |

在 **Access Control → Groups** 建组、在 **Peers** 分配设备、在 **Access Control → Policies** 创建策略。验证新策略生效后，再停用默认全互通策略，否则旧策略仍可能授予宽泛权限。

策略允许流量后，目标设备自身的操作系统防火墙和服务监听端口仍会影响实际连接。**NetBird 的策略不是 Windows/Linux 防火墙的替代品。**

### 4. Setup Key：无交互注册设备

Setup Key 是一次性或可重复使用的预授权注册凭据，用于将新设备关联到 NetBird 网络，尤其适合无桌面的 VPS、脚本批量安装，以及手机浏览器回调不成功的情况。

在 **Settings → Setup Keys** 创建，推荐使用 One-off、短有效期，并按需设定自动分组。Linux 上可用：

```bash
sudo netbird up --setup-key '你的Setup-Key'
```

对于 NetBird Cloud，Android 使用 Setup Key 时，Management Server 填写 `https://api.netbird.io:443`；对于自托管，则填写自己的 HTTPS 管理地址。

**安全要点：** Setup Key 是注册凭据。泄露可能导致未经许可的设备加入。撤销或过期后，密钥不能继续注册新设备，但**不会自动断开此前已经注册成功的设备**；需另行删除不可信 Peer。

---

## 六、Networks：访问未安装 NetBird 的局域网设备

前面讲的是“每台设备都安装 NetBird 客户端”。如果目标是打印机、摄像头、家庭 NAS，或整个 `192.168.1.0/24` 子网，不一定能在目标设备上安装 NetBird。

这时使用 **Networks + Routing Peer（路由节点）**：在目标局域网中找一台已安装 NetBird、能够访问目标资源的机器，让它负责在虚拟网络和实际局域网之间转发。

```text
手机（NetBird Peer） → 加密隧道 → 家庭路由节点（NetBird Peer） → NAS 192.168.1.20
```

新版 Networks 的四个关键概念：

| 概念 | 含义 |
|---|---|
| Network | 对某个远端环境的逻辑分组，例如“家庭内网” |
| Resource | 允许访问的 IP、子网、域名或通配符域名 |
| Routing Peer | 连接 NetBird 和实际内网的网关设备 |
| Access Policy | 哪些来源设备能访问哪些 Resource |

示例操作思路：

1. 在家中一台长期在线的 Linux 或 Windows 上安装 NetBird，确认它能访问 `192.168.1.20`。
2. Dashboard → **Networks** 创建 `Home LAN`。
3. 添加 Resource `192.168.1.20/32`（只包含这一个 IP；如确实需要整个子网，再考虑 `192.168.1.0/24`）。
4. 将家庭机器指定为 Routing Peer，为授权的设备组建立 Resource Access Policy。
5. 从手机使用移动网络连接到 `192.168.1.20`，验证实际端口。

默认 Masquerade（地址伪装）可以简化返回路径；如果关闭伪装，则目标局域网还需要知道如何把响应包路由回 NetBird 的覆盖网段。

**安全区别：** Networks 中的 Resource 默认没有访问策略就无法访问；路由节点上的本机服务与它转发的 Resource 也可能需要分别授权。不要为了方便直接将整个家庭网段无条件开放给所有 Peer。

旧版的 **Routes** 用于通用子网路由；截至 2026 年 10 月，官方已将这类新配置迁移到 **Networks**，Routes 主要保留给 Exit Node。阅读旧教程时注意区分。

**加密边界：** 手机到 Routing Peer 的 NetBird 隧道由 WireGuard 加密；路由节点把包转发到普通局域网后的那一段是否加密，取决于目标应用是否使用 HTTPS、SSH 等协议，不能将它理解为从手机到任何无客户端 NAS 都一定端到端加密。

---

## 七、Exit Node：让某台设备成为互联网出口

默认 NetBird 只处理到私有 Peer 或已配置内部资源的流量，**普通互联网访问通常仍走设备当前的本地网络**。

Exit Node 是改变互联网出口的功能。指定一台拥有互联网访问能力的设备（比如香港 VPS）作为出口，其他设备可将默认路由 `0.0.0.0/0` 指向它：

```text
Android → NetBird 加密隧道 → VPS Exit Node → 互联网
```

网站看到的出口通常是 VPS 的公网 IP，而不是手机移动网络的公网地址。该 VPS 需要**安装 NetBird 客户端并注册为 Peer**；仅仅在 VPS 上运行 NetBird 自托管管理服务，并不会自动让它成为 Exit Node。

官方配置入口为：在 Dashboard → **Peers** 选定目标 Peer，点击 **Add Exit Node**，分配 Distribution Groups。若只想按需启用，建议关闭 **Auto Apply**，让客户端主动选择出口。

需要特别理解：

- **Auto Apply 开启：** 指定设备组可能立即改走 Exit Node；
- **Auto Apply 关闭：** 仅提供出口选项，客户端需要手动启用；
- **流量消耗：** 走出口的互联网流量会经过该 Peer，消耗 VPS 的出站额度和带宽；
- **网络范围：** `0.0.0.0/0` 也可能覆盖出口节点可达的内网资源，官方提供 Block LAN Access 或网络隔离措施减少此类风险；
- **隐私：** 从手机到 VPS 的 NetBird 隧道加密，但 VPS 到目标网站是否加密仍取决于 HTTPS 等应用层协议。

因此，**私有组网**与**自建 VPN 出口**是不同需求。只想手机访问家庭 WebDAV，不需要启用 Exit Node。

---

## 八、NetBird Cloud 与自托管的区别

| 维度 | NetBird Cloud | 自托管 NetBird |
|---|---|---|
| 管理账户 | 登录 NetBird Cloud | 可使用内置本地用户系统 |
| 管理服务 | 官方维护 | 自己维护 |
| Signal / Relay | 官方服务，提供多地域中继 | 自己部署及维护 |
| 域名、HTTPS | 不需要用户处理 | 通常需要自行配置 |
| 备份、升级、监控 | 平台负责基础设施 | 自行负责 |
| 设备数据传输 | 优先 P2P，失败走 Relay | 同样优先 P2P，失败走 Relay |
| 适合场景 | 少量设备、希望减少维护 | 需要控制管理服务器和数据驻留位置 |

NetBird Cloud 免费计划目前支持 5 用户、100 台设备，包含核心组网和访问控制；部分企业功能（例如高级合规审计、设备审批、姿态检查等）可能需要更高套餐。自托管也不意味着所有 Cloud 商业功能都免费开放。

**自托管的成本不只是 VPS 月费**：还包括公网访问质量、域名与证书、数据备份、更新、安全维护和中继流量。若只是为少量自有设备组网，Cloud 通常更省事；有明确基础设施控制需求时，自托管才更有价值。

---

## 九、安全、性能与常见误区

### 1. 身份和授权不是一回事

通过 SSO 或 Setup Key 成功注册只说明设备加入了账户。能否访问某台机器，还需要 NetBird 策略允许；能否访问机器上的服务，还要看系统防火墙和应用监听配置。

### 2. P2P 不代表无中心服务

P2P 描述的是业务数据连接路径，不表示完全没有控制面。管理与信令服务仍在设备发现、注册、策略变更等阶段发挥作用。

### 3. 连接成功不代表速度一定快

速度主要由两端带宽、网络线路、P2P 或 Relay、CPU 加密性能、MTU 和目标应用决定。自托管 VPS 的配置升级，不会直接提升已经成功 P2P 的两台设备之间的传输带宽。

### 4. 连接到 NetBird 不代表全局翻墙

未启用 Exit Node 时，一般互联网流量仍走本机网络。不要把 NetBird 的“Connected”状态与“所有流量都从 VPS 出口”画等号。

### 5. 看到域名不代表能直接解析

NetBird 自动生成 Peer 域名，但 Windows 和手机上可能需要 DNS 相关配置；排错时优先使用明确的 NetBird IP。

### 6. 默认策略可能过于宽松

新建网络自带的全互通策略有利于测试，但如果加入他人的设备、敏感服务器或多套环境，应按最小权限原则收紧 Source、Destination、Protocol 和 Port。

### 7. 不要公开泄露 Setup Key

Setup Key 用于批准新设备加入，不应作为普通文本长期留在公共部署脚本中。对于批量部署的可复用 Key，设置用量限制和短过期时间，并定期检查 Peers。

---

## 十、排障方法与实践顺序

建议按“网络接入 → Peer 可见 → 策略授权 → 主机端口 → 应用协议”的顺序排查，不要直接从 VPS 性能或重装开始。

| 现象 | 常见原因或处理方式 |
|---|---|
| 客户端连不上管理服务器 | SSO、域名、TLS、管理服务或基础网络问题 |
| Peer 在线但找不到目标 | 对端离线、策略未授权或更新未生效 |
| Ping 不通，但服务可用 | 对端防火墙拒绝 ICMP；应用 TCP 连通性更有参考价值 |
| WebDAV / RDP 无法连接 | 服务未监听 NetBird 地址、系统防火墙未放行或端口写错 |
| P2P 长期变为 Relay | NAT、UDP、防火墙或运营商网络限制 |
| 开启 Exit Node 后无法上网 | 出口节点转发/NAT、DNS、策略或路由冲突 |
| 加入手机后与其他 VPN 冲突 | Android 通常同一时间只有一个系统 VPN 接口 |
| 私有设备域名无法解析 | 客户端 DNS 管理状态或 Nameserver 未配置 |
| 远程 LAN 不可访问 | Networks Resource/Policy、Routing Peer、Masquerade 和返回路由 |

先查看状态：

```bash
netbird status -d
```

如需要更深入诊断，可生成调试包：

```bash
netbird debug bundle -A -S
```

调试包可能包含设备标识、网络配置、路由及日志，分享前需要检查敏感信息。

**建议实践顺序：** 先只连接 Windows 与 Android，使用 NetBird IP 访问一个现成服务；确认 P2P/Relay 状态后，再根据真实需求增加 Groups/Policies、Networks 或 Exit Node。NetBird 最适合作为私有网络底层，而不是为使用每个功能而额外部署组件。

---

## 参考资料

1. [NetBird 的工作原理](https://docs.netbird.io/about-netbird/how-netbird-works)
2. [NetBird Cloud 与自托管比较](https://docs.netbird.io/about-netbird/self-hosted-vs-cloud)
3. [NetBird Cloud 计划及额度](https://docs.netbird.io/manage/settings/plans-and-billing)
4. [Groups 与 Access Policies](https://docs.netbird.io/manage/access-control/manage-network-access)
5. [Setup Keys 原理与管理](https://docs.netbird.io/manage/peers/register-machines-using-setup-keys)
6. [Networks：资源及路由节点](https://docs.netbird.io/manage/networks)
7. [Routes 现状及迁移建议](https://docs.netbird.io/manage/network-routes)
8. [Exit Node 配置与安全限制](https://docs.netbird.io/use-cases/remote-access/exit-nodes)
9. [NetBird DNS 功能](https://docs.netbird.io/manage/dns)
10. [Relay 连接排障](https://docs.netbird.io/help/troubleshooting-relayed-connections)
11. [客户端故障排查](https://docs.netbird.io/help/troubleshooting-client)
12. [Android 客户端配置](https://docs.netbird.io/get-started/install/android)
