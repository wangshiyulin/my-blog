---
title: Git怎么使用？Git 新手入门完整教程，从零掌握版本控制基础操作
slug: Git-course
date: 2026/03/09 12:25:00
updated: 2026/05/20 15:26:37
categories: 
  - 知识
tags: 
  - 知识
description: 史上最容易学会的Git操作指南
---


本文为Git新手简易教程，可快速熟悉日常git使用

本文偏文字叙述，图片较少

如有疏漏谬误，还望指出，感激不尽(*￣3￣)╭

闲话少叙，let's begin！

---

## 1.Git安装

[Git官网](https://git-scm.com/)

根据系统类型，选择最新版本下载安装即可

安装时：选择VScode编辑器即可

打开终端输入git --version检查是否安装成功

之后，输入：

> git config --global user.name "你的用户名"

> git config --global user.email "你的邮箱地址"

创建你的用户名和邮箱

推送时GitHub会扫描跟这个邮箱相同的账号，并将其作为贡献者显示在你的仓库。

所以建议使用注册GitHub用的邮箱

> git config --list

可以查看你的username和useremail

---

## 2.Git基础使用
git基本提交路径：含git的文件夹(工作区) --> git暂存区 --> 本地git仓库 --> 远程git仓库


进入一个文件夹，在该文件夹打开终端

> git init

在此文件夹创建一个.git文件，即可开始版本控制

> git add name/.

将新添加的名为 name 文件添加入git暂存区，. 是指将所有文件添加入git暂存区

> git restore -m name/.

将名为 name 的文件从暂存区里删除，. 指将所有文件从暂存区删除

> git status

该命令可以查看当前git仓库状态

> git commit -m a

提交暂存区内所有文件到本地仓库，并且将该版本仓库命名为 a

> git log

查看git的提交日志

> git reflog --hard "commitID"

回退该文件夹的版本，commitID是输入git log后出现在commit后的一串ID代号


> git rm -r --cached name

将名为name的文件从本地仓库删除（删除所有已提交文件），之后可以加入到 .gitignore

> .gitignore

在工作文件夹里创建一个名为.gitignore的文件，在里面写入不想被提交到仓库的文件的名字

（切记，被写入.gitignore的文件必须为没有被提交过的文件 或 提交过但被从仓库删除的文件）

> git clone <远端仓库地址> <自定义name>

最常用的一个，将远程仓库的内容拉取到本地，并命名为<自定义name>，各种开源软件就是这么拉取到本地的

---

## 3.Git远程提交到Github

首先在终端运行 **ssh-keygen -t rsa** 以生成密钥对

找到 .ssh 文件，一般在 **C:\Users\用户名** 中

记事本打开 id_rsa.pub，复制其中内容

---

之后进入[GitHub官网](https://github.com)，注册并登录

点击右上角头像，选择settings，如下创建一个ssh key


如此填入，title是名字，之后点击 Add SSH key即可


---

之后点击右上角头像，找到Repositories，点击New创建一个仓库

进入仓库，找到这个 SSH 并复制


---

回到终端，输入命令

> git remote add origin git@github.com:XXXXXX

就是git remote add“本地显示的名字”“刚复制的远程地址”

> git remote

查看当前连接的远程仓库

> git push origin main:main

推送到id远程仓库远程仓库 ，将 本地dev 推送到 远端dev，

这里的main是分支，就像树杈，等下会说到

之后输入 git log 可以在当前提交后看到一个红色的如“a/main”表明远程提交

> git remote remove origin

删除刚创建的 origin 远程仓库（当然，删除的只是本地创建的连接，GitHub上那个还是完好的）

> git pull <远程仓库名称> <远程仓库分支名>

拉取仓库某个分支的更新到本地并合并

---

## 4.Git分支

**就像树杈**

比如我有一个main分支了，需要更新版本，就可以开一个develop分支，在里面开发新内容，之后再合并到main分支。

程序出现错误，也可以通过这个方法，创建一个分支修bug，然后合并

---

> git branch develop

创建一个名为 develop 的分支

> git branch

查看当前拥有的分支

> git checkout develop

将当前分支切换为 develop 分支，之后用

> git branch (-D) develop

删除 develop 分支，-D 表示强制删除

> git merge develop

将develop分支合并到 HEAD 指向的分支

---

## 5.最后

至此，Git的新手教程就结束了，多尝试几次后还是很简单的，熟悉会很快

本文属新手基础教程，足够日常使用，

但仅仅占Git知识的一小部分，剩下的世界等待读者自行探索了

---

以下为几个小小的注意事项：

1. 同一个文件，不同分支里，同一行内容不同 (非同一行自动合并) ，合并时会出错，此时打开文件，====上面是当前分支，下面是合并分支，自己改，之后重新添加暂存区并提交仓库
2. 一般有main分支和develop分支，开发时，在develop分支上创建分支，后合并到develop分支，上线时，将develop分支合并到main分支，除了这两个主要的分支，其余可以删除
3. 如果出现bug，从main分支里单独开一个分支修改并测试，解决后合并到main分支，而后合并到develop分支
4. 如果ID分支没有合并到main分支，直接删除ID分支，会报错 (认为是误删)，此时需要强制删除

---

部分参考自 [Git文档](https://git-scm.com/book/zh/v2)，Git还有一本官方书籍[GitBook](https://git-scm.com/book/zh/v2)，有深研想法可以看看
