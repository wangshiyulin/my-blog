---
title: 内网穿透——使用公网 IPv4 自托管 NetBird 组建虚拟局域网
slug: selfhost-netbird-ipv4
date: 2026/10/31 01:41:52
updated: 2026/10/31 02:04:00
categories:
  - 技术
tags:
  - NetBird
  - Linux
  - Docker
  - 内网穿透
description: 记录在 Linux云服务器 上通过公网 IPv4 部署 NetBird 的完整过程，包括 Docker 安装、HTTPS 配置、多设备接入、证书续期及服务器迁移。
---

NetBird 是一款基于 WireGuard 的开源组网软件，支持多设备组成私有网络，优先建立 P2P 连接，直连失败时通过中继传输。

本文记录在腾讯云 Linux云服务器 上自托管 NetBird 的部署过程，使用**公网 IPv4 代替域名**，不依赖 NetBird Cloud 或第三方身份认证服务。后续更换云服务器时，也可以复用部署流程或迁移原有网络。

需要说明：NetBird 官方自托管 Quickstart 仍以域名和 HTTPS 为标准部署方式。本文使用官方安装脚本的 `use-ip` 模式，再通过 Caddy 和 Let's Encrypt IP 证书补充 HTTPS，属于定制部署，相关配置需随 NetBird 版本变化进行核对。

本文很多部分都跟另一篇文章[内网穿透——使用域名自托管 NetBird 组建虚拟局域网](/selfhost-netbird-domain)类似。

相关文章：

[内网穿透——使用域名自托管 NetBird 组建虚拟局域网](/selfhost-netbird-domain)\
[内网穿透——注册 NetBird Cloud 并组建个人虚拟局域网](/netbird-cloud-guide)\
[内网穿透——NetBird 功能与组网原理详解](/netbird-architecture-and-features)

## 一、部署准备

### 1. 环境要求

| 项目 | 配置 |
|---|---|
| 服务器 | 腾讯云 Linux云服务器 |
| 操作系统 | Ubuntu 22.04 / 24.04 LTS |
| 最低配置 | 1 vCPU、2 GB 内存 |
| 网络 | 公网 IPv4 |
| 容器环境 | Docker Engine + Compose v2 |
| HTTPS | Caddy + Certbot |
| NetBird | 官方安装脚本、内置身份认证 |

本文命令以 Ubuntu 为例，其他 Linux 发行版需要调整软件安装部分。

服务器至少开放以下端口：

| 协议 | 端口 | 用途 |
|---|---|---|
| TCP | 22 | SSH 远程管理 |
| TCP | 80 | HTTPS 证书验证 |
| TCP | 443 | NetBird 管理、信令、中继 |
| UDP | 3478 | STUN NAT 穿透 |

在腾讯云 Lighthouse 防火墙或 CVM 安全组中添加规则。SSH 端口建议仅允许自己的管理 IP 访问，其他业务端口根据需要开放。

这里的 TCP 443 是客户端访问管理服务的主要入口；UDP 3478 用于 STUN，帮助设备判断 NAT 类型并尝试 P2P 连接。**云平台安全组与 Linux 本机防火墙是两层独立限制**，两者都要检查。

检查系统环境：

```bash
cat /etc/os-release && free -h
```

确认 80、443 端口没有被其他服务占用：

```bash
sudo ss -lntup | grep -E ':(80|443|3478)\b' || true
```

### 2. 组件说明

- **NetBird Server：** 管理设备、认证、信令、Relay 和 STUN。
- **NetBird Dashboard：** Web 管理界面。
- **Docker Compose：** 管理 NetBird 容器。
- **Caddy：** 反向代理，统一提供 HTTPS 入口。
- **Certbot：** 申请和自动续期公网 IPv4 HTTPS 证书。

---

## 二、安装 Docker

以下命令均在云服务器终端执行。

首先切换 root：

```bash
sudo -i
```

以下命令默认以 root 身份执行；这是为了避免每条安装命令都重复添加 `sudo`。

安装基础工具：

```bash
apt update && apt install -y ca-certificates curl gnupg jq openssl snapd
```

创建 Docker 密钥目录：

```bash
install -m 0755 -d /etc/apt/keyrings
```

下载官方 GPG 密钥：

```bash
curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
```

设置权限：

```bash
chmod a+r /etc/apt/keyrings/docker.asc
```

添加 Docker 官方 APT 软件源（APT 是 Ubuntu 的软件包管理工具；添加软件源后才能直接安装和更新 Docker 官方版本）：

```bash
printf 'Types: deb\nURIs: https://download.docker.com/linux/ubuntu\nSuites: %s\nComponents: stable\nArchitectures: %s\nSigned-By: /etc/apt/keyrings/docker.asc\n' "$(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}")" "$(dpkg --print-architecture)" > /etc/apt/sources.list.d/docker.sources
```

安装 Docker Engine 和 Compose：

```bash
apt update && apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

启动并设置开机自启：

```bash
systemctl enable --now docker
```

验证：

```bash
docker --version && docker compose version && systemctl is-active docker
```

应显示 Docker、Compose 版本以及 `active`。

---

## 三、配置公网 IPv4 和 HTTPS

### 1. 设置公网地址

在腾讯云控制台查询云服务器的公网 IPv4，并设置变量：

```bash
export PUBLIC_IP="你的公网IPv4"
```

验证：

```bash
echo "$PUBLIC_IP"
```

后续操作统一使用 `$PUBLIC_IP`，避免在每条命令中重复填写地址。`export` 只在当前 Shell 会话有效，重新登录服务器后需要再次设置。

部分云服务器通过 NAT 映射公网地址，因此操作系统网卡上显示的 IP 不一定是实际公网 IP，应以云平台控制台为准。

### 2. 安装 Caddy

安装依赖：

```bash
apt install -y debian-keyring debian-archive-keyring apt-transport-https
```

导入 Caddy 软件源密钥：

```bash
curl -1fsSL https://dl.cloudsmith.io/public/caddy/stable/gpg.key | gpg --dearmor --yes -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
```

添加软件源：

```bash
curl -1fsSL https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt -o /etc/apt/sources.list.d/caddy-stable.list
```

安装 Caddy：

```bash
chmod a+r /usr/share/keyrings/caddy-stable-archive-keyring.gpg /etc/apt/sources.list.d/caddy-stable.list && apt update && apt install -y caddy
```

暂时停止 Caddy，释放端口：

```bash
systemctl stop caddy
```

### 3. 安装 Certbot

启用 Snap：

```bash
systemctl enable --now snapd.socket
```

安装 Certbot：

```bash
snap install --classic certbot
```

检查版本：

```bash
/snap/bin/certbot --version
```

本文使用支持 IPv4 证书的 Certbot 5.4 或更新版本。

### 4. 申请 IP 地址证书

Let's Encrypt 已支持为公网 IPv4 签发受信任的 HTTPS 证书，无需域名。

执行：

```bash
/snap/bin/certbot certonly --standalone --preferred-profile shortlived --ip-address "$PUBLIC_IP" --agree-tos --register-unsafely-without-email --non-interactive
```

其中 `--register-unsafely-without-email` 表示不提供证书账户联系邮箱，代价是无法接收相关邮件通知。`--standalone` 表示 Certbot 临时监听 TCP 80 完成验证，因此申请时该端口不能被其他程序占用。

证书申请成功后，主要文件位于：

```text
/etc/letsencrypt/live/公网IP/fullchain.pem
/etc/letsencrypt/live/公网IP/privkey.pem
```

**注意：IP 证书有效期为 160 小时，约 6 天 16 小时，必须配置自动续期。** 证书与公网 IP 绑定，之后更换云服务器的公网 IP 时需要重新申请，不能继续使用旧 IP 的证书。

---

## 四、安装 NetBird

### 1. 下载官方安装脚本

创建部署目录：

```bash
mkdir -p /opt/netbird && cd /opt/netbird
```

下载脚本：

```bash
curl -fsSLo getting-started.sh https://github.com/netbirdio/netbird/releases/latest/download/getting-started.sh
```

可先检查脚本内容：

```bash
less getting-started.sh
```

### 2. 执行初始化

```bash
NETBIRD_DOMAIN=use-ip NETBIRD_REVERSE_PROXY_TYPE=4 NETBIRD_BIND_LOCALHOST_ONLY=true NETBIRD_TRUSTED_PEERS=127.0.0.1/32 NETBIRD_NON_INTERACTIVE=true bash getting-started.sh
```

参数说明：

| 参数 | 作用 |
|---|---|
| `use-ip` | 使用 IP 地址部署 |
| `REVERSE_PROXY_TYPE=4` | 外部 Caddy |
| `BIND_LOCALHOST_ONLY=true` | 后端仅绑定本机 |
| `TRUSTED_PEERS` | 设置可信反向代理来源 |
| `NON_INTERACTIVE=true` | 无交互运行 |

`TRUSTED_PEERS` 决定 NetBird 信任哪些反向代理传来的真实客户端 IP 信息，它不是允许访问 NetBird 的设备列表。如果 Docker 的端口转发使 NetBird 看到的是 Docker 网桥地址，需要按实际代理来源调整；**不要直接设为 `0.0.0.0/0`**，否则可能信任来自任意地址的伪造转发头。

安装完成后，主要配置文件位于：

```text
/opt/netbird/
├── docker-compose.yml
├── config.yaml
├── dashboard.env
└── caddyfile-netbird.txt
```

NetBird 的 IP 模式默认生成 HTTP 地址，下一步改为 HTTPS。此时不要直接使用 HTTP 管理入口登录账户。

### 3. 修改公开访问地址

读取脚本生成的服务器 IP：

```bash
cd /opt/netbird && OLD_IP=$(sed -n 's/^[[:space:]]*exposedAddress: "http:\/\/\([^:]*\):80".*/\1/p' config.yaml) && test -n "$OLD_IP" && echo "$OLD_IP"
```

将生成的 HTTP 地址替换为公网 HTTPS 地址（安装脚本可能检测到云服务器网卡上的**内网 IP**，因此不能直接采用其默认地址）：

```bash
sed -i "s#http://${OLD_IP}#https://${PUBLIC_IP}#g" /opt/netbird/config.yaml /opt/netbird/dashboard.env
```

将 NetBird 公开端口修改为 443：

```bash
sed -i "s#https://${PUBLIC_IP}:80#https://${PUBLIC_IP}:443#g" /opt/netbird/config.yaml
```

重新创建并启动容器：

```bash
cd /opt/netbird && docker compose up -d --force-recreate
```

检查地址配置：

```bash
grep -E 'exposedAddress|issuer:' /opt/netbird/config.yaml && grep -E 'ENDPOINT|AUTH_AUTHORITY' /opt/netbird/dashboard.env
```

应当确认公开访问地址已经指向正确的公网 IPv4 和 HTTPS。

当前 NetBird 单体服务器会根据 `server.exposedAddress` 生成相关管理、信令与 Relay 地址；如果使用其他版本或非简化配置，还需要检查是否存在未更新的独立服务地址。

---

## 五、配置 Caddy 反向代理

### 1. 导入证书

创建 Caddy 证书目录：

```bash
install -d -m 750 -o root -g caddy /etc/caddy/netbird-certs
```

复制证书并设置权限：

```bash
install -m 640 -o root -g caddy "/etc/letsencrypt/live/${PUBLIC_IP}/fullchain.pem" /etc/caddy/netbird-certs/fullchain.pem && install -m 640 -o root -g caddy "/etc/letsencrypt/live/${PUBLIC_IP}/privkey.pem" /etc/caddy/netbird-certs/privkey.pem
```

### 2. 创建 Caddyfile

使用以下单行命令生成配置文件：

```bash
printf '%s\n' '{' 'auto_https disable_redirects' '}' "${PUBLIC_IP} {" 'tls /etc/caddy/netbird-certs/fullchain.pem /etc/caddy/netbird-certs/privkey.pem' 'route {' '@grpc header Content-Type application/grpc*' 'reverse_proxy @grpc h2c://127.0.0.1:8081' '@backend path /relay* /ws-proxy/* /api/* /oauth2/*' 'reverse_proxy @backend 127.0.0.1:8081' 'reverse_proxy 127.0.0.1:8080' '}' '}' > /etc/caddy/Caddyfile
```

该配置将：

- gRPC 请求转发至 NetBird Server。这里的 `h2c` 表示在本机反向代理与后端之间使用明文 HTTP/2；公网访问仍由 Caddy 提供 HTTPS。
- API、认证及 Relay 请求转发至 NetBird Server。
- 其余网页请求转发至 Dashboard。

其中 `8080` 为 Dashboard 本地端口，`8081` 为 NetBird Server 本地端口，不需要向公网开放。Caddy 统一监听 443，再根据请求类型将流量转交对应服务。

### 3. 启动 Caddy

检查配置：

```bash
caddy validate --config /etc/caddy/Caddyfile
```

启动并设置开机自启：

```bash
systemctl enable --now caddy && systemctl restart caddy
```

检查运行状态：

```bash
systemctl status caddy --no-pager
```

验证 HTTPS：

```bash
curl -I "https://${PUBLIC_IP}"
```

验证身份认证接口：

```bash
curl -fsS "https://${PUBLIC_IP}/oauth2/.well-known/openid-configuration" | jq '{issuer, authorization_endpoint, token_endpoint}'
```

正常情况下会返回身份认证相关地址，`issuer` 应指向当前公网 IP 的 `/oauth2` 路径。

### 4. 配置证书自动续期

创建 Certbot 部署钩子目录：

```bash
mkdir -p /etc/letsencrypt/renewal-hooks/deploy
```

生成自动更新 Caddy 证书的脚本：

```bash
printf '%s\n' '#!/bin/sh' 'set -eu' 'install -o root -g caddy -m 640 "$RENEWED_LINEAGE/fullchain.pem" /etc/caddy/netbird-certs/fullchain.pem' 'install -o root -g caddy -m 640 "$RENEWED_LINEAGE/privkey.pem" /etc/caddy/netbird-certs/privkey.pem' 'systemctl reload caddy' > /etc/letsencrypt/renewal-hooks/deploy/netbird-caddy.sh
```

设置执行权限：

```bash
chmod 700 /etc/letsencrypt/renewal-hooks/deploy/netbird-caddy.sh
```

检查 Certbot 自动续期任务：

```bash
systemctl list-timers --all | grep -i certbot
```

执行续期演练：

```bash
/snap/bin/certbot renew --dry-run --run-deploy-hooks
```

确认演练成功，且定时任务已启用。部署钩子会在证书实际更新后把新证书复制到 Caddy 目录并重新加载 Caddy；单纯申请新证书但不更新 Caddy 使用的副本仍会造成过期错误。由于采用 Standalone 验证方式，TCP 80 需要保持可供 Certbot 使用。

**证书续期是否正常，直接决定这套纯 IP 部署能否长期稳定使用。**

---

## 六、初始化管理员与设备组网

### 1. 创建管理员

通过浏览器访问：

```text
https://公网IPv4/setup
```

首次访问时，按照页面提示创建管理员。

NetBird 内置身份认证需要邮箱格式的登录标识和密码，但不需要注册 NetBird Cloud，也不需要另外部署邮件服务器。这里的邮箱用于标识本地用户，不是 Let's Encrypt 必须填写的邮箱。

管理员创建完成后，即可通过 Dashboard 管理设备、用户和访问策略。

### 2. Windows 接入

安装 [NetBird Windows 客户端](https://docs.netbird.io/get-started/install/windows)。

打开客户端，选择自托管服务器，填入：

```text
https://公网IPv4:443
```

使用管理员账户登录。

连接后，在 PowerShell 中查看状态：

```powershell
netbird status -d
```

### 3. Android 接入

安装 [NetBird Android 客户端](https://docs.netbird.io/get-started/install/android)。

进入客户端设置，选择 **Change Server**，将服务器地址设为：

```text
https://公网IPv4:443
```

登录后允许 Android 建立 VPN 连接。

**Android 浏览器登录验证无法完成时，可以改用 Setup Key：**

1. 在 NetBird Dashboard 中进入 **Settings → Setup Keys → Create Setup Key**，创建一个 **One-off（一次性）** 密钥并复制。
2. 在 Android 的 **Change Server** 页面填写上述管理地址，选择 **+ Add this device with a setup key**，粘贴密钥，点击 **Change**。
3. 返回应用首页，点击 NetBird 图标连接，允许系统创建 VPN；成功后在 Dashboard 的 Peers 页面确认手机在线。

![][1]

Setup Key 用于**跳过交互式浏览器登录并注册设备**，不是 TLS 证书验证的替代品。如果提示证书不受信任、证书过期或 HTTPS 握手失败，仍需先修复服务器证书。密钥相当于一次性的入网凭据，使用前不要公开；若密钥已失效，可重新创建。

需要注意，更换 Android 客户端的 NetBird Server 会清除当前 NetBird 配置，可能需要重新注册设备。

### 4. 测试设备互通

在 Dashboard 的 Peers 页面查看各设备状态和分配的 NetBird IP。

例如 Windows 上运行 WebDAV 服务，端口为 `8080`，则 Android 可以访问：

```text
http://Windows的NetBird-IP:8080
```

访问成功需要同时满足：

- Windows 和 Android 均已连接 NetBird。
- NetBird 访问策略允许双方通信。
- Windows 防火墙允许目标端口访问。
- WebDAV 服务监听 NetBird IP 或合适的本地接口。

NetBird 会优先尝试 P2P 直连；无法直连时，通过 Relay 中继。通过 `netbird status -d` 可以查看连接路径及 Relay 状态。

NetBird 提供的是三层私有网络，直接通过 IP 连接常见 TCP/UDP 服务没有问题，但不能保证局域网广播和自动设备发现完全正常。

---

## 七、维护、备份与服务器迁移

### 1. 日常维护

进入部署目录：

```bash
cd /opt/netbird
```

查看容器状态：

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

检查 Caddy 日志：

```bash
journalctl -u caddy -n 100 --no-pager
```

查看证书有效期：

```bash
openssl x509 -in /etc/caddy/netbird-certs/fullchain.pem -noout -dates
```

不要随意执行 `docker compose down -v`，其中的 `-v` 可能删除保存账户、设备和密钥的 Docker 数据卷。

### 2. 备份 NetBird

更换服务器之前，需要保留配置文件和管理数据。

首先停止服务，避免数据库在备份过程中发生写入：

```bash
cd /opt/netbird && docker compose stop
```

备份配置：

```bash
mkdir -p backup && cp docker-compose.yml config.yaml dashboard.env backup/
```

备份数据库与密钥：

```bash
docker compose cp -a netbird-server:/var/lib/netbird/ backup/
```

重新启动旧服务：

```bash
docker compose start
```

生成备份文件：

```bash
tar czf /root/netbird-backup.tar.gz -C backup .
```

设置备份文件权限：

```bash
chmod 600 /root/netbird-backup.tar.gz
```

将备份文件安全地保存到其他设备。

备份中包含账户信息、加密密钥和网络配置，应当按照私钥级别保护，不要放入公开仓库。

### 3. 迁移到新的云服务器

如果只是重新建立一套网络，可以直接重复前面的安装步骤。

如果需要保留原有账号、设备和策略，应当恢复旧数据。

首先，在新云服务器上安装 Docker、Caddy、Certbot，并申请新公网 IPv4 的 HTTPS 证书。此时不需要重新初始化 NetBird 管理员。

将备份上传至新云服务器的 `/root/netbird-backup.tar.gz`，解压：

```bash
mkdir -p /opt/netbird /opt/netbird-restore && tar xzf /root/netbird-backup.tar.gz -C /opt/netbird-restore
```

恢复配置：

```bash
cp /opt/netbird-restore/docker-compose.yml /opt/netbird-restore/config.yaml /opt/netbird-restore/dashboard.env /opt/netbird/
```

设置旧、新公网 IP：

```bash
export OLD_IP="旧云服务器公网IPv4" PUBLIC_IP="新云服务器公网IPv4"
```

修改 NetBird 公开地址：

```bash
sed -i "s#${OLD_IP}#${PUBLIC_IP}#g" /opt/netbird/config.yaml /opt/netbird/dashboard.env
```

检查配置：

```bash
cd /opt/netbird && docker compose config && grep -E 'exposedAddress|issuer:' config.yaml
```

创建容器与数据卷：

```bash
docker compose create netbird-server
```

恢复数据库：

```bash
docker compose cp -a /opt/netbird-restore/netbird/. netbird-server:/var/lib/netbird/
```

启动 NetBird：

```bash
docker compose up -d
```

检查日志：

```bash
docker compose ps && docker compose logs --tail=50 netbird-server
```

随后按照第五部分，在新云服务器上重新设置 Caddy 配置、导入新 IP 证书并配置自动续期，验证 HTTPS 和 Dashboard 均正常。

**由于没有使用域名，云服务器公网 IP 变化后，还需要修改客户端的 Management Server 地址。** 部分设备可能需要重新登录或注册，不能保证无感迁移。

另外，迁移前应尽量保持旧、新 NetBird 版本一致，确认迁移成功后再升级。以上恢复命令对应本文使用的新版 `netbird-server` 单体容器布局，旧版多容器部署需要采用不同的迁移方式。

---

## 八、常见问题与排查

### 1. Android 无法完成登录验证

如果浏览器无法跳转回来、认证页面卡住，或者登录后客户端仍未加入网络，可以优先使用第六节介绍的 **Setup Key** 方式。Setup Key 只解决交互式登录问题，不解决服务器不可达或证书错误。

### 2. Android 提示无法验证服务器、证书错误

先在手机浏览器访问 `https://公网IPv4`，检查是否出现证书警告；再在云服务器上检查 HTTPS 与证书有效期：

```bash
curl -I "https://${PUBLIC_IP}" && openssl x509 -in /etc/caddy/netbird-certs/fullchain.pem -noout -dates
```

若证书已过期，检查 Certbot 的自动续期任务、TCP 80 是否可用，以及 Caddy 证书副本是否被部署钩子更新。**不要通过忽略 HTTPS 验证来解决问题。**

### 3. Dashboard 打不开，或者网页能打开但登录失败

依次检查 NetBird 容器、Caddy 状态和管理 API：

```bash
cd /opt/netbird && docker compose ps && docker compose logs --tail=50 netbird-server
```

```bash
journalctl -u caddy -n 50 --no-pager
```

```bash
curl -fsS "https://${PUBLIC_IP}/api/instance" | jq .
```

如果网页能打开，但 API 或认证请求失败，重点核对 `config.yaml`、`dashboard.env` 中的公网 HTTPS 地址，以及 Caddy 的 `/api/*`、`/oauth2/*` 和 gRPC 路由。Caddy 必须支持向 NetBird 后端转发 HTTP/2 gRPC。

### 4. 设备在线，但无法访问 WebDAV、SSH 等服务

先确认双方处于同一 NetBird 网络且策略允许通信，再检查**目标设备的本地防火墙**、服务端口和监听地址。例如，WebDAV 如果只绑定 `127.0.0.1`，其他设备通常无法通过其 NetBird IP 连接。可以先测试 IP 和端口，避免把应用自身的配置问题误判为组网故障。

### 5. 设备可以互访，但速度慢

通过 `netbird status -d` 查看实际连接方式。若使用 Relay，说明设备未建立直接 P2P 连接，文件数据可能经过云服务器中继；此时需要检查双方网络的 NAT 类型、UDP 限制及中继服务器网络质量，而不是单纯提高云服务器的 CPU 配置。

---

## 九、注意事项

1. **纯 IP 并非 NetBird 标准的一键 HTTPS 部署。** 更新 NetBird 前，应检查官方安装脚本和配置结构是否发生变化。
2. **IP 证书有效期较短。** 必须保证 Certbot 自动续期正常，并及时发现续期失败。
3. **公网 IP 变化需要更新配置。** 包括服务器公开地址、Caddy、证书和客户端管理地址。
4. **NetBird Server 不必承担所有数据传输。** 设备能够建立 P2P 连接时，文件数据直接在设备之间传输。
5. **默认策略应按需调整。** 如果只用于自己的设备，可以先允许互通；以后增加其他用户时，应限制设备组和可访问端口。
6. **备份不可省略。** 管理数据库和密钥丢失后，原有设备及策略可能需要重新建立。

对于少量个人设备，这套方案可以在一台低配置 VPS 上运行，不依赖第三方托管组网账户，也不需要单独部署身份认证平台。

---

## 参考资料

1. [NetBird 官方自托管部署](https://docs.netbird.io/selfhosted/selfhosted-quickstart)
2. [NetBird getting-started.sh 官方脚本](https://github.com/netbirdio/netbird/blob/main/infrastructure_files/getting-started.sh)
3. [NetBird 外部反向代理配置](https://docs.netbird.io/selfhosted/external-reverse-proxy)
4. [NetBird 备份与恢复](https://docs.netbird.io/selfhosted/maintenance/backup)
5. [Docker Engine Ubuntu 安装](https://docs.docker.com/engine/install/ubuntu/)
6. [Caddy 官方安装文档](https://caddyserver.com/docs/install)
7. [Let's Encrypt IPv4 和短期证书](https://letsencrypt.org/2026/01/15/6day-and-ip-general-availability/)
8. [Certbot IPv4 证书支持](https://letsencrypt.org/2026/03/11/shorter-certs-certbot.html)
9. [NetBird Windows 客户端](https://docs.netbird.io/get-started/install/windows)
10. [NetBird Android 客户端](https://docs.netbird.io/get-started/install/android)
11. [NetBird Setup Keys 使用说明](https://docs.netbird.io/manage/peers/register-machines-using-setup-keys)
12. [NetBird 自托管故障排查](https://docs.netbird.io/selfhosted/troubleshooting)

[1]: /images/uploads/2026/10/2026-10-31-02-04-34-57.webp