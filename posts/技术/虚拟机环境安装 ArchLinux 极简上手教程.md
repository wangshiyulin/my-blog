---
title: 虚拟机环境安装 ArchLinux 极简上手教程
slug: ArchLinux-setup-vmware
date: 2026/03/22 20:35:00
updated: 2026/05/04 13:29:13
categories: 
  - 技术
tags: 
  - 操作系统
description: ArchLinux折腾日志
---


本文为博主一步步在虚拟机上安装Archlinux步骤记录，

各种报错、查阅资料解决后总结，

（BiliBili或Youtube上也有很多教程）

作为参照，如有谬误/疏漏，还望指出，

Let's begin

---

下载ArchLinux和导入iso到VMware就略过了，

以下均为在进入虚拟机Arch终端的操作

---

用UEFI引导

## 禁用reflector服务

> systemctl stop reflector

禁用reflector服务，该服务会自动根据速度等条件进行镜像源的排序，保存在/etc/pacman.d/mirrorlist

## 再次确认是否为UEFI模式

> ls /sys/firmware/efi/efivars

输出一堆文件名，确保在UEFI引导下

## 连接网络

连接无线网络(若是有线直接跳过)

> iwctl

进入交互式命令行

> device list

列出无线网卡设备名，比如无线网卡看到叫 wlan0

> station wlan0 scan

扫描网络

> station wlan0 get-networks

列出所有 wifi 网络

> station wlan0 connect wifi-name

进行连接，注意这里无法输入中文。回车后输入密码即可

> exit

连接成功后退出

## 测试网络连通性

> curl www.baidu.com

测试网络状态

## 更新系统时钟

> timedatectl set-ntp true

命令同步系统时间

> timedatectl status

查看同步后时钟状态信息

## 更换国内软件仓库镜像源加快下载

修改软件仓库，在开头添加这3个

> vim /etc/pacman.d/mirrorlist

> Server = https://mirrors.ustc.edu.cn/archlinux/\$repo/os/\$arch
> Server = https://mirrors.tuna.tsinghua.edu.cn/archlinux/\$repo/os/\$arch
> Server = https://repo.huaweicloud.com/archlinux/\$repo/os/\$arch

## 分区和格式化 (使用Btrfs文件系统)

1. 分区

> lsblk

查看磁盘状态，找到需要操作的盘，例sda

> cfdisk /dev/sda

选择gpt

选new分区：swap分区，efi引导分区，linux系统分区

选择type调整磁盘类型：swap分为Linux swap，efi分为EFI System，系统分为Linux filesystem

选择write写入磁盘

输入yes，不要输y

> fdisk -l

查看分区状态

2. 格式化分区

> mkfs.fat -F32 /dev/sdxn

格式化efi分区

> mkswap /dev/sdxn

格式化swap分区

> mkfs.btrfs -L arch /dev/sda3

格式化系统分区  -L指定该分区的 LABLE

## 操作Btrfs分区

> mount -t btrfs -o compress=zstd /dev/sdxn /mnt

将 Btrfs 分区挂载到 /mnt 下  -t 后指定挂载分区文件系统类型   -o 选项后添加挂载参数 compress=zstd 开启透明压缩

> df -h

复查挂载情况

> btrfs subvolume create /mnt/@

创建 / 目录子卷

> btrfs subvolume create /mnt/@home

创建 /home 目录子卷

> btrfs subvolume list -p /mnt

复查子卷情况

> umount /mnt

将 /mnt 卸载掉，以挂载子卷

## 挂载

> mount -t btrfs -o subvol=/@,compress=zstd /dev/sdxn /mnt

挂载 / 目录

> mkdir /mnt/home

创建 /home 目录

> mount -t btrfs -o subvol=/@home,compress=zstd /dev/sdxn /mnt/home

挂载 /home 目录

> mkdir -p /mnt/boot

创建 /boot 目录

> mount /dev/sdxn /mnt/boot

挂载 /boot 目录！注意这个是efi分区！

> swapon /dev/sdxn

挂载交换分区

> df -h

复查挂载情况

> free -h

复查 Swap 分区挂载情况

## 安装系统

> pacstrap /mnt base base-devel linux linux-firmware btrfs-progs

使用 pacstrap 脚本安装基础包，如果使用btrfs文件系统，额外安装一个btrfs-progs包

> base-devel —— base-devel 在 AUR 包的安装过程中是必须用到的

linux —— 内核软件包，这里建议先不要替换为其它内核

> pacman -S archlinux-keyring

如果提示 GPG 证书错误，可能是因为使用的不是最新的镜像文件，可以通过更新 archlinux-keyring 解决此问题

> pacstrap /mnt networkmanager vim sudo zsh zsh-completions

使用 pacstrap 脚本安装其它必要的功能性软件

## 生成fstab文件

> genfstab -U /mnt > /mnt/etc/fstab

fstab 用来定义磁盘分区，使用 genfstab 自动根据当前挂载情况生成并写入 fstab 文件

> cat /mnt/etc/fstab

复查一下 /mnt/etc/fstab 确保没有错误

## 切换工作区

> arch-chroot /mnt

把系统环境切换到新系统下

## 设置系统的主机名和时区

> vim /etc/hostname

在 /etc/hostname 设置主机名

> vim /etc/hosts

在 /etc/hosts 设置与其匹配的条目
 			加入：	127.0.0.1   localhost
 					::1         localhost
 					127.0.1.1   myarch.localdomain myarch

> ln -sf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime

在 /etc/localtime 下用 /usr 中合适的时区创建符号链接，设置时区

## 设置硬件时间

> hwclock --systohc

让BIOS硬件时间和操作系统所同步

## 设置地区偏好

> vim /etc/locale.gen

编辑 /etc/locale.gen，去掉 en_US.UTF-8 UTF-8 以及 zh_CN.UTF-8 UTF-8 行前的注释符号（#）

> locale-gen

用命令生成 locale

> echo 'LANG=en_US.UTF-8'  > /etc/locale.conf

向 /etc/locale.conf 输入内容

## 设置root密码

> passwd root

设置root密码

## 安装微码

> pacman -S intel-ucode

Intel

> pacman -S amd-ucode

AMD

安装对应芯片制造商的微码

## 设置引导程序

> pacman -S grub efibootmgr

安装引导程序
 	-S 选项后指定要通过 pacman 包管理器安装的包：
 	grub —— 启动引导器
 	efibootmgr —— efibootmgr 被 grub 脚本用来将启动项写入 NVRAM

> grub-install --target=x86_(下划线)64-efi --efi-directory=/boot --bootloader-id=ARCH

安装 GRUB 到 EFI 分区
 	--efi-directory=/boot —— 将 grubx64.efi 安装到之前的指定位置（EFI 分区）
 	--bootloader-id=ARCH —— 取名为 ARCH

> vim /etc/default/grub

使用 vim 编辑 /etc/default/grub 文件
 	去掉 GRUB_CMDLINE_LINUX_DEFAULT 一行中最后的 quiet 参数
 	把 loglevel 的数值从 3 改成 5。这样是为了后续如果出现系统错误，方便排错
 	加入 nowatchdog 参数，这可以显著提高开关机速度

> grub-mkconfig -o /boot/grub/grub.cfg

生成 GRUB 所需的配置文件

## 完成安装

> exit

退回安装环境

> umount -R /mnt

卸载新分区

>*reboot

重启

注意，(如果是装真机)重启前要先拔掉优盘，否则你重启后还是进安装程序而不是安装好的系统。

## 结束安装与连接网络

重启后使用 root 账户登录系统

> systemctl enable --now NetworkManager

设置开机自启并立即启动 NetworkManager

> ping www.bilibili.com

## 测试网络连接

若为无线连接，则需要在启动 networkmanager 后使用 nmcli 连接网络：

> nmcli dev wifi list

显示附近的 Wi-Fi 网络

> nmcli dev wifi connect "Wi-Fi名（SSID）" password "网络密码"

连接指定的无线网络

> pacman -S fastfetch

通过 pacman 安装 fastfetch，fastfetch 可以将系统信息和发行版 logo 一并打印出来

> fastfetch

使用 fastfetch 打印系统信息

配置 root 账户的默认编辑器

> vim ~/.bash_(下划线)profile

使用 vim 编辑 ~/.bash_profile 文件

> export EDITOR='vim'

在适当位置加入该内容

> useradd -m -G wheel -s /bin/bash myusername

通过以下命令添加用户，比如新增加的用户叫 myusername
-m 创建用户的同时创建用户家目录
-G 选项后指定附加组
wheel —— wheel 附加组可 sudo 进行提权
-s 选项后指定 shell 程序
myusername —— 用户名（请自定义，但不要包含空格和特殊字符）

> passwd myusername

通过以下命令根据提示设置新用户 myusername 的密码

> EDITOR=vim visudo

使用 vim 编辑器通过 visudo 命令编辑 sudoers 文件

> #%wheel ALL=(ALL:ALL) ALL

找到如下这样的一行，把前面的注释符号 # 去掉
%wheel —— 用户名或用户组，此处则代表是 wheel 组，% 是用户组的前缀
ALL= —— 主机名，此处则代表在所有主机上都生效（如果把同样的 sudoers 文件下发到了多个主机上）
(ALL:ALL) —— (任意用户:任意用户组)，此处则代表可以成为任意目标用户/用户组
最后的 ALL —— 代表可以执行任意命令

> pacman -Syyu

刷新 pacman 数据库并更新

> sudo pacman -Syu

更新系统，同步软件包数据库并更新所有已安装的软件包

> sudo shutdown -h +5

延迟关机（例如5分钟后）

> pacman -Ql <软件包名>

查看 软件 的安装路径

> chsh -s $(which shell名称)

默认shell切换

安装yay助手: 

> git clone https://aur.archlinux.org/yay.git

> cd yay

> makepkg -si

如果安装失败：

> go env -w GO111MODULE=on

> go env -w GOPROXY=https://goproxy.cn,direct

> export GO111MODULE=on

> export GOPROXY=https://goproxy.cn

> makepkg -si

> yay --version

> yay search_term

搜索软件包

> yay -S package_name

安装软件包

> yay -R package_name

删除软件包

> yay -Rns package_name

删除包及其依赖项

> yay -Sua

仅升级 AUR 包

> sudo pacman -Rs yay

从 Arch 系统中删除 Yay

---

archlinuxcn配置：

> sudo vim /etc/pacman.conf

在文件底部添加：

Server = https://mirrors.ustc.edu.cn/archlinux/$arch
Server = https://mirrors.tuna.tsinghua.edu.cn/archlinux/$arch
Server = https://repo.huaweicloud.com/archlinux/$arch

> sudo pacman -Sy archlinuxcn-kryring

---

安装&配置结束

如配置过程有错误，请上网查询

博主也会慢慢修改更新文章

！用AI获取信息，但勿要尽信AI
