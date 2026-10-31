---
title: 内网穿透——使用域名自托管 NetBird 组建虚拟局域网
slug: selfhost-netbird-domain
date: 2026/10/31 02:14:34
updated: 2026/10/31 02:14:34
categories:
  - 技术
tags:
  - NetBird
  - Linux
  - Cloudflare
  - Docker
  - 内网穿透
description: 记录通过域名在 Linux云服务器 上自托管 NetBird 的完整过程，包括 Docker 安装、Cloudflare DNS 配置、自动 HTTPS、多设备接入、故障排查及服务器迁移。
---

NetBird 是一款基于 WireGuard 的开源组网软件，可以将不同网络中的设备连接为私有网络，优先通过 P2P 直连传输数据，直连失败时使用加密中继。

本文记录在 Linux云服务器 上通过**域名和官方安装脚本**部署 NetBird，实现 Windows、Android 等设备跨网络互访。

与纯 IPv4 部署方案不同，域名版本采用 NetBird 官方推荐的 Traefik 方案，自动管理 HTTPS 证书。后续更换 服务器或VPS 时，只需迁移管理数据并更新 DNS，通常不需要重新注册客户端。

PS：真是踩了无数坑，在电脑前坐了几个小时，终于将几个方案全部跑通了，希望对你有所帮助。

相关文章：

[内网穿透——使用公网 IPv4 自托管 NetBird 组建虚拟局域网](/posts/selfhost-netbird-ipv4/)\
[内网穿透——注册 NetBird Cloud 并组建个人虚拟局域网](/posts/netbird-cloud-guide/)\
[内网穿透——NetBird 功能与组网原理详解](/posts/netbird-architecture-and-features/)

## 一、部署准备

### 1. 环境要求

| 项目 | 配置 |
|---|---|
| 服务器 | Linux 服务器 |
| 操作系统 | Ubuntu 22.04 / 24.04 LTS |
| 最低配置 | 1 vCPU、2 GB 内存 |
| 网络 | 公网 IPv4 |
| 域名 | 已接入 Cloudflare DNS 的域名 |
| 容器环境 | Docker Engine + Compose v2 |
| HTTPS | Traefik + Let's Encrypt |
| NetBird | 官方安装脚本、内置身份认证 |

本文以 Ubuntu 为例，其他 Linux 发行版需要调整软件安装命令。

服务器需要开放以下端口：

| 协议 | 端口 | 用途 |
|---|---|---|
| TCP | 22 | SSH 远程管理 |
| TCP | 80 | Let's Encrypt 证书验证 |
| TCP | 443 | HTTPS、管理、信令及中继 |
| UDP | 3478 | STUN NAT 穿透 |

在云服务器控制台的防火墙或安全组中开放相应端口。SSH 建议限制为自己的管理 IP。

如果服务器启用了 UFW 等系统防火墙，也需要配置相应规则。

检查系统：

```bash
cat /etc/os-release
```

```bash
free -h
```

检查端口占用：

```bash
sudo ss -lntup | grep -E ':(80|443|3478)\b' || true
```

**注意：** 本文使用内置 Traefik，必须确保服务器的 TCP 80 和 443 没有被其他 Web 服务占用。

### 2. 配置 Cloudflare DNS

进入 Cloudflare Dashboard，选择域名，打开 DNS → Records，添加一条 A 记录。

![][1]

假设使用 `example.com`，配置如下：

| 字段 | 内容 |
|---|---|
| Type | A |
| Name | `nb` |
| IPv4 address | 云服务器的公网 IPv4 |
| Proxy status | DNS only（灰色云朵） |
| TTL | Auto |

最终管理地址为：

```text
https://nb.example.com
```

其中 `nb.example.com` 只是示例，后续全部替换为自己的实际子域名。

**必须选择 DNS only。** NetBird 需要直接建立 HTTPS、gRPC 和其他网络连接，不应使用 Cloudflare 常规 HTTP 反向代理处理这些流量。

暂时不需要添加通配符 DNS 记录，因为本文不启用 NetBird Proxy 功能。

完成 DNS 配置后，等待解析生效。

---

## 二、安装 Docker

以下命令均在 服务器 终端执行。

### 1. 切换 root

```bash
sudo -i
```

后续命令默认以 root 身份执行。

### 2. 安装基础工具

```bash
apt update && apt install -y ca-certificates curl gnupg jq
```

其中 `curl` 用于下载文件，`jq` 用于处理 JSON 数据，都是 NetBird 官方安装所需的基础工具。

### 3. 添加 Docker 官方软件源

创建 GPG 密钥目录：

```bash
install -m 0755 -d /etc/apt/keyrings
```

下载 Docker 官方签名密钥：

```bash
curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
```

设置读取权限：

```bash
chmod a+r /etc/apt/keyrings/docker.asc
```

添加 Docker 官方 APT 软件源：

```bash
printf 'Types: deb\nURIs: https://download.docker.com/linux/ubuntu\nSuites: %s\nComponents: stable\nArchitectures: %s\nSigned-By: /etc/apt/keyrings/docker.asc\n' "$(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}")" "$(dpkg --print-architecture)" > /etc/apt/sources.list.d/docker.sources
```

这一步会根据当前 Ubuntu 版本和 CPU 架构生成 Docker 软件源配置，无需手动填写版本代号。

### 4. 安装 Docker

```bash
apt update && apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

启动 Docker 并设置开机自启：

```bash
systemctl enable --now docker
```

验证安装：

```bash
docker --version && docker compose version && systemctl is-active docker
```

正常情况下，会显示 Docker、Compose 的版本号以及 `active`。

如果已经安装 Docker Engine 和 Compose v2，可以跳过整个安装部分。

---

## 三、部署 NetBird

### 1. 设置域名和邮箱

首先设置管理域名：

```bash
export NETBIRD_DOMAIN="nb.example.com"
```

设置 Let's Encrypt 邮箱：

```bash
export NETBIRD_LETSENCRYPT_EMAIL="your@email.com"
```

将两处内容替换为自己的实际域名和邮箱。

**邮箱用于 Let's Encrypt 证书账户及通知，不需要重新注册邮箱。** 可以使用现有 Gmail 等邮箱地址。

查看变量是否正确：

```bash
echo "$NETBIRD_DOMAIN" && echo "$NETBIRD_LETSENCRYPT_EMAIL"
```

不要在域名变量中填写 `https://` 或端口号，只填写完整域名。

### 2. 检查 DNS

使用系统 DNS 查询域名：

```bash
getent ahostsv4 "$NETBIRD_DOMAIN"
```

应返回服务器对应的公网 IPv4。

如果返回的不是 服务器公网 IP，先检查 Cloudflare DNS 是否填写正确，以及代理状态是否设置为 DNS only。

不要在解析错误的情况下继续申请 HTTPS 证书。

### 3. 下载官方安装脚本

创建部署目录：

```bash
mkdir -p /opt/netbird && cd /opt/netbird
```

下载脚本：

```bash
curl -fsSLo getting-started.sh https://github.com/netbirdio/netbird/releases/latest/download/getting-started.sh
```

可以先查看脚本内容：

```bash
less getting-started.sh
```

### 4. 执行部署

```bash
NETBIRD_REVERSE_PROXY_TYPE=0 NETBIRD_ENABLE_PROXY=false NETBIRD_NON_INTERACTIVE=true bash getting-started.sh
```

参数说明：

| 参数 | 作用 |
|---|---|
| `NETBIRD_REVERSE_PROXY_TYPE=0` | 使用官方内置 Traefik |
| `NETBIRD_ENABLE_PROXY=false` | 不启用 NetBird 应用反向代理 |
| `NETBIRD_NON_INTERACTIVE=true` | 无交互自动安装 |

前面通过 `export` 设置的域名和邮箱会传递给安装脚本。

**这里的 NetBird Proxy 与 Traefik 不是同一个组件。**

Traefik 负责 NetBird 管理服务的 HTTPS 入口；NetBird Proxy 用于将内网应用有选择地暴露到互联网。本文只需要私有组网，因此关闭后者。

安装脚本会自动：

1. 生成 NetBird 管理及身份认证配置。
2. 创建 Docker Compose 文件。
3. 部署 NetBird Server、Dashboard 和 Traefik。
4. 通过 Let's Encrypt 申请 HTTPS 证书。
5. 启动所有服务。

不需要另外安装 Caddy、Certbot 或手动配置证书续期。

### 5. 检查运行状态

进入部署目录：

```bash
cd /opt/netbird
```

查看容器：

```bash
docker compose ps
```

正常情况下，主要容器包括：

- `netbird-server`：管理、信令、Relay、STUN 及内置身份认证。
- `dashboard`：Web 管理界面。
- `traefik`：HTTPS 入口及自动证书管理。

查看日志：

```bash
docker compose logs --tail=100
```

验证 HTTPS：

```bash
curl -I "https://${NETBIRD_DOMAIN}"
```

验证 NetBird 身份认证接口：

```bash
curl -fsS "https://${NETBIRD_DOMAIN}/oauth2/.well-known/openid-configuration" | jq '{issuer, authorization_endpoint, token_endpoint}'
```

正常情况下会返回认证接口信息。

其中 `issuer` 应指向：

```text
https://nb.example.com/oauth2
```

此处无需使用 `curl -k` 跳过证书验证。如果证书验证失败，应先检查 DNS、80/443 端口及 Traefik 日志。

---

## 四、初始化管理员与设备组网

### 1. 创建管理员

浏览器访问：

```text
https://nb.example.com/setup
```

首次访问时，填写邮箱、名称和密码，创建管理员账户。

此账户使用 NetBird 内置身份认证，不需要 NetBird Cloud 或其他身份认证平台。

管理员创建完成后，`/setup` 将不再用于初始注册，后续通过正常登录页面进入 Dashboard。

### 2. Windows 接入

安装 [NetBird Windows 客户端](https://docs.netbird.io/get-started/install/windows)。

打开客户端，选择自托管服务器，填写：

```text
https://nb.example.com:443
```

使用刚创建的管理员账户完成登录。

连接后，在 PowerShell 中查看状态：

```powershell
netbird status -d
```

可以查看当前设备分配的 NetBird IP、Peer 状态以及实际连接方式。

### 3. Android 接入

安装 [NetBird Android 客户端](https://docs.netbird.io/get-started/install/android)。

打开应用，进入左上角菜单 → **Change Server**，填写管理服务器地址：

```text
https://nb.example.com:443
```

保存后返回主界面，点击连接，允许 Android 创建 VPN 连接，并按照提示完成浏览器认证。

需要注意：Change Server 会清除当前 Android 设备已有的 NetBird 配置。

### 4. Android 使用 Setup Key

如果 Android 无法完成浏览器登录验证，可以使用 Setup Key 直接注册设备。

首先进入 NetBird Dashboard：

**Settings → Setup Keys → Create Setup Key**

创建时建议选择：

- **One-off：** 一次性使用。
- **Expiration：** 设置较短的有效期。
- **Auto-groups：** 根据需要分配设备组。

生成后复制 Setup Key。

![][2]

随后在 Android：

1. 打开 NetBird → Change Server。
2. 填写 `https://nb.example.com:443`。
3. 点击 **+ Add this device with a setup key**。
4. 粘贴刚生成的 Setup Key。
5. 点击 Change 保存。
6. 返回主界面，点击连接并允许 VPN 权限。

Setup Key 可以跳过浏览器身份认证过程，但**不能绕过 HTTPS 证书验证**。如果服务器证书错误或域名不匹配，仍然需要先修复 HTTPS。

一次性 Setup Key 使用后不能再用于注册其他设备。

### 5. 测试设备互通

在 Dashboard 的 Peers 页面查看设备状态及 NetBird IP。

例如 Windows 运行 WebDAV，监听端口 `8080`，Android 可以访问：

```text
http://Windows的NetBird-IP:8080
```

连接成功需要满足：

- 双方已经连接 NetBird。
- NetBird 访问策略允许通信。
- 目标设备防火墙允许访问。
- 对应服务监听 NetBird IP 或其他可访问的网络接口。

NetBird 默认安装通常包含允许设备互访的策略。若后续增加其他用户或设备，应根据需要限制可访问的设备组和端口。

NetBird 提供三层私有网络，可以直接通过私有 IP 访问 WebDAV、SSH、远程桌面等服务，但不保证所有局域网广播发现功能正常。

---

## 五、日常维护与故障排查

### 1. 常用命令

进入 NetBird 目录：

```bash
cd /opt/netbird
```

查看容器：

```bash
docker compose ps
```

查看日志：

```bash
docker compose logs --tail=100
```

重启服务：

```bash
docker compose restart
```

停止服务：

```bash
docker compose stop
```

启动服务：

```bash
docker compose up -d
```

查看 Traefik 日志：

```bash
docker compose logs --tail=100 traefik
```

检查 Compose 配置：

```bash
docker compose config --quiet
```

不要随意执行 `docker compose down -v`，它可能删除持久化数据卷，导致设备、账户和策略丢失。

### 2. HTTPS 证书申请失败

常见原因包括：

- Cloudflare DNS 开启了橙色云朵代理。
- DNS 尚未指向正确的 云服务器公网 IP。
- 云服务器 TCP 80 或 443 未开放。
- Nginx、Caddy 等程序占用了端口。
- Let's Encrypt 证书申请受到速率限制。

可以查看 Traefik 日志：

```bash
docker compose logs --tail=100 traefik
```

证书由 Traefik 自动申请和续期，一般不需要手动操作。

### 3. Dashboard 无法登录

先检查 NetBird Server：

```bash
docker compose logs --tail=100 netbird-server
```

验证身份认证接口：

```bash
curl -fsS "https://${NETBIRD_DOMAIN}/oauth2/.well-known/openid-configuration"
```

如果接口异常，重点检查 HTTPS、域名配置和服务日志。

不要在已有账户和数据库的情况下重新执行初始化脚本来解决登录问题。

### 4. Android 无法认证

如果是浏览器跳转失败、授权回调失败，可以按照第四部分使用 Setup Key 注册。

如果提示 TLS、SSL、证书无效或无法连接服务器，则需要先检查证书和网络；Setup Key 无法解决这类问题。

### 5. 设备在线但无法互访

先确认双方 NetBird IP 和 Peers 状态，再检查：

- NetBird 访问策略。
- Windows 或 Linux 防火墙。
- 应用监听地址。
- 对应 TCP/UDP 端口。
- 客户端是否启用了其他 VPN。

Android 通常不能同时运行两个使用系统 VPN 接口的客户端，例如 NetBird 和另一款 VPN 应用。

### 6. P2P 失败或连接速度慢

NetBird 优先尝试 WireGuard P2P 直连，失败时使用 Relay 中继。

在 Windows 或 Linux 客户端执行：

```bash
netbird status -d
```

检查实际连接方式。

如果长期通过 Relay，需检查两端 NAT、防火墙、UDP 网络条件及服务器中继性能。

P2P 能否成功由实际网络环境决定，并不是 NetBird Server 有公网 IPv4 就一定能建立直连。

---

## 六、备份与服务器迁移

域名方案相比纯 IPv4 的主要优势，是以后更换 服务器 时可以继续使用原来的管理地址。

只要保留原有 NetBird 数据和密钥，并将域名解析到新 服务器，客户端通常可以自动重新连接，不需要逐台修改 Management Server。

### 1. 备份旧服务器

进入部署目录：

```bash
cd /opt/netbird
```

停止服务，保证数据库备份一致性：

```bash
docker compose stop
```

创建备份目录并复制配置：

```bash
mkdir -p backup && cp docker-compose.yml config.yaml dashboard.env backup/
```

备份 NetBird 管理数据库及密钥：

```bash
docker compose cp -a netbird-server:/var/lib/netbird/ backup/
```

这里的 `/var/lib/netbird` 包含账户、Peer、策略、Setup Key 和管理数据，是迁移过程中最重要的部分。

重新启动旧服务器：

```bash
docker compose start
```

打包备份：

```bash
tar czf /root/netbird-backup.tar.gz -C backup .
```

限制备份文件权限：

```bash
chmod 600 /root/netbird-backup.tar.gz
```

将 `/root/netbird-backup.tar.gz` 安全保存到本地或其他设备。

备份文件包含敏感密钥，不应公开上传，也不应提交到 Git 仓库。

本文没有启用 NetBird Proxy 或 CrowdSec；如果实际部署了这些组件，还需要按照官方备份文档保存对应配置和数据卷。

### 2. 新服务器环境准备

在新服务器上：

1. 安装 Docker Engine 和 Compose，方法同第二部分。
2. 开放 TCP 80、443 及 UDP 3478。
3. 将备份文件上传到 `/root/netbird-backup.tar.gz`。
4. 尽量使用与旧服务器相同的 NetBird 镜像版本。

**不需要重新运行 NetBird 初始化脚本，也不要创建新管理员。**

### 3. 恢复配置及数据库

创建目录并解压备份：

```bash
mkdir -p /opt/netbird /opt/netbird-restore && tar xzf /root/netbird-backup.tar.gz -C /opt/netbird-restore
```

恢复配置文件：

```bash
cp /opt/netbird-restore/docker-compose.yml /opt/netbird-restore/config.yaml /opt/netbird-restore/dashboard.env /opt/netbird/
```

进入部署目录：

```bash
cd /opt/netbird
```

检查 Compose 配置：

```bash
docker compose config --quiet
```

创建 NetBird Server 容器和数据卷，暂不启动：

```bash
docker compose create netbird-server
```

恢复原有数据库及密钥：

```bash
docker compose cp -a /opt/netbird-restore/netbird/. netbird-server:/var/lib/netbird/
```

此时不要急着启动，需要先确认新服务器的端口和 DNS 切换准备完成。

### 4. 切换 Cloudflare DNS

回到 Cloudflare DNS 页面，将原有 A 记录从旧云服务器公网 IP 修改为新云服务器公网 IP。

例如：

| 字段 | 内容 |
|---|---|
| Type | A |
| Name | `nb` |
| IPv4 address | 新云服务器公网 IP |
| Proxy status | DNS only |
| TTL | Auto |

**域名保持不变，只更换 DNS 对应的公网 IP。**

切换过程中建议停止旧服务器的 NetBird 服务，避免两套拥有相同管理数据的服务器同时运行。

然后在新云服务器启动：

```bash
cd /opt/netbird && docker compose up -d
```

Traefik 会根据原有域名自动申请或续期证书。此前没有备份的 Traefik 证书卷可以重新创建，无需重新生成 NetBird 管理数据库。

检查运行状态：

```bash
docker compose ps
```

检查管理接口：

```bash
curl -fsS "https://nb.example.com/oauth2/.well-known/openid-configuration" | jq '{issuer}'
```

确认 Dashboard 能正常登录，并且原来的 Peers、用户和策略仍然存在。

等 DNS 缓存更新后，客户端通常会重新连接到新云服务器，而无需重新注册。

### 5. 迁移完成后

确认以下项目：

- Dashboard 可以正常访问。
- 原账户和设备仍然存在。
- Windows、Android 能够重新连接。
- 设备之间仍可通过 NetBird IP 互访。
- Traefik HTTPS 证书正常。
- Relay 和 STUN 服务正常工作。

确认迁移成功后，再释放旧云服务器。

如果服务器升级还涉及 NetBird 大版本变化，先查看官方升级文档，避免同时更换服务器和升级核心组件导致问题难以定位。

---

## 七、注意事项

1. **使用独立子域名。** 建议为 NetBird 单独分配 `nb.example.com`，避免与其他网站服务混用。
2. **Cloudflare 选择 DNS only。** 这里仅使用 Cloudflare DNS，不使用其 HTTP 反向代理。
3. **HTTPS 由 Traefik 管理。** 不需要另行安装 Caddy、Certbot，也不需要手动配置证书续期。
4. **邮箱可以使用现有地址。** Let's Encrypt 和 NetBird 管理员不要求重新注册新的邮箱服务。
5. **NetBird Server 不一定承担设备间流量。** P2P 成功时，设备直接通信；失败时可能经云服务器中继。
6. **定期备份数据库和密钥。** 只有安装脚本和 Docker Compose 文件，不能恢复原有设备网络。
7. **域名使云服务器迁移更简单。** 保持管理域名不变，可以避免像纯 IPv4 方案那样逐台修改客户端连接地址。

对于少量个人设备，使用 Docker + NetBird + 内置 Traefik 即可实现跨网络私有组网，不需要额外部署数据库、第三方身份认证平台或 VPN 控制面。

---

## 参考资料

1. [NetBird 官方自托管部署](https://docs.netbird.io/selfhosted/selfhosted-quickstart)
2. [NetBird 官方安装脚本](https://github.com/netbirdio/netbird/blob/main/infrastructure_files/getting-started.sh)
3. [NetBird 配置文件说明](https://docs.netbird.io/selfhosted/maintenance)
4. [NetBird 备份与恢复](https://docs.netbird.io/selfhosted/maintenance/backup)
5. [NetBird 自托管升级](https://docs.netbird.io/selfhosted/maintenance/upgrade)
6. [NetBird Setup Key](https://docs.netbird.io/manage/peers/register-machines-using-setup-keys)
7. [Docker Ubuntu 官方安装](https://docs.docker.com/engine/install/ubuntu/)
8. [NetBird Windows 客户端](https://docs.netbird.io/get-started/install/windows)
9. [NetBird Android 客户端](https://docs.netbird.io/get-started/install/android)

[1]: /images/uploads/2026/10/2026-10-31_13-30-37.webp
[2]: /images/uploads/2026/10/2026-10-31_02-07-36.webp



