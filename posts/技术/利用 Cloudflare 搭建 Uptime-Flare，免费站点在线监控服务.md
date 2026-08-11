---
title: 利用 Cloudflare 搭建 Uptime-Flare，免费站点在线监控服务
slug: Cloudflare-UptimeFlare
date: 2026/08/09 19:11:00
updated: 2026/08/09 19:11:00
status: publish
auther: 往世雨
categories: 
  - 技术
tags:
  - 网站
desc: 无需服务器，在Cloudflare上部署uptimeflare，实时掌握网站状况
---


Uptime-Flare是一个监控工具，能够帮助我们监控网站的可用性和性能。通过Cloudflare我们可以免费部署这个服务，监控我们的不同网站。

 - 项目地址：[UptimeFlare](https://github.com/lyc8503/UptimeFlare)
 - 我的站点监控服务：[青鸾小栈](https://status.qingluanx.com)
 - 官方Wiki：[Wiki](https://github.com/lyc8503/UptimeFlare/wiki/Quickstart)

## Cloudflare端配置
1. 创建 <strong>Cloudflare TOKEN</strong> 用于github部署

> 链接：[Cloudflare Token](https://dash.cloudflare.com/profile/api-tokens)

2. 点击创建令牌, 选择 编辑 <strong>Cloudflare Workers 模板</strong>, 手动将 <strong>D1</strong> 编辑权限添加到模板中。然后将 <strong>帐户资源</strong> 设置为 <strong>自己的账户</strong>（不要选全部账户）, <strong>区域资源</strong> 设置为 <strong>所有区域</strong>。

3. 最后点击下一步，<strong>CREATE TOKEN</strong>。 然后将Token复制下来即可。

![][1]

## Github端配置
1. 访问该项目的github地址：[UptimeFlare](https://github.com/lyc8503/UptimeFlare) , 点击项目首页的 use this template, 然后点击create new repo。
![][2]

2. 设置 SECRET
 - 点击 <strong>settings</strong> -> <strong>secrets and variables</strong> -> <strong>new repository secret</strong>
 - Name 的值是 <strong>CLOUDFLARE_API_TOKEN</strong>
 - Secret 的值前面复制的 Token 值
![][3]

3. 修改仓库根目录下的 <strong>uptime.config.ts</strong> 文件，需要修改 PageConfig 配置里的Links数组.

> uptime.config.ts的Wiki：[Wiki]( https://github.com/lyc8503/UptimeFlare/wiki/Configuration)
> PageConfig配置里的 <strong>Links数组</strong> 里的链接是我们的监控首页的站点显示信息，而不是要监控的站点，要监控的站点在 <strong>WorkConfig</strong> 里。

这里我配置了两个站点，Github和青鸾小栈Blog
![][4]

4. 配置 WorkConfig，这是我的配置，可以参考我的配置进行更改
![][5]

5. 点击COMMIT提交，<strong>github actions</strong> 会自动进行运行最新的代码。Actions里的最新作业有 <strong>绿色✓</strong>表明部署成功，如果有 <strong>红色✕</strong>，则表明部署失败，需要查看日志找出错误并进行修改。
![][6]

## 后记
之后在 <strong>cloudflare worker和pages</strong> 页面内能找到新的Worker和page，绑定自己的域名即可。



[1]: /images/uploads/2026/08/6190909d22ea.gif
[2]: /images/uploads/2026/08/2ba486084111.gif
[3]: /images/uploads/2026/08/530174cdd107.gif
[4]: /images/uploads/2026/08/2026-08-09_19-37-23.webp
[5]: /images/uploads/2026/08/2026-08-09_19-44-09.webp
[6]: /images/uploads/2026/08/2026-08-09_19-49-36.webp