---
title: Zed 编辑器通过 MinGW64 编译器配置 C++ 开发环境（Windows）
slug: Zed-MinGW-C-Windows
date: 2026/05/21 13:00:00
updated: 2026/05/21 16:49:26
status: publish
author: 往世雨
categories: 
  - 技术
tags: 
  - Zed
desc: Zed编辑器配置C++语言的开发环境，使用mingw64编译器
---


Zed原生支持C++，因此配置起来并不困难

闲话少叙，开始吧。

----------

### 下载MinGW

**Github：[MinGW][1]**

点击链接下载、解压即可

找到 MinGW 的文件夹将其中的 **Bin 目录**添加到**环境变量**。

打开终端，输入 **g++ --version** 检测是否添加成功

成功即可进入下一步

----------

### Zed配置

找到 C++ 项目文件夹

在项目目录下创建文件：.clangd

在文件里写入一下内容：

```
CompileFlags:
  Add:
    - --target=x86_64-w64-windows-gnu
```

----------

### 测试配置

之后在Zed中打开文件夹，创建hello.cpp文件，填入：

```
#include <iostream>
using namespace std;

int main() {
    cout << "Hello Zed C++!" << endl;
    return 0;
}
```

并**等待Zed自动配置部分工具**完成

在Zed中打开终端，进入项目文件夹，依次输入：

>g++ hello.cpp
>**生成hello.exe**

>.\hello.exe
>**运行hello.exe**

运行结果出现：

**Hello Zed C++!**

即配置完成



  [1]: https://github.com/niXman/mingw-builds-binaries/releases/download/16.1.0-rt_v14-rev0/x86_64-16.1.0-release-posix-seh-msvcrt-rt_v14-rev0.7z