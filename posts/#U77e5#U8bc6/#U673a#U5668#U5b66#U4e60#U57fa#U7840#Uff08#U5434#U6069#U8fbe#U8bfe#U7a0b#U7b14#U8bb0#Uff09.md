---
title: 机器学习基础（吴恩达课程笔记）
slug: Machine-learning-basics
date: 2026/03/19 23:57:00
updated: 2026/05/04 13:29:45
categories: 
  - 知识
tags: 
  - AI
description: 吴恩达的机器学习基础课程总结，只保留核心部分
---


本文基于《吴恩达机器学习》课程作出的笔记，

极其推荐去看原课程，吴恩达老师讲的真的很好！

这个是博主看的[吴恩达机器学习课程](https://www.bilibili.com/video/BV1owrpYKEtP/?spm_id_from=333.337.search-****card.all.click&vd_source=a5f5222a79c2da01c555a0ac846f3b7c)

！！因为是笔记，建议看完原课程再来阅读，否则很多地方可能看不明白！！

笔记有些谬误和疏漏在所难免，

如果发现，还望指出，感激不尽

---

监督学习：
1，回归：回归任务旨在预测连续型数值，如房价，温度
2，分类：分类任务旨在将实例数据划分到离散类别中。例如，判断一封邮件是垃圾邮件还是正常邮件

**无监督学习：**
**1，聚类**
**2，异常检测**
**3，降维**

---

## 回归：

训练集：用于训练模型的数据集

**输入特征x，输出目标y，训练样本总数m，单个训练样本(x,y)，第i个训练样本( x(^i),y(^i) )，y的估计值或预测值y-hat，输入x经过模型f输出y-hat**

**f(x)=wx+b   具有一个输入变量的线性模型的另一个名称是单变量线性回归，w,b称为模型的参数或w”系数“ b”权重“，f称为模型**

**成本函数(代价函数)：成本函数告诉我们模型的表现如何，以便我们可以使其表现得更好，线性回归的目标是找到合适的参数，使得代价函数J的值尽可能小**

**平方误差代价函数：J(w,b) =  1/2m ∑ ( (y-hat)^(i) - y^(i) )^2   对误差的平方进行计算，改变w,b等参数，得到不同模型，并得到不同代价J**

**梯度下降：一种可以用来尝试最小化任何函数的算法，可以在代码中编写的高效算法，可用于自动找到使成本函数J最小化的参数的值，从而得到最佳拟合线**

**设定一个参数方案为初始猜测，每次稍微修改参数看，尝试减少代价J，知道J最终稳定在或接近最小值**

**从一点开始，沿着最陡的下坡方向走，每一步都让你更快地下山，最后找到一个最低点，那个就是一个极小值**

**梯度下降算法：图中**

**举例参数w：参数**
**学习率a(阿尔法)(0~1)：控制更新模型参数时步长的大小。如下**
![httpsyushilucnusruploads2026032325257816.webp](https://yushilu.cn/usr/uploads/2026/03/2325257816.webp)

**J的导数项(d/dw)\*J(w,b)：控制采取步子的方向和大小，值为正数，w减小；值为负数，w增大。如下**

![httpsyushilucnusruploads202603422325592.webp](https://yushilu.cn/usr/uploads/2026/03/422325592.webp)

![httpsyushilucnusruploads2026033509018453.webp](https://yushilu.cn/usr/uploads/2026/03/3509018453.webp)

**批量梯度下降：梯度下降每一步，我们都在查看所有的训练样本，而不是训练数据的一个子集**

---

## 多特征：

**x下标j：特征列表**
**n：特征总数**
**x上标->(i)：包含第i个训练样本所有特征的列表，或称为向量**
**x上标(i)下标j：第i个训练样本的第j个特征**

**f(x) = w_1*x_1 + ... + w_n*x_n + b：多特征模型**
**w上标-> = [w_1, w_2, ... , w_n] 向量化**
**x上标-> = [x_1, x_2, ... , x_n]**
**简化为：f_w(x) = w上标-> • x上标-> + b   中间是点积**
**以上称为多元线性回归**

**向量化使代码更简洁更快，更容易让人阅读。如下**

![httpsyushilucnusruploads2026033005856908.webp](https://yushilu.cn/usr/uploads/2026/03/3005856908.webp)

**特征缩放：不同特征取值范围差异大时，会使梯度下降慢，重新缩放不同特征为具有可比范围的值，可以提高速度。一般范围大的特征取小的参数w，范围小的特征取大的参数w。如下**

![httpsyushilucnusruploads2026033907768921.webp](https://yushilu.cn/usr/uploads/2026/03/3907768921.webp)

![httpsyushilucnusruploads2026033633427895.webp](https://yushilu.cn/usr/uploads/2026/03/3633427895.webp)

**可通过除以范围最大值，如下**

![httpsyushilucnusruploads2026033667462664.webp](https://yushilu.cn/usr/uploads/2026/03/3667462664.webp)

**或通过均值归一化：先求特征平均值u\_1，然后公式如下**

![httpsyushilucnusruploads2026033206645778.webp](https://yushilu.cn/usr/uploads/2026/03/3206645778.webp)

**或通过Z分数归一化：求特征标准差o\_1和特征平均值u\_1，然后公式如下**

![httpsyushilucnusruploads2026032899171830.webp](https://yushilu.cn/usr/uploads/2026/03/2899171830.webp)

**特征工程：根据数据和需要去创建一个新特征，通常是通过转换和组合原始特征***

**多项式回归：x, x^2, x^3, x^½, ... 根据数据选择不同特征和模型，通过特征给出和多项式回归可以获得更好的模型**

---

## 分类：

**逻辑回归算法：用于解决二分类问题，输出y要么是0要么是1，可以拟合相当复杂的数据**
**逻辑回归模型：逻辑回归中，f(x)的定义发生改变，Sigmoid函数g(z)如下，看起来跟线性回归相似**

![httpsyushilucnusruploads2026032610616971.webp](https://yushilu.cn/usr/uploads/2026/03/2610616971.webp)

**决策边界：z=0的时候，此时的g(z)是一条线，对y=0还是y=1持绝对中立的地方**

![httpsyushilucnusruploads2026033481328604.webp](https://yushilu.cn/usr/uploads/2026/03/3481328604.webp)

![httpsyushilucnusruploads202603435011562.webp](https://yushilu.cn/usr/uploads/2026/03/435011562.webp)

**逻辑回归的代价函数：单个训练样本上的损失L，将所有训练样本的损失相加，就得到代价函数**

![httpsyushilucnusruploads202603946618739.webp](https://yushilu.cn/usr/uploads/2026/03/946618739.webp)

![httpsyushilucnusruploads202603505209642.webp](https://yushilu.cn/usr/uploads/2026/03/505209642.webp)

**逻辑回归中梯度下降实现：**

![httpsyushilucnusruploads2026033349076183.webp](https://yushilu.cn/usr/uploads/2026/03/3349076183.webp)

---

## 过拟合(高方差)：

**完美拟合所有训练数据，泛化能力差，即z是一个高阶多项式，被传递到sigmoid函数中，导致过拟合**
**欠拟合(高偏差)：无法很好地拟合训练集**
**泛化：模型在训练集之外的例子上也能表现良好**
**可以说机器学习的目标是找到一个既不过拟合也不欠拟合的模型**

![httpsyushilucnusruploads2026032761092469.webp](https://yushilu.cn/usr/uploads/2026/03/2761092469.webp)!

![httpsyushilucnusruploads20260355463933.webp](https://yushilu.cn/usr/uploads/2026/03/55463933.webp)

### 过拟合解决：

**收集更多的数据再次训练**

**看看是否可以使用更少的特征，只使用最有用的特征子集**

#### **正则化**

**正则化：对于想要消除的特征，将其参数设置为0.其作用是鼓励学习算法缩小参数的值，而不一定要求参数精确地设置为0，即保留所有特征，但防止特征产生过大影响。而且即使拟合一个高阶多项式，使用较小参数值，最终会得到一条更好的拟合训练数据曲线**

**正则化参数λ，如果λ为0--过拟合，如果λ非常大--欠拟合。新的代价函数试图最小化第一项鼓励算法通过最小化预测值与实际值之间的平方差来很好地拟合训练数据，试图最小化第二项，算法也试图保持参数w\_j较小   均方误差代价+正则化项如下**

![httpsyushilucnusruploads2026033158927226.webp](https://yushilu.cn/usr/uploads/2026/03/3158927226.webp)

**正则化线性回归的梯队下降算法：**

![httpsyushilucnusruploads2026032208776049.webp](https://yushilu.cn/usr/uploads/2026/03/2208776049.webp)

**正则化逻辑回归的梯度下降算法：![httpsyushilucnusruploads2026032852367771.webp](https://yushilu.cn/usr/uploads/2026/03/2852367771.webp)**

---

## 深度学习：

**a代表激活，用a来表示逻辑回归算法的输出，逻辑回归单元可以被认为是简化的单个神经元模型**

**多个神经元组成一组，称为"层"，它们以相同或相似的特征作为输入，并输出一些值，称为"激活值"**

**输入层->隐藏层->输出层**

**神经网络能够自行学习隐藏层的特征，其能从数据中自行找出这些特征，不需要手动设计特征，可以自己学习**

![httpsyushilucnusruploads202603865186938.webp](https://yushilu.cn/usr/uploads/2026/03/865186938.webp)

![httpsyushilucnusruploads2026031962992205.webp](https://yushilu.cn/usr/uploads/2026/03/1962992205.webp)

**神经网络在计算机视觉中应用**

![httpsyushilucnusruploads202603577015712.webp](https://yushilu.cn/usr/uploads/2026/03/577015712.webp)

**上标[i]表示跟第i层神经网络相关的量**
**每层每个神经元有不同参数w\_i, b\_i, 输出激活值a\_i**
**激活函数G：输出激活值的函数，在这里指sigmoid函数**

#### 神经网络工作原理：

**每一层输入一个数字向量并应用一堆逻辑回归单元，然后计算另一个数字向量，然后从一层传递到另一层，直到得到最终输出层的计算**

![httpsyushilucnusruploads2026032402598305.webp](https://yushilu.cn/usr/uploads/2026/03/2402598305.webp)

![httpsyushilucnusruploads202603221342461.webp](https://yushilu.cn/usr/uploads/2026/03/221342461.webp)

#### 前向传播算法：

**传播神经元的激活，向前方向从左到右进行每一层神经元计算![httpsyushilucnusruploads2026033381142663.webp](https://yushilu.cn/usr/uploads/2026/03/3381142663.webp)**

**对于numpy：**
**x = np.array([200, 17](200, 17)) -> [200 17]  一个行向量  1 * 2 矩阵**
**x = np.array([[200],**
**[17]]) -> 一个列向量 2 * 1 矩阵**

#### 单层前向传播：

**指代矩阵时使用大写字母，而小写字母指代向量和**

![httpsyushilucnusruploads2026031579042601.webp](https://yushilu.cn/usr/uploads/2026/03/1579042601.webp)

**从头开始前向传播**

![httpsyushilucnusruploads2026032847579564.webp](https://yushilu.cn/usr/uploads/2026/03/2847579564.webp)

**np.matmul(x\_1,x\_2)是numpy里的矩阵乘法**

![httpsyushilucnusruploads2026032209865618.webp](https://yushilu.cn/usr/uploads/2026/03/2209865618.webp)

#### 矩阵乘法：

**点积**
**[1] . [3]  这是一个点积   等同于 Z=(1\*3)+(2\*4)=11**
**[2]   [4]   a上标-> = []  a上标->T = [] (将行向量转为列向量)**

![httpsyushilucnusruploads2026033447369998.webp](https://yushilu.cn/usr/uploads/2026/03/3447369998.webp)

#### 向量-矩阵乘法：

![httpsyushilucnusruploads2026032185854600.webp](https://yushilu.cn/usr/uploads/2026/03/2185854600.webp)

![httpsyushilucnusruploads202603800010517.webp](https://yushilu.cn/usr/uploads/2026/03/800010517.webp)

#### 矩阵-矩阵乘法：

![httpsyushilucnusruploads2026031846224532.webp](https://yushilu.cn/usr/uploads/2026/03/1846224532.webp)

![httpsyushilucnusruploads2026031535373005.webp](https://yushilu.cn/usr/uploads/2026/03/1535373005.webp)

**损失函数是学习算法的输出和单个样本上的真实标签的函数，而成本函数j是整个训练集上损失函数的平均值**

**指定如何计算输出,给定输入x和参数->指定损失和成本->最小化成本函数**

![httpsyushilucnusruploads2026031631970685.webp](https://yushilu.cn/usr/uploads/2026/03/1631970685.webp)

**ReLU和sigmoid函数：**

![httpsyushilucnusruploads202603589051353.webp](https://yushilu.cn/usr/uploads/2026/03/589051353.webp)

#### 神经网络常用激活函数：

**第一个是线性激活函数，相当于没有激活函数![httpsyushilucnusruploads2026031213868749.webp](https://yushilu.cn/usr/uploads/2026/03/1213868749.webp)**

**梯度下降优化的是成本函数，而不是激活函数**
**可以为不同神经元选择不同激活函数：**

**输出层激活函数：**
**如果是二分类问题，使用sigmoid激活函数**
**如果y有正负值，建议使用线性激活函数**
**如果y只能取正值，建议使用ReLU激活函数**

**隐藏层激活函数：**

**一般使用ReLU函数**![httpsyushilucnusruploads2026031369092000.webp](https://yushilu.cn/usr/uploads/2026/03/1369092000.webp)

#### 为什么需要激活函数：

**常见不要在隐藏层用线性激活函数，如果全是线性激活函数，会导致神经网络不能计算出比线性函数更复杂的特征或学习到比线性函数更复杂的东西，模型将计算出完全等于线性回归的结果**

#### 多类分类：

**分类问题，其中可以有超过两个可能的输出标签**
**softmax回归算法：是逻辑回归的泛化，适用于多分类场景**
**n=2的softmax回归，即只有两种可能的输出类别，计算结果将跟逻辑回归相同，参数最终会有所不同。但最终简化为逻辑回归模型**

![httpsyushilucnusruploads2026031139237307.webp](https://yushilu.cn/usr/uploads/2026/03/1139237307.webp)

**softmax回归的成本函数**![httpsyushilucnusruploads2026031263686459.webp](https://yushilu.cn/usr/uploads/2026/03/1263686459.webp)

**带有softmax函数输出的神经网络：**

#### softmax激活函数跟其他激活函数不同：

**当查看sigmoid/ReLU/线性激活函数是，a\_1是z\_1的函数，并且仅是z\_1的函数，推及2,3,4,...同理，换句话说，为了获得激活值我们可以将激活函数g逐元素应用与z\_1,z\_2,...以得到a\_1,a\_2,...，但是使用softmax激活函数是，a\_1是z\_1,z\_2...,z\_n的函数，因此这些激活值中的每一个都依赖于所有z的值，这是softmax激活函数的一个独特属性**

![httpsyushilucnusruploads2026031849933506.webp](https://yushilu.cn/usr/uploads/2026/03/1849933506.webp)

#### softmax的改进实现：

**根据决定如何计算2除以10000的值，结果可能会有或多或少的数字舍入误差，以下有更精确的Loss函数**

![httpsyushilucnusruploads2026031979594577.webp](https://yushilu.cn/usr/uploads/2026/03/1979594577.webp)

#### 多标签分类：

![httpsyushilucnusruploads2026031546130640.webp](https://yushilu.cn/usr/uploads/2026/03/1546130640.webp)

#### 高级优化：

**在梯队下降中，当学习率较小/较大，导致找到最小值的速度慢时，可以采用Adam(自适应矩估计)优化算法，其可以自动调整学习率，其不使用单一的全局学习率，而是为模型的每个参数使用不同的学习率**

![httpsyushilucnusruploads2026033332823347.webp](https://yushilu.cn/usr/uploads/2026/03/3332823347.webp)

#### 全连接层：

**每一层的每个神经元都从前一层的所有激活中获取输入，还有其他类型的层具有不同的特性**

**卷积层：处理图像的核心技术，例如写个9，卷积层的每个神经元只查看小区域的像素，即只查看输入图像的一个区域。这样的好处，1.加快计算速度，2.可能需要更少的训练数据，3.减少过拟合的可能性**
**如果在一个神经网络中有多个卷积层，有时被称为卷积神经网络，使用卷积层时有很多架构选择，如单个神经元应该看多大的输入窗口，每层应该有多少个神经元，有效地选择架构参数，可以构建新版本的神经网络，这些网络在某些应用中可能比全连接层更有效**

![httpsyushilucnusruploads202603718016076.webp](https://yushilu.cn/usr/uploads/2026/03/718016076.webp)

#### 模型评估：

**评估用公式不包含正则化项，正则化项包含在训练目标中**

**将数据集分为训练集和验证集，提供一种系统评估学习算法效果的方法**

![httpsyushilucnusruploads202603388980735.webp](https://yushilu.cn/usr/uploads/2026/03/388980735.webp)

![httpsyushilucnusruploads2026031775119404.webp](https://yushilu.cn/usr/uploads/2026/03/1775119404.webp)

#### 应用于分类问题：

**这个适用于通过测试误差判断学习算法是否表现良好**

![httpsyushilucnusruploads2026032089759199.webp](https://yushilu.cn/usr/uploads/2026/03/2089759199.webp)

**测量算法误分类的测试集和训练集的比例:**

![httpsyushilucnusruploads2026031928037773.webp](https://yushilu.cn/usr/uploads/2026/03/1928037773.webp)

#### 模型选择与训练：

**泛化误差：训练集中未出现的新样本上的平均误差，说明模型在新数据上的表现如何，使用测试集并报告J*test(w* ,b\_ )**

**下面这个有参数d的影响，会导致一个过于乐观的结果，使得泛化误差小于实际的误差**

![httpsyushilucnusruploads2026031945068083.webp](https://yushilu.cn/usr/uploads/2026/03/1945068083.webp)

**将数据集分为训练集，交叉验证集，测试集**

**交叉验证：cv，用来检查或交叉检查不同模型的有效性或准确性**

![httpsyushilucnusruploads2026034074235945.webp](https://yushilu.cn/usr/uploads/2026/03/4074235945.webp)

**三个学习算法性能的度量，是进行模型选择的方法，选择误差最低的模型**

![httpsyushilucnusruploads2026033898305734.webp](https://yushilu.cn/usr/uploads/2026/03/3898305734.webp)

**下面过程中，使用训练集拟合参数，选择参数d，使用交叉验证集，在此之前没有使用测试集拟合任何参数w,b,d,...，因此J\_test将是一个公平的泛化误差估计值**

![httpsyushilucnusruploads2026031590635622.webp](https://yushilu.cn/usr/uploads/2026/03/1590635622.webp)

**通过模型评估，决定下面三个模型选择哪一个，选择交叉验证值最低的那一个**

![httpsyushilucnusruploads2026031994318626.webp](https://yushilu.cn/usr/uploads/2026/03/1994318626.webp)

**只有在确定了最终模型之后，才在测试集上评估它，这确保测试集是一个公平且不过于乐观的估计，即模型在新数据上的泛化能力如何**

**构建机器学习系统的关键在与如何决定下一步该做什么以提高其性能，查看算法的偏差与方去、差可以很好地指导你下一步该尝试什么**

**诊断偏差与方差：J_train高代表高偏差，J_cv比J_train高代表高方差，高偏差代表在训练集上表现不佳，高方差代表在交叉验证集上表现不佳**

![httpsyushilucnusruploads2026033322241452.webp](https://yushilu.cn/usr/uploads/2026/03/3322241452.webp)

**随着多项式增加，J\_train通常下降，J-cv通常先下降后上升**

![httpsyushilucnusruploads2026032364361845.webp](https://yushilu.cn/usr/uploads/2026/03/2364361845.webp)

---

#### 正则化与偏差方差：

**正则化参数λ高，可能导致高偏差欠拟合，λ低可能导致高方差过拟合**

![httpsyushilucnusruploads2026033140802572.webp](https://yushilu.cn/usr/uploads/2026/03/3140802572.webp)

**选择最合适的λ：使用交叉验证找到J\_cv最小时的λ**

![httpsyushilucnusruploads202603791164021.webp](https://yushilu.cn/usr/uploads/2026/03/791164021.webp)

**J\_cv与λ的关系**

![httpsyushilucnusruploads2026032316807934.webp](https://yushilu.cn/usr/uploads/2026/03/2316807934.webp)

---

#### 基准性能水平：

**你合理期望你的学习算法最终能达到的误差水平是什么，如何建立基准性能水平？**

**1.测量人类在这个任务上的表现。**
**2.如果有某种竞争算法并且你能测量它，就可以建立一个基准性能水平。**
**3.依靠经验去猜测**
**查看基准性能水平,训练误差,交叉验证误差，然后测量训练误差与基准性能水平的差异(如果差异大代表高偏差)，测量训练误差和交叉验证误差的差异(如果差异大代表高方差)**

![httpsyushilucnusruploads2026032921797095.webp](https://yushilu.cn/usr/uploads/2026/03/2921797095.webp)

---

#### 学习曲线：

**一种帮助理解你的算法在经验量增加时表现的方法**

![httpsyushilucnusruploads2026034004833161.webp](https://yushilu.cn/usr/uploads/2026/03/4004833161.webp)

#### 具有高偏差学习算法的学习曲线：

**如果算法具有高偏差，获得更多的训练数据本身并不会有多大帮助，J\_cv,J\_train曲线会在一段时间后趋于平坦**

![httpsyushilucnusruploads2026031822840830.webp](https://yushilu.cn/usr/uploads/2026/03/1822840830.webp)

#### 具有高方差学习算法的学习曲线：

**如果算法具有高方差，获得更多训练数据来降低交叉验证误差，使算法表现得更好是可能的**

![httpsyushilucnusruploads2026033987781721.webp](https://yushilu.cn/usr/uploads/2026/03/3987781721.webp)

#### 调试学习算法：

**减少训练集大小，可以更好的拟合训练集，但这往往会恶化交叉验证误差和学习算法的性能，所以不要随意丢弃训练样本试图解决高偏差问题**

![httpsyushilucnusruploads202603165576264.webp](https://yushilu.cn/usr/uploads/2026/03/165576264.webp)

---

#### 偏差, 方差与神经网络：

**1.只要你适当地正则化，使用更大的神经网络几乎不会有什么坏处，但神经网络增大，会减慢训练和推理过程。**
**2.只要训练集不是太大，那么一个神经网络，尤其是大型神经网络，通常是一个低偏差机器，非常适合拟合复杂函数**

![httpsyushilucnusruploads2026032801380692.webp](https://yushilu.cn/usr/uploads/2026/03/2801380692.webp)

---

#### 超参数：

**机器学习和深度学习中，在模型训练之前需要手动设置的参数。**

**开发机器学习系统的过程：**
**1.决定系统的整体架构，即选择机器学习模型,使用什么数据,选择超参数**
**2.根据决策，实现并训练一个模型**
**3.实施或查看一些诊断，如查看算法偏差,方差,错误分析**
**4.做出决策，是否让神经网络更大，或改变正则化参数，或添加更多数据或添加更多特征或减少特征，或...**
**5.达到想要的性能**

![httpsyushilucnusruploads2026031207100172.webp](https://yushilu.cn/usr/uploads/2026/03/1207100172.webp)

---

#### 错误分析：

**通过手动检查一组你的算法错误分类或错误标记的样本。将错误分析应用于你可以解决的问题，它对于集中注意力于更有希望尝试的事情非常有帮助**

#### 增加数据：

**1.添加所有数据费时费力，一种替代方法是专注于添加错误分析表明可能有帮助的类型的更多数据，只需添加少量数据，但能显著提升算法性能**

**2.数据增强：利用现有的样本创建新的训练样本。如对图像进行扭曲,旋转,...以创造额外样本，又如将不同的音频进行叠加。数据增强的一个技巧是，对数据所做的更改或扭曲应代表测试集中可能出现的噪音或扭曲类型**

**3.数据合成：从头开始创建全新的样本。最常用于计算机视觉任务**

#### 迁移学习：

**允许使用来自不同任务的数据帮助来你的应用**

**首先使用一组数据训练一个神经网络，然后保留除输出层外的参数w,b，将输出层替换为想要的输出层并使用Adam优化算法/梯队下降重新训练输出层参数。具体来说，1.选择只训练输出层参数。2.训练网络中所有参数，但前四层参数将使用在顶部训练的只进行初始化。如果数据集较小使用1，较大用2**

#### 监督预训练的步骤：

**首先在大数据集上进行训练，然后在较小的数据集上进一步调整参数。**

**首先在大数据集上训练神经网络，然后微调，使用初始化的参数或从监督预训练中获得的参数，进一步运行梯队下降来微调权重，以适应你可能的具体应用**

#### 机器学习项目的完整周期：

**1.确定项目范围，即决定项目的具体内容和想要解决的问题**
**2.收集数据，决定训练机器学习系统需要哪些数据，并进行工作以获取数据和相应的标签**
**3.训练模型：训练模型->错误分析/偏差方差分析->改进模型**
**4.部署到生产环境，确保继续监控系统的性能，并在性能下降时维护系统以恢复性能**
**部署：将机器学习模型实现到一个服务器上，称为推理服务器，其工作是调用机器学习模型，以便进行预测。如果已经实现一个移动应用，当用户与移动应用对话时，移动应用可以发起一个API调用，将数据传递给推理服务器，服务器应用机器学习模型，返回模型的预测结果。根据所需的应用程序规模，可能需要软件工程确保推理服务器能进行可靠高效的预测，不产生过高的计算成本**

#### 偏斜数据集：

**正负样本的比例远非50-50的数据集**

**处理偏斜数据集时，通常使用不同误差指标，不仅仅是分类误差来判断学习算法的表现，常用误差指标是精确率和召回率**

**为了评估学习算法在一个稀有类别上的表现，构建一个混淆矩阵会很有用**


| 1      实际类别      0                                             |
| ------------------------------------------------------------------ |
| 预测   1                                                           |
| 类别   0                                                           |
| ---------------------------------                                  |
| TP：模型说对了        FN：模型把对的说错了                         |
| FP：模型把错的说对了   TN：模型说对了                              |
| 决策阈值：预测结果大于阈值为正类(1)，小于阈值为负类(0)             |
| 精确率P：决策正确的精准度，即预测1的样本中实际多少为1              |
| 公式：精确率 = TP / (TP + FP)                                      |
| 召回率R：查全的覆盖度，即所有实际1的样本中正确预测多少             |
| 公式：召回率 = TP / (TP + FN)                                      |
| F1分数：结合精确率和召回率，帮助选择两者间最佳权衡                 |
| 公式：F1值 = 2*（精确率 * 召回率）/（精确率+召回率）               |
| 准确率：需要审慎看待                                               |
| 公式：准确率 = （TP + TN）/（TP + FP + FN + TN）                   |
| 提高阈值可以提高精确率，但会降低召回率; 反之降低精确率，提高召回率 |

---

## 决策树模型：

**从根节点，经过分支，到达决策节点，决策后再通过分支到达下一个决策节点，最终到达叶节点做出预测**

![httpsyushilucnusruploads2026034139388035.webp](https://yushilu.cn/usr/uploads/2026/03/4139388035.webp)

**决策树学习算法的任务：从所有可能的决策树中，尝试挑选一个在训练集上表现良好，在理想情况下也能很好地泛化到新数据的树**

**纯度：数据集中样本标签的一致性程度**

**节点的深度：从根节点到该节点所需的跳数**

**学习过程：**
**1.决定如何在每个节点上选择要分裂的特征**
**2.决定何时停止分裂，可以设定最大深度，这是超参数。防止树过大和难以管理，保持树小不容易过拟合**

---

#### 熵H(p_1)：

**衡量样本集不纯度的一个指标，当熵值高时，不纯度大，反之不纯度小。**

**p_1表示在样本集中被分类为1类的样本的概率**

**w上标left/right：为根节点中所有样本进入左/右子分支的样本比例**

![httpsyushilucnusruploads2026031704278647.webp](https://yushilu.cn/usr/uploads/2026/03/1704278647.webp)

**决策树学习中，熵的减少称为信息增益，衡量的是你在树中通过分割获得的熵减少量**

**在每个节点，与分割相关的有两个数字，左子分支的熵和右子分支的熵，通过加权平均合并两个数字，因为在子分支中拥有低熵的重要性也取决于有多少样本进入左或右子分支。**

**根节点的熵 - 左右子分支加权熵 = 信息增益(熵减少量)**

**可以设定阈值，如果信息增益太小，可以决定不必要增加树的大小并冒着过拟合风险进行分割**

![httpsyushilucnusruploads2026033474415628.webp](https://yushilu.cn/usr/uploads/2026/03/3474415628.webp)

**对于特征可能有多个值，使用独热编码的分类特征：**

**不再是一个特征取K个可能值，而是构造K个二元特征，每个特征只能取两个可能值中的一个即0/1。这些特征中总有一个取1，这就是"热"特征。**

**该方法也适用于训练神经网络/线性回归/逻辑回归**

![httpsyushilucnusruploads2026034291107634.webp](https://yushilu.cn/usr/uploads/2026/03/4291107634.webp)

**处理连续值特征：尝试不同的阈值，进行通常的信息增益计算，并在所选阈值的连续值特征上进行分割，如果它能给你所有可能特征中最佳的信息增益**

---

#### 回归树：

**专攻连续型数值预测的决策树模型，聚焦连续型数值**

**将根据一系列特征分组，最后得到叶节点，叶节点是样本的平均数值。分割时计算根节点的方差和节点加权方差，相减得到方差减少值，在每个节点选择给出最大方差减少的特征**

![httpsyushilucnusruploads2026031088143777.webp](https://yushilu.cn/usr/uploads/2026/03/1088143777.webp)

**单一决策树弱点是对于数据微小变化非常敏感，单一样本变化就可能导致完全不同的决策树**

**决策树集成：多个决策树的集成。使用多个决策树，从不同特征开始做出预测并对结果进行投票，使得算法对单一决策树行为不那么敏感，使算法更健壮**

![httpsyushilucnusruploads2026032626474318.webp](https://yushilu.cn/usr/uploads/2026/03/2626474318.webp)

**有放回采样：从一个总体中抽取样本时，每次抽取后都将样本放回总体中。该过程构建一个新的训练集**

**随机森林算法：一个决策树集成算法，探索并平均了许多对训练集的微小变化**

**袋装决策树算法：使用有放回采样获得新训练集，使用新训练集训练一棵决策树，重复B次，获得B棵决策树，让这些树投票决定最终的正确预测。将B设置的大永远不会损害性能，但超过某个点后，会得到收益递减，一般在64-128之间**

**随机森林算法：尝试在每个节点上随机化特征选择。在每个节点选择特征进行分割时，如果有n个特征可用，不在n个特征中选择，选择一个随机子集k(k<n)，允许算法仅从该k个特征的子集中选择。**

**当n很大时，典型选择值是n的平方根**

**无监督学习：模型得到的数据集只有x，没有标签，需要算法在数据中找到一些有趣的东西**

**聚类算法：查看数据集，并尝试将其分组为聚类，即相互相似的组**

![httpsyushilucnusruploads2026032820367980.webp](https://yushilu.cn/usr/uploads/2026/03/2820367980.webp)

---

#### K-均值算法：

**1.随机初始化猜测K个聚类的中心位置，即聚类中心，位置为μ\_k，都是向量，跟样本x具有相同维度**

**2.遍历所有样本，检测每个点更接近哪个聚类中心**

**3.根据每个点更接近哪个聚类中心来分配这些点**

**4.查看同一聚类的所有点并取它们的平均值，然后移动聚类中心到平均值位置**

**5.重走step2-3-4**

**6.当聚类中心位置不再变化，表明K-均值算法已经收敛**

![httpsyushilucnusruploads202603110091145.webp](https://yushilu.cn/usr/uploads/2026/03/110091145.webp)

**c上标(i)：聚类的索引     μ\_c上标(i)：分配给样本x\_i的聚类中心的聚类**

**如果有聚类中心没有分配到任何训练样本，step2将没有意义。如果发生这种情况，常见做法直接消除那个聚类中心，或者重新初始化那个聚类中心**

**K-均值算法实际上在优化一个代价函数：失真函数J，试图最小化J。每一次迭代中，失真函数一个下降或保持不变，否则代表代码错误，一旦停止，通常代表收敛**

[105.优化目标.\_哔哩哔哩\_bilibili](https://www.bilibili.com/video/BV1owrpYKEtP?spm_id_from=333.788.player.switch&vd_source=a5f5222a79c2da01c555a0ac846f3b7c&p=105)

![httpsyushilucnusruploads2026033469635666.webp](https://yushilu.cn/usr/uploads/2026/03/3469635666.webp)

**使用k均值算法时，推荐多次使用随机初始化，以获得更低的失真函数值**

**选择聚类数量：根据k-均值在后续下游目的上的表现来评估它**

**异常检测算法：会查看一个未标记的正常事件数据集，并从中学习如何检测或标记异常事件。应用异常检测需要正态分布**

**密度估计：得到有m个例子的训练集时，首先建立一个x的概率模型。即找到哪些值具有高概率，哪些值低概率或不太可能出现**

**p(x)函数：判断x在数据中出现的可能性大小**

![httpsyushilucnusruploads2026032288809789.webp](https://yushilu.cn/usr/uploads/2026/03/2288809789.webp)

**高斯/正态分布：**

![httpsyushilucnusruploads2026034038320765.webp](https://yushilu.cn/usr/uploads/2026/03/4038320765.webp)

**μ与σ对于正态分布的影响**

![httpsyushilucnusruploads2026033931291108.webp](https://yushilu.cn/usr/uploads/2026/03/3931291108.webp)

**设置μ与σ**

![httpsyushilucnusruploads2026032940232107.webp](https://yushilu.cn/usr/uploads/2026/03/2940232107.webp)

---

#### 构建异常检测算法：

**1.选择你认为可能指示异常样本的特征x\_i**

**2.为数据集的n个特征拟合参数μ\_1\~μ\_n和σ平方1\~σ平方n**

**3.计算p(x)并判断是否小于ε，如果小于判断为异常**

![httpsyushilucnusruploads2026033335492514.webp](https://yushilu.cn/usr/uploads/2026/03/3335492514.webp)

![httpsyushilucnusruploads2026032830045958.webp](https://yushilu.cn/usr/uploads/2026/03/2830045958.webp)

![httpsyushilucnusruploads202603978697067.webp](https://yushilu.cn/usr/uploads/2026/03/978697067.webp)

---

#### 开发和评估异常检测系统：

**给定交叉验证集和测试集，其中有一些样本有标签，并有一些异常样本**

**1.首先在训练集上拟合模型p(x)**

**2.在交叉验证集或测试集上验证p(x)，如果p(x) < ε，预测y=1即异常，反之预测y=0**

**3.查看算法在交叉验证集或测试集上的预测准确度，是否与你在交叉验证集或测试集中拥有的标签y相匹配**

![httpsyushilucnusruploads2026031112983662.webp](https://yushilu.cn/usr/uploads/2026/03/1112983662.webp)!

![httpsyushilucnusruploads202603742908805.webp](https://yushilu.cn/usr/uploads/2026/03/742908805.webp)

---

#### 异常检测与监督学习的对比：

**当你有少量正样本和相对大量的负样本时，异常检测算法通常更合适。使用负样本构建p(x)的模型，使用正样本用于交叉验证集和测试集的参数调优和评估。**

**当你有大量正样本和负样本时，监督学习更合适。**

**异常检测通常用于查找与过去不同的任何情况; 监督学习通常用于查找与过去情况相似的情况，即用于发现已知和之前见过的异常**

![httpsyushilucnusruploads2026033737186104.webp](https://yushilu.cn/usr/uploads/2026/03/3737186104.webp)

![httpsyushilucnusruploads202603568864927.webp](https://yushilu.cn/usr/uploads/2026/03/568864927.webp)

#### 选择使用哪些特征：

[113.选择使用哪些特征\_哔哩哔哩\_bilibili](https://www.bilibili.com/video/BV1owrpYKEtP?spm_id_from=333.788.player.switch&vd_source=a5f5222a79c2da01c555a0ac846f3b7c&p=113)**

---

#### 推荐系统：

**利用机器学习算法，根据用户的历史行为、偏好和其他数据，为用户推荐个性化内容或产品的系统**

**使用项目特征：代价函数：**

**[115.使用项目特征\_哔哩哔哩\_bilibili](https://www.bilibili.com/video/BV1owrpYKEtP?spm_id_from=333.788.player.switch&vd_source=a5f5222a79c2da01c555a0ac846f3b7c&p=115)**

![httpsyushilucnusruploads2026032842433294.webp](https://yushilu.cn/usr/uploads/2026/03/2842433294.webp)

![httpsyushilucnusruploads2026031579926916.webp](https://yushilu.cn/usr/uploads/2026/03/1579926916.webp)

---

#### 协同过滤算法：

**基于用户行为的相似性，推荐其他用户喜欢的内容。**

**发现相关项目：例如当你查看一个商品时，它会向你推荐其他相关的类似商品。**

![httpsyushilucnusruploads2026031405549232.webp](https://yushilu.cn/usr/uploads/2026/03/1405549232.webp)

![httpsyushilucnusruploads2026033812132080.webp](https://yushilu.cn/usr/uploads/2026/03/3812132080.webp)

**当J(x(i))最小时，选择该x特征。下面将上面两个代价函数联合在一起，最小化该成本函数，可以使用梯度下降**

![httpsyushilucnusruploads2026032899582244.webp](https://yushilu.cn/usr/uploads/2026/03/2899582244.webp)

**二元标签的损失函数与成本函数：**

![httpsyushilucnusruploads2026033734002428.webp](https://yushilu.cn/usr/uploads/2026/03/3734002428.webp)

---

#### 均值归一化：

**将原始数据减去其均值，使得数据的中心值变为 0，从而消除不同数据之间的整体偏移，让模型更关注用户和物品之间的相对关系。**

**当用户和电影数量庞大时，评分矩阵里大部分位置都是空的（未观测）此种情况会带来两个难题：**

**1.模型无法直接学习该用户的偏好：1. 协同过滤需根据已有评分来推断用户兴趣，但 Eve 没有任何历史数据，模型无法提取特征向量 w(j)w(j)。**

**2.推荐结果偏差：如果简单把缺失值当作 0，会导致错误的结果，因为“没评分”并不等于“不喜欢”。**

![httpsyushilucnusruploads2026033209196730.webp](https://yushilu.cn/usr/uploads/2026/03/3209196730.webp)

![httpsyushilucnusruploads2026031659592867.webp](https://yushilu.cn/usr/uploads/2026/03/1659592867.webp)

---

#### 劣势：

**1.不太擅长处理冷启动问题，即对于新项目，很少有用户对其评分；或有一个新用户，只对很少的项目评分**

**2.没有提供一种自然的方式来使用辅助信息或关于项目或用户的额外信息**

![httpsyushilucnusruploads202603375855117.webp](https://yushilu.cn/usr/uploads/2026/03/375855117.webp)

---

#### 基于内容的过滤：

**主要依赖于物品的特征，例如电影的类型、导演、演员，或文章的关键词等。通过计算用户与物品特征的相似度，系统可以预测用户可能喜欢的物品。**

![httpsyushilucnusruploads2026032044453433.webp](https://yushilu.cn/usr/uploads/2026/03/2044453433.webp)

![httpsyushilucnusruploads2026032753097138.webp](https://yushilu.cn/usr/uploads/2026/03/2753097138.webp)

![httpsyushilucnusruploads2026033184596908.webp](https://yushilu.cn/usr/uploads/2026/03/3184596908.webp)

---

#### 从大规模目录中推荐：

**1.检索：生成一个包含大量合理候选项目的列表，试图涵盖你可能推荐给用户的许多东西**

**2.排序：进行微调并挑选出最佳项目推荐**

![httpsyushilucnusruploads2026033490250410.webp](https://yushilu.cn/usr/uploads/2026/03/3490250410.webp)

![httpsyushilucnusruploads2026031603491243.webp](https://yushilu.cn/usr/uploads/2026/03/1603491243.webp)

#### 主成分分析算法(PCA)：

**常用于可视化。当拥有大量特征，PCA可帮助你减少特征帮助你可视化它。如果特征取值范围不同，需先进行特征缩放
[127.PCA算法（可选）\_哔哩哔哩\_bilibili](https://www.bilibili.com/video/BV1owrpYKEtP?spm_id_from=333.788.player.switch&vd_source=a5f5222a79c2da01c555a0ac846f3b7c&p=127)**

---

## 强化学习：

**一个“会做决定的智能体”，在不断试错中，学会怎样做，才能让长期得到的奖励最多。即输入状态，通过奖励函数判断，然后改进。**

**永远重复一个循环：看情况 → 做选择 → 得到结果 → 调整下次选择，也就是：状态 → 动作 → 奖励 → 学习。**

**强化学习中的回报：回报被定义为奖励的总和，但加权一个额外的因素：折扣因子，常见选择是非常接近1的数字。**

**回报概念捕捉到可以更快获得的将来可能比需要长时间才能获得的奖励更具吸引力**

**强化学习目标：设计一个称为策略Π的函数，接受任何状态s作为输入，并映射到它希望我们采取的某个动作a**

![httpsyushilucnusruploads2026031200648190.webp](https://yushilu.cn/usr/uploads/2026/03/1200648190.webp)

#### 关键概念回顾：

马尔可夫决策(MDP)：未来只取决于当前状态，而不取决于到达当前状态前的可能发生的任何事情**

![httpsyushilucnusruploads2026032161530174.webp](https://yushilu.cn/usr/uploads/2026/03/2161530174.webp)

![httpsyushilucnusruploads2026033615421946.webp](https://yushilu.cn/usr/uploads/2026/03/3615421946.webp)

---

#### 强化学习算法试图计算的量：

**状态-动作值函数(Q)：从当前状态 s 开始，沿着策略 π 执行动作所能获取的预期总回报
[134.状态-动作值函数的定义\_哔哩哔哩\_bilibili](https://www.bilibili.com/video/BV1owrpYKEtP?spm_id_from=333.788.player.switch&vd_source=a5f5222a79c2da01c555a0ac846f3b7c&p=134)**

#### 贝尔曼方程：

**帮助计算状态-动作值函数**

**回报有两个部分：1.立即获得的奖励。2.γ乘以从下一个状态s'开始的回报**

![httpsyushilucnusruploads2026033530968216.webp](https://yushilu.cn/usr/uploads/2026/03/3530968216.webp)

![httpsyushilucnusruploads2026032832018039.webp](https://yushilu.cn/usr/uploads/2026/03/2832018039.webp)

![httpsyushilucnusruploads2026032729551918.webp](https://yushilu.cn/usr/uploads/2026/03/2729551918.webp)

![httpsyushilucnusruploads202603665016416.webp](https://yushilu.cn/usr/uploads/2026/03/665016416.webp)

---

#### ε-贪婪策略：

**当算法在运行学习，并且还未对Q值函数有一个很好的估计时：**

**1.选择一个最大化Q值函数的行动A**

**2.随机选择行动(ε-贪婪策略) ε=0.05**

**由于随机初始化，如果神经网络由于某种原因最初认为某些事情不好，那么选项1意味着它将永远不会尝试那些行动**

![httpsyushilucnusruploads202603480343766.webp](https://yushilu.cn/usr/uploads/2026/03/480343766.webp)

#### 强化学习的改进：

**1.使用小批量：可以加速强化学习算法，还可加速监督学习算法**

**2.软更新：防止Q函数因为一次不幸的步骤而变差，帮助强化学习算法更好地收敛到一个好的解决方案**

**如果训练集过大，梯度下降会很慢，将训练集分为多个少量数据的子集，每次迭代选择一个子集吗，会更快
软更新：每次更新w和b等参数时，设置a的更新加上b的原参数，a+b=1**

![httpsyushilucnusruploads2026031832206929.webp](https://yushilu.cn/usr/uploads/2026/03/1832206929.webp)

---

## 总结：

**监督学习：线性回归，逻辑回归，成本函数，梯度下降，神经网络，决策树，决策树集成，偏差和方差，训练集交叉验证集测试集**

**无监督学习：聚类算法，异常检测算法，协同过滤，基于内容的过滤，推荐系统，强化学习**

**最后，Thank you.**

![httpsyushilucnusruploads2026031384719575.webp](https://yushilu.cn/usr/uploads/2026/03/1384719575.webp)
