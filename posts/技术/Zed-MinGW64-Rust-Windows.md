---
title: Windows 系统 Zed 编辑器搭配 MinGW 搭建 Rust 开发环境
slug: Zed-MinGW64-Rust-Windows
date: 2026/05/21 16:49:00
updated: 2026/05/29 14:11:55
status: publish
author: 往世雨
categories: 
  - 技术
tags: 
  - Zed
desc: Zed 通过 MinGW 配置 Rust 开发环境（Windows）
---


## 前言

Rust底层依赖C/C++的编译器，因此需要先安装C/C++编译环境。

Windows上有两种C/C++的编译器：

**Visual Studio （msvc）**和 **Mingw （gnu）**

但是Visual Studio的**体积过于庞大**(几个G)，因此我选择了Mingw作为编译器

----------

## 下载Mingw64

Github：[Mingw_64位][1]
Github：[Mingw_32位][2]

点击链接下载、解压即可

找到 MinGW 的文件夹将其中的 Bin 目录添加到环境变量。

打开终端，输入 g++ --version 检测是否添加成功

成功即可进入下一步

----------

## 安装Rust

Rust官网：[Rust][3]

选择对应的版本安装即可，此处我选择64位：

![][4]

之后得到 **rustup-init.exe** 文件，双击开始安装

此处选3：

![][5]

此处选2 (自定义安装)：

![][6]

然后输入**x86_64-pc-windows-gnu**，表示我要安装 64位的 gnu版本：

![][7]

接下来一路回车，选择默认配置即可，之后等待安装完成。

安装完毕后，重新打开终端，输入**rustc --version**

出现Rust的版本即代表安装成功。

----------

## 创建Rust项目

启动Zed内终端，cd进入桌面，输入：

>cargo new rust

此时桌面上会出现rust文件夹

依次输入：

>cd rust
>cargo run

终端返回Hello, world!

即成功配置Rust



  [1]: https://github.com/niXman/mingw-builds-binaries/releases/download/16.1.0-rt_v14-rev0/x86_64-16.1.0-release-posix-seh-msvcrt-rt_v14-rev0.7z
  [2]: https://github.com/niXman/mingw-builds-binaries/releases/download/16.1.0-rt_v14-rev0/i686-16.1.0-release-posix-dwarf-msvcrt-rt_v14-rev0.7z
  [3]: https://rust-lang.org/zh-CN/tools/install/
  [4]: /images/uploads/2026/05/1811632603.webp
  [5]: /images/uploads/2026/05/2715495103.webp
  [6]: /images/uploads/2026/05/1569738819.webp
  [7]: /images/uploads/2026/05/846349055.webp