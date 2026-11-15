---
title: "Ubuntu 自建 Hysteria 2 代理并接入 Clash Verge Rev 实操指南"
slug: hysteria2-clash-verge-guide
date: 2026/11/15 01:30:07
updated: 2026/11/15 11:05:02
categories:
  - 技术
tags:
  - Hysteria 2
  - Clash
description: "在 Ubuntu VPS 上通过域名或公网 IPv4 部署 Hysteria 2，导入 Clash Verge Rev，并检查 UDP 连通性、证书和代理认证。"
---

在 Ubuntu VPS 上部署 Hysteria 2 后，可以通过 Clash Verge Rev 使用这个代理节点。本文提供两条部署路线，均以 UDP 8443 为例。有域名时按第一至第三节配置，由客户端校验域名证书。只有公网 IPv4 时直接按第四节配置，通过证书指纹验证服务器。

## 一、路线一：准备域名、证书和 UDP 端口

1. 为你控制的节点域名添加 A 记录，指向 VPS 的公网 IPv4。下文用 `hy.example.com` 作为示例，配置客户端时请换成实际域名。若使用 Cloudflare 管理 DNS，这条记录可设为「仅 DNS」，让客户端直接连接 VPS。只有 IPv6 确实可用时才发布 AAAA 记录。
2. 在云安全组放行入站 **UDP 8443**。启用 UFW 时执行 `sudo ufw allow 8443/udp`，现有 SSH 规则应继续允许管理连接。
3. 选择证书签发方式。TCP 80 空闲时，可按第二节配置自动签发。需要使用已有证书时，先给节点域名签发公开受信任的证书。已有 Caddy 占用 TCP 80/443 时，可通过支持该 DNS 服务商的 ACME 客户端走 DNS-01 签发，将完整证书链和私钥部署到供 Hysteria 读取的目录。签发工具需要有对应 DNS 区域的验证权限。配置中的 `cert` 和 `key` 要填写完整证书链和私钥的实际路径。
4. 用 `sudo ss -lunp` 查看 UDP 8443 是否空闲。Caddy 启用 HTTP/3 时可能占用 UDP 443，另选 UDP 8443 可让网站和代理分别监听。

[Hysteria 2 服务端配置](https://hy2.app/docs/advanced/Full-Server-Config/) · [ACME DNS 验证](https://hy2.app/docs/advanced/ACME-DNS-Config/)

---

## 二、安装并启动 Hysteria 2

在支持 systemd 的 Ubuntu 22.04 LTS 或更新 LTS 上，VPS 需要能访问安装脚本和 GitHub Releases。使用官方脚本安装二进制文件和 systemd 单元。

```bash
sudo bash -c 'bash <(curl -fsSL https://get.hy2.sh/)'
sudoedit /etc/hysteria/config.yaml
```

已有部署时，先备份原配置。下面是使用已有证书的完整最小配置。运行 `openssl rand -hex 32` 生成随机密码，将服务端和客户端的 `REPLACE_WITH_RANDOM_PROXY_PASSWORD` 都替换为该值。

```yaml
listen: :8443

tls:
  cert: /etc/hysteria/tls/fullchain.pem
  key: /etc/hysteria/tls/privkey.pem

auth:
  type: password
  password: "REPLACE_WITH_RANDOM_PROXY_PASSWORD"
```

如果节点域名已经直连 VPS，且 TCP 80 可由 Hysteria 2 使用，也可以让 Hysteria 2 自动申请和续期。先在云安全组和系统防火墙放行 **TCP 80**，将上面的 `tls` 段替换如下，保留 `listen` 和 `auth`。示例域名和邮箱请换成实际值。

```yaml
acme:
  domains:
    - hy.example.com
  email: admin@example.com
  type: http
```

如果 Caddy 等程序已经占用 TCP 80，可沿用第一节的 DNS-01 签发方式和本地 `tls` 配置。

证书文件和父目录权限需允许 systemd 单元的运行用户读取，私钥应限制为服务所需的最小权限。使用上面的 `tls` 配置时，删除模板里的 `acme` 段。已有证书的续期任务也要同步更新服务实际读取的文件。

```bash
sudo systemctl enable --now hysteria-server.service
sudo systemctl is-active hysteria-server.service
sudo ss -lunp 'sport = :8443'
sudo journalctl -u hysteria-server.service -n 30 --no-pager
```

服务启动后应返回 `active`，UDP 8443 应显示监听套接字。若服务安装后已经启动，修改配置时执行 `sudo systemctl restart hysteria-server.service` 再查看状态。

[官方安装脚本](https://hy2.app/docs/getting-started/Server-Installation-Script/) · [服务端配置示例](https://hy2.app/docs/getting-started/Server/)

---

## 三、在 Clash Verge Rev 中导入节点

在 Windows 上创建 `hysteria2.yaml`。将 `server` 和 `sni` 中的示例域名替换为实际节点域名，`port` 和 `password` 与服务端保持一致。这份配置会将进入 Mihomo 并由规则处理的流量交给「代理出口」组。

```yaml
mode: rule

proxies:
  - name: HY2
    type: hysteria2
    server: hy.example.com
    port: 8443
    password: "REPLACE_WITH_RANDOM_PROXY_PASSWORD"
    sni: hy.example.com
    skip-cert-verify: false

proxy-groups:
  - name: 代理出口
    type: select
    proxies:
      - HY2

rules:
  - MATCH,代理出口
```

打开 Clash Verge Rev 的「订阅」，新建「本地」配置并选择 YAML，或者通过本地文件导入入口导入。启用该配置，在「代理」页选择 HY2。Windows 上可开启系统代理，让遵循该设置的浏览器使用代理，然后访问一个 IP 查询服务，核对出口是否为 VPS 的公网地址。要确认指定应用是否真的走了代理，可在「连接」页核对它的规则和出站节点。

[Mihomo 的 Hysteria 2 字段](https://wiki.metacubex.one/en/config/proxies/hysteria2/) · [Clash Verge Rev 配置导入文档](https://github.com/clash-verge-rev/clash-verge-rev.github.io/blob/main/docs/guide/profile.md)

---

## 四、路线二：使用公网 IPv4 部署和接入

这条路线适用于只有公网 IPv4 的 VPS。服务端使用本地 TLS 证书，Clash 直接连接 IP，并用证书指纹验证服务器。

### 1. 安装服务并放行端口

准备一台带公网 IPv4 的 Ubuntu VPS。本文使用 **UDP 8443**。在云安全组放行该端口。若已启用 UFW，再执行 `sudo ufw allow 8443/udp`。Caddy 若已占用 UDP 443，可以继续用原端口提供网站服务。

```bash
sudo apt-get update
sudo apt-get install -y curl openssl
sudo bash -c 'bash <(curl -fsSL https://get.hy2.sh/)'
```

### 2. 准备 TLS 证书并取指纹

已有可用证书和私钥时，可以直接采用原路径，并从当前证书读取指纹。全新部署可在 VPS 上生成一张自签名证书。将命令中的示例 IP `203.0.113.10` 改为 VPS 的公网 IPv4。

下面的文件权限适用于官方脚本默认的 `hysteria` 服务账户。可用 `systemctl cat hysteria-server.service` 核对服务用户，若部署时另行指定了账户，应让证书目录和文件的组权限与实际账户匹配。

```bash
sudo install -d -o root -g hysteria -m 0750 /etc/hysteria/ip-tls
sudo openssl req -x509 -newkey rsa:2048 -nodes -days 365 \
  -subj '/CN=203.0.113.10' -addext 'subjectAltName=IP:203.0.113.10' \
  -keyout /etc/hysteria/ip-tls/server.key \
  -out /etc/hysteria/ip-tls/server.crt
sudo chgrp hysteria /etc/hysteria/ip-tls/server.{crt,key}
sudo chmod 0640 /etc/hysteria/ip-tls/server.{crt,key}
sudo openssl x509 -in /etc/hysteria/ip-tls/server.crt -noout -fingerprint -sha256
```

从 SSH 终端**复制指纹输出中等号右侧的值**，后面填入 Clash 的 `fingerprint`。私钥留在服务器上。

### 3. 配置并启动 Hysteria 2

用 `sudoedit /etc/hysteria/config.yaml` 写入以下配置。用 `openssl rand -hex 32` 生成代理密码并替换占位值。复用证书时，把 `cert` 和 `key` 换成实际路径。采用本地证书时，配置中只保留 `tls`。

```yaml
listen: :8443

tls:
  cert: /etc/hysteria/ip-tls/server.crt
  key: /etc/hysteria/ip-tls/server.key

auth:
  type: password
  password: "YOUR_HY2_PASSWORD"
```

```bash
sudo systemctl enable hysteria-server.service
sudo systemctl restart hysteria-server.service
```

在 VPS 上运行以下命令确认服务状态和监听端口。这里以 UDP 8443 为例，若服务使用其他端口，请替换为实际值。

```bash
systemctl is-active hysteria-server.service
sudo ss -lunp 'sport = :8443'
```

预期服务状态为 `active`，且能看到 UDP 监听。随后确认云安全组和系统防火墙都允许客户端访问该 UDP 端口。

### 4. 在 Clash 中导入 IP 节点

在 Windows 上创建一个 YAML 文件，使用以下完整配置。示例 IP、密码和指纹都要换成实际值。

```yaml
mode: rule

proxies:
  - name: HY2
    type: hysteria2
    server: "203.0.113.10"
    port: 8443
    password: "YOUR_HY2_PASSWORD"
    fingerprint: "YOUR_SHA256_FINGERPRINT"
    alpn:
      - h3

proxy-groups:
  - name: 代理出口
    type: select
    proxies:
      - HY2

rules:
  - MATCH,代理出口
```

在 Clash Verge Rev 中新建「本地」配置并导入 YAML，启用该配置，再从代理组中选中 HY2。如果正在使用全局模式，还要在 `GLOBAL` 中选中该节点。开启系统代理后，用浏览器访问 IP 查询服务，核对出口是否为 VPS 的公网地址。

如果后来更换了服务器证书，请用新证书的指纹更新客户端。服务端的证书配置仍沿用第二节的 `tls.cert` 和 `tls.key` 字段。

[Mihomo Hysteria 2 节点配置](https://wiki.metacubex.one/en/config/proxies/hysteria2/) · [Mihomo 证书指纹](https://wiki.metacubex.one/en/config/proxies/tls/#fingerprint)

---

这些操作都是经过实操检验过的，如果出现问题，请先检查防火墙、端口和证书配置，或者询问AI。

如有任何问题，请在评论区留言，我会尽快回复。