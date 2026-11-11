---
title: "Android APK 签名教程：生成密钥、签名与多软件管理"
slug: android-apk-signing
date: 2026/11/11 20:29:10
updated: 2026/11/11 20:46:47
categories:
  - 技术
tags:
  - Android
description: "记录 Windows 下使用 JDK 21 生成 ledger.jks、对齐并签名 APK 的实际步骤，解释签名验证和三个输出文件，并说明后续版本如何沿用同一密钥发布。"
---

发布青鸾记账时，我需要将原来的调试签名换成自己的正式签名。电脑上没有安装 Android Studio，手头只有一个 JDK 压缩包，因此整理了这套本地操作流程。

本文使用 Windows、PowerShell 和 JDK 21，以 `ledger` 为例完成密钥生成、APK 对齐、签名和验证。密钥与密码始终保存在自己的电脑上，不需要交给在线签名网站。

## 一、签名是什么，为什么需要它

Android 应用签名使用私钥对 APK 进行数字签名。安装包携带证书和签名信息，系统据此验证包的完整性，以及它是否符合已安装应用的更新身份要求。

几个概念需要分清：

| 名称 | 用途 | 能否公开 |
| --- | --- | --- |
| 私钥 | 为 APK 生成签名 | 不能 |
| 密钥库 | 保存私钥和证书的文件，例如 `ledger.jks` | 含私钥时不能 |
| 密钥别名（alias） | 在密钥库中指定使用哪一个密钥条目 | 可以，但应记录准确 |
| 公钥证书 | 包含公钥及证书信息，用于验证签名 | 可以 |
| SHA-256 证书指纹 | 标识和核对证书 | 可以 |

Android 要求 APK 安装前经过签名。对于同一个应用，后续更新通常需要使用相同的签名密钥，并满足包名、内部版本号等更新条件。

签名不会加密源代码，也不能证明软件没有恶意行为。个人生成的签名证书通常是自签名证书，不等于手机厂商或应用商店的开发者实名认证。因此，改用正式签名后，也不保证安装时的“开发者身份未验证”提示消失。

### 调试签名可以用吗

可以用于开发和测试，也能用于直接分发 APK，但长期发布应使用自己妥善管理的正式密钥。部分应用商店不接受调试证书。

另外，使用调试证书签名和启用调试模式是两回事：release 构建也可以被调试密钥签名。

**如果已经用旧密钥发布过应用，新生成的密钥通常不能直接覆盖安装旧版。** 本文演示直接更换签名，不涉及签名轮换。更换前先导出并保存完整备份；需要卸载旧版时，卸载会删除应用的本地数据。

---

## 二、准备工具和目录

需要的工具只有两类：

- **JDK**：使用其中的 `keytool` 生成、查看和导出证书。
- **Android SDK Build Tools**：使用 `zipalign` 对齐 APK，使用 `apksigner` 签名和验证。

不需要安装 Android Studio。JDK 和工具都可以解压到指定目录使用；如果已经有完整的 Build Tools，也不需要再通过 SDK Manager 下载。

本文使用以下目录，实际操作时替换为自己的路径：

```text
D:\Tool\jdk-21\
D:\AppSigning\
├─ android\
│  ├─ zipalign.exe
│  ├─ apksigner.bat
│  └─ lib\
│     └─ apksigner.jar
├─ keys\
│  ├─ ledger\
│  │  └─ ledger.jks
│  └─ notebook\
│     └─ notebook.jks
├─ certificates\
│  └─ ledger.cer
└─ work\
   └─ ledger\
      ├─ ledger-v1.1.0.apk
      ├─ ledger-release.apk
      └─ ledger-v1.1.0.apk.idsig
```

`keys` 保存私钥，`certificates` 保存可公开的证书，`work` 保存操作过程中的 APK。密码另外保存在密码管理器中。

在 PowerShell 中设置本次窗口使用的 Java 路径：

```powershell
$env:JAVA_HOME = "D:\Tool\jdk-21"
$env:Path = "$env:JAVA_HOME\bin;$env:Path"

& "$env:JAVA_HOME\bin\keytool.exe" -help
```

能显示帮助即表示路径正确。这里的环境变量仅对当前窗口及其启动的程序生效，不会修改系统级配置；重新打开 PowerShell 后需要重新设置。

创建目录：

```powershell
New-Item -ItemType Directory -Force -Path "D:\AppSigning\keys\ledger", "D:\AppSigning\certificates", "D:\AppSigning\work\ledger"
```

---

## 三、生成自己的签名密钥

**这一操作每个软件只需要做一次。以后发布更新，继续使用同一把密钥。**

执行：

```powershell
& "$env:JAVA_HOME\bin\keytool.exe" -genkeypair -v -keystore "D:\AppSigning\keys\ledger\ledger.jks" -storetype JKS -alias ledger -keyalg RSA -keysize 3072 -sigalg SHA256withRSA -validity 10000
```

主要参数：

| 参数 | 含义 |
| --- | --- |
| `-keystore` | 密钥库保存位置 |
| `-storetype JKS` | 使用 JKS 密钥库格式 |
| `-alias ledger` | 密钥条目的别名 |
| `-keyalg RSA -keysize 3072` | 生成 3072 位 RSA 密钥 |
| `-sigalg SHA256withRSA` | 生成自签名证书时使用的签名算法 |
| `-validity 10000` | 证书有效期为 10000 天，约 27 年 |

按提示设置密码和证书信息：

1. 设置密钥库密码，建议使用密码管理器生成独立长密码。
2. 填写名称、组织、城市等证书信息。它们可以被公开查看，避免填写私人住址等敏感内容。
3. 国家或地区的双字母代码，中国可填写 `CN`。
4. 确认信息。
5. 提示输入 `ledger` 的密钥密码时，可以直接回车，使用与密钥库相同的密码。

输入密码时，终端不显示字符是正常现象。看到“正在存储……”并返回命令提示符后，密钥库已经生成。

### 文件名一定要有 release 吗

不需要。`ledger.jks`、`ledger-release.jks` 都是普通文件名，不影响密钥用途。别名也可以直接使用 `ledger`。

如果已经生成了 `ledger-release.jks`，只修改文件名即可，不要为了改名重新生成密钥。重命名文件不会改变其中的密钥，也不会自动修改 alias。

### JKS 警告需要处理吗

可能出现如下提示：

```text
JKS 密钥库使用专用格式。建议……迁移到行业标准格式 PKCS12。
```

这是格式建议，不代表生成失败。JKS 可以正常用于 APK 签名，本文继续使用它，不需要转换。新建密钥库也可以选用 PKCS12；密钥库格式与软件的签名身份是不同概念。

证书信息显示 `Unknown`，通常是对应字段使用了默认值，也不影响本地 APK 签名。

### 导出证书并记录指纹

导出公钥证书：

```powershell
& "$env:JAVA_HOME\bin\keytool.exe" -exportcert -rfc -keystore "D:\AppSigning\keys\ledger\ledger.jks" -alias ledger -file "D:\AppSigning\certificates\ledger.cer"
```

查看证书及指纹：

```powershell
& "$env:JAVA_HOME\bin\keytool.exe" -list -v -keystore "D:\AppSigning\keys\ledger\ledger.jks" -alias ledger
```

保存输出中的 SHA-256 指纹，之后验证 APK 时用它核对。这里导出的是证书，不是私钥。

---

## 四、准备签名工具

我将 Android Build Tools 放在 `D:\AppSigning\android` 中。确认以下文件存在：

```text
D:\AppSigning\android\zipalign.exe
D:\AppSigning\android\apksigner.bat
D:\AppSigning\android\lib\apksigner.jar
```

应保留完整的工具及配套文件，不能只复制 `apksigner.bat`。以下命令使用的是这个实际目录，不需要 Android Studio。

还没有工具时，可以从 Android 官方命令行工具页面获取 SDK Manager，再下载 Build Tools。下载入口和使用文档放在文末。工具下载完成后，本地签名与验证不需要联网。

---

## 五、按实际步骤签名 APK

将待签名 APK 放到：

```text
D:\AppSigning\work\ledger\ledger-v1.1.0.apk
```

**这次操作会将最终签名包写回这个路径，覆盖原文件。需要保留原始包时，先在其他位置备份。**

### 1. 对齐 APK

```powershell
& "D:\AppSigning\android\zipalign.exe" -f -P 16 4 "D:\AppSigning\work\ledger\ledger-v1.1.0.apk" "D:\AppSigning\work\ledger\ledger-release.apk"
```

生成 `ledger-release.apk`，它是接下来用于签名的中间文件。文件名包含 `release` 不代表已经完成正式签名。

`zipalign` 调整 APK 中 ZIP 条目的对齐。`-P 16` 用于将未压缩的原生库按 16 KiB 页边界对齐，不能单独解决原生库本身的 16 KiB 兼容问题。

命令正常完成时可能没有文字输出。可以紧接着执行 `$LASTEXITCODE`，退出码 `0` 表示成功。

### 2. 使用 ledger 密钥签名

```powershell
& "D:\AppSigning\android\apksigner.bat" sign --ks "D:\AppSigning\keys\ledger\ledger.jks" --ks-key-alias ledger --out "D:\AppSigning\work\ledger\ledger-v1.1.0.apk" "D:\AppSigning\work\ledger\ledger-release.apk"
```

看到以下提示时，输入密钥库密码：

```text
Keystore password for signer #1:
```

如果密钥密码与密钥库密码不同，工具可能继续询问密钥密码。密码不显示在终端中，属于正常情况。

这条命令读取中间文件 `ledger-release.apk`，将签名结果写入 `ledger-v1.1.0.apk`。原始包已有的签名会在重新签名时被替换，不需要手动删除 APK 内部文件。

**先对齐，再签名。完成签名后不要继续修改最终 APK，也不要再次对齐它。**

### 3. 验证签名

```powershell
& "D:\AppSigning\android\apksigner.bat" verify --verbose --print-certs "D:\AppSigning\work\ledger\ledger-v1.1.0.apk"
```

本次实际输出的主要内容：

```text
Verifies
Verified using v1 scheme (JAR signing): false
Verified using v2 scheme (APK Signature Scheme v2): true
Verified using v3 scheme (APK Signature Scheme v3): true
Verified using v3.1 scheme (APK Signature Scheme v3.1): false
Verified using v4 scheme (APK Signature Scheme v4): false
Verified for SourceStamp: false
Number of signers: 1
Signer #1 key algorithm: RSA
Signer #1 key size (bits): 3072
```

`Verifies` 表示签名验证通过，v2 和 v3 验证成功，APK 包含一个签名者。并不要求每一项都是 `true`：

| 输出 | 本次如何理解 |
| --- | --- |
| v1 为 `false` | 青鸾记账最低支持 Android 8，可以使用 v2，不必依赖 v1；其他应用应按自己的最低系统版本判断 |
| v3.1 为 `false` | 本次没有使用涉及该方案的密钥轮换，不影响当前安装 |
| v4 为 `false` | 这条验证命令未指定外部 `.idsig` 文件，不能据此判断 APK 签名失败 |
| SourceStamp 为 `false` | 没有来源戳，不影响普通 APK 安装 |

再核对签名证书 SHA-256 指纹。本次 `keytool` 的输出为：

```text
DF:DF:38:B8:75:93:88:6D:CF:63:D9:26:39:0C:81:0B:41:07:5A:99:48:9C:1D:11:78:05:AE:93:34:2D:5C:C5
```

APK 验证输出为：

```text
dfdf38b87593886dcf63d926390c810b41075a99489c1d117805ae93342d5cc5
```

忽略大小写和冒号，两者完全一致，说明 APK 使用了刚生成的这把密钥。读者自己的指纹应与自己的密钥证书对应，不需要与本文相同。证书指纹可以公开，它不是私钥或密码。

还可以检查最终 APK 的对齐结果：

```powershell
& "D:\AppSigning\android\zipalign.exe" -c -v -P 16 4 "D:\AppSigning\work\ledger\ledger-v1.1.0.apk"
```

### 4. 为什么出现三个文件

操作后，目录中出现了三个文件：

| 文件 | 用途 | 是否需要发布 |
| --- | --- | --- |
| `ledger-v1.1.0.apk` | 使用自己密钥签名后的最终安装包 | 是 |
| `ledger-release.apk` | 对齐生成的中间文件，尚未经过本次新密钥签名 | 否，可删除 |
| `ledger-v1.1.0.apk.idsig` | 工具生成的 v4 签名辅助文件，主要用于增量安装 | 普通安装和 GitHub 发布不需要，可删除 |

**在 GitHub Releases 发布最终的 `ledger-v1.1.0.apk` 即可。** `.idsig` 不是另一个安装包，也不是签名私钥。

如果不使用增量安装，可以在以后签名时加入 `--v4-signing-enabled false`，不再生成 `.idsig`。这不会删除之前已经生成的同名辅助文件，旧文件可手动清理。

---

## 六、首次安装与后续版本签名

### 首次从旧签名切换

如果此前使用调试签名，现在改用新生成的密钥，通常不能直接覆盖安装旧版。本文不涉及签名轮换，切换时按以下步骤操作：

1. 在旧版导出完整备份，保存到应用目录之外。
2. 卸载旧版。
3. 安装新签名的 APK。
4. 导入备份，核对账单、分类、票据等数据。

卸载会清除应用本地数据，因此应先完成备份。

### 以后开发完成，如何给新 APK 签名

**不用重新生成密钥，也不用每次重新导出证书。** 保留 `ledger.jks`，新版本继续使用其中的 `ledger` 密钥条目。

以之后发布 `1.1.1` 为例：

1. 在源码构建配置中更新展示版本号，并递增内部版本号 `versionCode`，同时保持包名一致。
2. 构建新的 release APK。可以由自己的构建环境或 CI 生成；用于安装包签名的私钥可以继续只留在本机。
3. 将新 APK 复制到本地待签名目录。
4. 使用同一密钥对齐、签名、验证。
5. 在已安装自己正式签名版本的设备上验证覆盖安装和数据保留，再发布。

为避免以后覆盖原始包，后续示例采用三个不同的文件名：

```text
ledger-v1.1.1-original.apk    新构建的原始包
ledger-v1.1.1-aligned.apk     对齐中间包
ledger-v1.1.1.apk             最终签名包
```

新开 PowerShell 窗口后，先设置 Java 路径：

```powershell
$env:JAVA_HOME = "D:\Tool\jdk-21"
$env:Path = "$env:JAVA_HOME\bin;$env:Path"
```

将新构建的 APK 命名为 `ledger-v1.1.1-original.apk`，放进 `D:\AppSigning\work\ledger`，然后对齐：

```powershell
& "D:\AppSigning\android\zipalign.exe" -f -P 16 4 "D:\AppSigning\work\ledger\ledger-v1.1.1-original.apk" "D:\AppSigning\work\ledger\ledger-v1.1.1-aligned.apk"
```

使用原来的密钥签名，本次关闭不需要的 v4 辅助文件生成：

```powershell
& "D:\AppSigning\android\apksigner.bat" sign --ks "D:\AppSigning\keys\ledger\ledger.jks" --ks-key-alias ledger --v4-signing-enabled false --out "D:\AppSigning\work\ledger\ledger-v1.1.1.apk" "D:\AppSigning\work\ledger\ledger-v1.1.1-aligned.apk"
```

验证签名：

```powershell
& "D:\AppSigning\android\apksigner.bat" verify --verbose --print-certs "D:\AppSigning\work\ledger\ledger-v1.1.1.apk"
```

验证对齐：

```powershell
& "D:\AppSigning\android\zipalign.exe" -c -v -P 16 4 "D:\AppSigning\work\ledger\ledger-v1.1.1.apk"
```

每条命令成功后再执行下一条；出现错误应先处理，不要继续发布。确认签名证书指纹仍与 `ledger.jks` 对应后，使用最终的 `ledger-v1.1.1.apk` 安装和发布。

### 更新时必须保持什么

- **包名保持一致**，否则会被当作另一个应用。
- **使用同一把签名密钥**，不能为每个版本重新生成。
- **内部版本号按发布顺序递增**，便于系统和分发渠道判断更新。
- **确保应用本身的数据迁移兼容**；签名一致只解决更新身份，不保证业务数据兼容。

文件名和 APK 内部版本是两回事。把文件改名为 `ledger-v1.1.1.apk` 不会自动修改应用版本，重新签名也不会修改版本号。

即使新建密钥的文件名、密码、alias 都与旧密钥一样，它仍是另一把密钥，无法恢复原来的签名身份。丢失密钥后不能靠重新执行生成命令来替代。

---

## 七、管理多个软件的密钥

同一份 Android Build Tools 可以给多个软件签名，不需要为每个软件重复准备工具。

不同软件可以共用签名密钥，但对于独立项目，我选择每个软件单独生成一把，便于分别管理，降低单个密钥泄露带来的影响。

例如为 `notebook` 创建密钥：

```powershell
New-Item -ItemType Directory -Force "D:\AppSigning\keys\notebook"

& "$env:JAVA_HOME\bin\keytool.exe" -genkeypair -v -keystore "D:\AppSigning\keys\notebook\notebook.jks" -storetype JKS -alias notebook -keyalg RSA -keysize 3072 -sigalg SHA256withRSA -validity 10000
```

签名时替换密钥路径、别名、输入和输出 APK 路径即可。

建议为每个软件记录：应用名、包名、密钥文件位置、alias、证书指纹和有效期；密码单独保存在密码管理器中。

### 为什么密钥不能上传到公开仓库

拿到私钥及其密码的人，可以用相同签名身份为修改后的 APK 签名。满足包名和版本等条件时，系统可能把它接受为原应用的更新。

因此：

- 私钥库至少保留两份安全备份，密码另行保管。
- 不把密钥和密码提交到 GitHub，也不放进公开的源码压缩包。
- 避免将密钥交给在线签名网站；使用云盘备份时，应了解同步范围并采用合适的加密保护。
- APK、公钥证书、证书指纹可以公开。

如果项目目录可能包含签名配置，可在 `.gitignore` 中增加：

```gitignore
*.jks
*.keystore
*.p12
*.pfx
keystore.properties
```

`.gitignore` 不会移除已经被 Git 跟踪的文件。密钥一旦公开泄露，删除文件或提交记录也不能让已泄露的副本失效。

### 操作后电脑会留下什么

主要是解压的 JDK、Android 工具及许可文件、生成的密钥和证书、处理前后的 APK，以及可能出现的临时文件、下载缓存和 `.idsig` 文件。上述操作不会安装后台服务。

普通 APK 安装和 GitHub 分发通常不需要 `.idsig` 文件；它主要用于支持增量安装的 v4 签名流程。原始 APK、对齐中间文件可按需删除，私钥和密码必须保留。

PowerShell 通常会记录执行过的命令。本文通过交互提示输入密码，密码不会作为命令参数写入历史。是否存在终端录制、云盘同步或其他备份，仍取决于自己的电脑配置。

---

## 参考资料

- [Android 官方：为应用签名](https://developer.android.com/studio/publish/app-signing)
- [Android 官方：apksigner](https://developer.android.com/tools/apksigner)
- [Android 官方：zipalign](https://developer.android.com/tools/zipalign)
- [Android 官方：sdkmanager](https://developer.android.com/tools/sdkmanager)
- [Android 命令行工具下载](https://developer.android.com/studio#command-line-tools-only)
- [Oracle JDK 21：keytool](https://docs.oracle.com/en/java/javase/21/docs/specs/man/keytool.html)
