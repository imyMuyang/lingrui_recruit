# HanYe Agent CTF

我们准备了一个人机协同的 CTF 比赛，用于测试 Agent 的功能。

具体来说，你可以在进入比赛网站时按照网站提示设置模型相关信息，然后在模型的指导下完成整个比赛内容，获得 Flag。

实现用户界面的代码由 Deepseek 写出，加解密代码也由 Deepseek 写出，而具体的 function calling、 Agent loop 等核心流程由我处理。

在 Agent 模块中，我们确定了模型、初始系统提示词以及工具定义，并且实现了一个 Message Handler。在 Tool 模块中，我们硬编码了几个用于测试的电影相关信息（也是 DS 收集的），并且准备了 search 和 decrypt 函数供 LLM 调用。


## 预览
![pasted-image.png · 145](https://img.cdn1.vip/i/6ac8944c2adef_1791530060.webp)
（这是原生态的 Message Handler 实现，用来和最后对比）
![pasted-image.png · 60](https://img.cdn1.vip/i/6ac894fca1076_1791530236.webp)
（这是正常询问，LLM 调用工具查询信息，最后正确 Decrypt 得到 Flag。截图中的 Flag 是假的。）
![pasted-image.png · 96](https://img.cdn1.vip/i/6ac895c9ac165_1791530441.webp)
![pasted-image.png · 83](https://img.cdn1.vip/i/6ac895e005e15_1791530464.webp)
（进行提示词注入攻击，Agent 能够正常通过破甲测试）

## 搭建 Loop

说起是个智能循环，实际上就是 for 循环。（当然只要允许，while true 也是可以的）在循环内采用 try catch，fetch 的部分参考 API Doc，上面怎么说就怎么填写请求，然后 await res.data，等到了 data 之后就是决策过程了。根据 message 是否有 tool use，如果没有（LLM 回复消息）就停下循环并且更新气泡，如果有就调用工具并且把工具的调用结果加入到 ctx。

## Function Calling 需要注意的点

- JS 中用于和 Agent 对接的真实函数不应当用 function(param1, param2)，而是采用 Object，这样可以直接和 API 发送的请求对接起来。

- 调用函数的时候传入的 JSON 还是 Object 需要好好确定，否则服务器会爆出 422 错误，当时测试的时候和 [这个](https://github.com/chatboxai/chatbox/issues/1740) 的错误类型是一样的，也是数组那出了问题。

## 模型的选择

如果仔细看了我的预览图，可以发现我最初并没有使用 DS API，而是用的 InternAgent 的免费的 Intern-A1 模型。不得不说，这个模型真的拉垮，我大部分时间其实是在跟这个模型智斗。

![pasted-image.png · 40](https://img.cdn1.vip/i/6ac89a0c61f97_1791531532.webp)

（实际上这个模型还有把 Tool Use 当 Assistant Message 发出来的，乱说一气的情况，但是我没截到，当时受不了了给 DS 怒充了一块钱，然后后面就是 DS 一起猜测的了）

不过 DS 是真的聪明啊，一开始就直接大批量调用工具查询信息，把电影直接都猜出来了，还好后面给系统提示词加入限制，就不会这样做了。

## 不足

由于这只是一个简单的测试，鲁棒性是严重不足的，例如前端直接存储了明文 flag，缺乏后端对函数合理性验证等等情况。这是一道前端题，因此也没有办法把后端逻辑也给补出来（我也不太会 QUQ），但是理论上基于 DS 的执行度，不会出现什么大的乱子。

## 另外

其他想说的都在代码里了。如果还需要更多对代码的解释、分析，可以在后续题解补充。

前面几道题其实还好，但是这道题涉及到工程，必须得多看一下鲁棒性的设计了。拿 DS 做好像是传统环节了，但是 **为什么 DS 的前端搭配 Agents-A1 明显变好了？** 难道是有什么特殊的 Trick？

![pasted-image.png · 94](https://img.cdn1.vip/i/6ac89d8d90a80_1791532429.webp)