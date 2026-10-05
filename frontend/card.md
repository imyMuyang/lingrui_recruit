# 分析

卡片布局常见的是 flex 和 grid 布局，在目前的格局下，[两者都有各自的作用](https://chat.deepseek.com/share/2myzfjwsubydoxcdd7)，由于我实现的页面布局比较简单，同时我想实现响应式布局，所以用 grid 或许是个好主意（在 media query 之后我可以重新设计 grid parent 具体是怎么布局的，直接变成单栏布局）。

由于卡片需要有图片，我也不知道该选取什么主题来做这个页面，偶然看到了我的桌面，不如就用 Bing 每日一图吧。根据每日一图的想法，我们把页面设计为一个 Bing 每日一图展示页面，每个卡片带有图片、标题，同时在点击之后能展现出图片的详细信息。

# 做题

![pasted-image.png · 275](https://img.cdn1.vip/i/6ac3192abcf98_1791170858.webp)
![pasted-image.png · 3535](https://img.cdn1.vip/i/6ac3195c12de4_1791170908.webp)
![pasted-image.png · 945](https://img.cdn1.vip/i/6ac31979c6fc7_1791170937.webp)

## 实现布局

我在 [Grid Generator](https://cssgridgenerator.io/) 找到了可以一键布局的工具，先用工具把我需要的布局确定好，之后再复制代码到网站里面。

复制之后就是重复的手动的填充内容阶段了，不同于之前 Dark Mode 设置背景，我这里就直接用 img 把图片放到卡片里面了。

## 我图呢

图片不能溢出，同时必须占满卡片，比例也要正确。这个好说，在父元素（卡片）那里设置 `overflow: hidden`，同时 img 设置

```css
  width: 100%;
  height: 100%;
  object-fit: cover;
```

即可。

## 遮罩——你怎么飞了——

参考之前 Dark Mode 题目的遮罩，我们可以准备一个黑色透明遮罩放到图片之上，遮罩可以只显示标题，在后面点击之后显示完整的描述信息。

absolute 最大的特点就是“自由”。在 absolute 的布局之下，元素几乎是想去哪就去哪，由于我 card 没设置为 relative 给遮罩做定位参考，遮罩一步步定位到 body，挤占在页面的最上面。后面设置之后一切都恢复正常了。

## 跳一跳

接下来是设计动画效果。hover 就把 img scale 放大就好啦，不需要太过于复杂。遮罩的话，根据设计，需要对 mask 的高度进行设置达到遮罩弹跳的效果，同时要对 mask desc 的透明度进行调节。（这里设置透明度而不是 display 是因为不好处理渐变的过程）

遮罩在最初状态的时候有一个 height 参数设置的百分比，但是后续不同布局在弹出的时候经常出错，因此最后采用的是“初态设置 50px 的 max-height，弹出时解除限制”的方案。

**但是还是有个问题，在大页面布局的时候，我不知道怎么让 mask 撑满整个卡片，不是 100%，会超出去，莫非是 padding/margin 的问题？**

## 为什么不跳

点击 card 的时候不能够触发遮罩的动画，这是为什么？因为 div 没所谓的 active 状态。真正的“active”是我们在 DOM 加载完之后用一段小脚本监听了卡片点击事件，并且 toggle 一个 active 类。

## 另外

用 Deepseek 做了一遍

![pasted-image.png · 1242](https://img.cdn1.vip/i/6ac31ee18f025_1791172321.webp)

一股 AI 味啊
