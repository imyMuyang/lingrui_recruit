# Discover "Title"

当我们在分析到名字时，会发现其中每一个名字中间都有一个头衔。头衔是逗号后句号前中间的字符串，采用 `split` 分隔，`strip` 除去空白字符即可。

使用 `print(set(data["Title"]))` 将其提取并去重后，可以得到每一个头衔的信息如下。

```
{'Mrs', 'Mme', 'Sir', 'Col', 'Jonkheer', 'Rev', 'Ms', 'Major', 'the Countess', 'Lady', 'Master', 'Miss', 'Capt', 'Mlle', 'Mr', 'Don', 'Dr'}
```
[Deepseek 对这些头衔的分析](https://chat.deepseek.com/share/191ec1npo04adq1eui)

由于 Age 等数据已经给出，事实上用这些头衔确定年龄必要不大；则根据这个头衔主要可以得到：

1. 是否是权贵 (VIP)
2. （女性）是否结婚（Married）

在后续将这些数据处理之后，Title 这一行可以直接删去