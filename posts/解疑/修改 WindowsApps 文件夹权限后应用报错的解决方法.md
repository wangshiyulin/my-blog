---
title: 修改 WindowsApps 文件夹权限后应用报错的解决方法
slug: modify-windowsapps
date: 2026/05/10 16:38:00
updated: 2026/05/10 17:10:33
categories: 
  - 解疑
tags: 
  - 解疑
description: 不要碰Windowsapps文件夹的权限！！出问题就来这里看如何解决！！
---


## 情况背景

系统是Windows11，Windows10也可参考

可能因为各种原因，我们修改了"C:\Program Files\WindowsApps"文件夹的权限，

（比如我就是因为想删除MinecraftLuncher游戏组件而改了权限）

那么之后大概率会出现：

 - 记事本打不开
 - wt.exe打不开
 - 右键“在此处打开终端”打不开
 - 微软应用和商店打不开
 - ...

很崩溃，有用过还原点的大概想到了还原点

不过很遗憾，还原点大概率是作用甚微，还原后Windowsapps文件夹内部分文件无法还原


----------


## 解决方法
找了一天，发现Github上有大佬解决了这个情况：

访问[WindowsAppsUnfukker][1]
（关于如何访问、科学上网，我相信能来查这个问题的懂得都懂，这里不表）

往下滚动鼠标，找到 How to use 栏

![][2]


----------


Step1：
点击 Download the script here 的 **here**，下载脚本压缩包

Step2：
访问[PAExec][3]，往下滚动鼠标找到 **Download PAExec v1.31**，下载得到一个paexec.exe文件

Step3:
解压WindowsAppsUnfukker压缩包，将paexec.exe文件放入解压得到的文件夹中

Step4：
按下Win键，输入cmd，以管理员方式打开（或者Win+R键，输入cmd，按住Ctrl+Shift，然后Enter键打开）

输入 **cd "WindowsAppsUnfukker解压文件夹目录"** 移动到对应文件目录下

Step5：
输入：
> paexec -s -i cmd /C powershell -ExecutionPolicy Bypass -File "**你的WindowsAppsUnfukker解压文件夹目录**\WindowsAppsUnfukker.ps1" "%LocalAppData%" ^|^| pause

然后Enter运行，等待处理完成：

![][4]

之后**重启电脑**即可


----------


## 后话
虽然过程很艰难痛苦、崩溃到想重装系统、尝试各种方式还不行、想穿越回去让手从键盘上滚蛋、结果上**并不清楚有没有“后遗症”**之类的...〒▽〒

不过好在结果上是好的，而且换个角度看，这何尝不是一种锻炼：因为摆弄电脑导致问题，然后有能力找到解决方式并做出尝试，最终解决问题。从这个角度想想，心里欣慰了不少哈哈哈（〃｀ 3′〃）

**祝你也能成功解决问题。**

  [1]: https://github.com/AgentRev/WindowsAppsUnfukker?tab=readme-ov-file
  [2]: /images/uploads/2026/05/1166891827.webp
  [3]: https://www.poweradmin.com/paexec/
  [4]: /images/uploads/2026/05/3531953449.webp