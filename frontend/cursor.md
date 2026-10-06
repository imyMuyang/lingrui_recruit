# 分析

首先，我们要让原生光标消失；其次，我们要新建一个（或者多个）光标元素，并在 JS 里处理其逻辑，刷新位置、hover、mousedown 的状态切换逻辑；最后，我们要在 CSS 当中设置好过渡的动画效果和每个状态需要拥有的样式。

由于软糯小祥等光标样式需要我自己设计，而我又是这方面的苦手，所以就暂且考虑使用原生的图形完成光标的设计。我的想法是：中间一个小点（dot）加上外面一层环（ring），环追着点（光标）动，在移到可互动的元素时环变大，点击时环和点变小达到跟手效果。

# 做题

![pasted-image.png · 307](https://img.cdn1.vip/i/6ac490e6998c7_1791267046.webp)
![pasted-image.png · 44](https://img.cdn1.vip/i/6ac499a19153c_1791269281.webp)
![pasted-image.png · 19](https://img.cdn1.vip/i/6ac499b4cab56_1791269300.png)

## 搭建页面骨架

由于本题主要是实现光标的动效且前序题目已经涉及过页面基本元素的生成，因此骨架由 [DeepSeek](https://chat.deepseek.com/share/yuy5n4enyaeroqrdf4) 生成，实际上用 HTML5UP 等模板都差不多，在这里就不多耗费时间。

## 光标是什么

首先将系统原有的光标隐藏了。隐藏的时候需要加上 `!important`，防止光标被某些子元素给覆写了。然后我们可以建立两个光标 div。

如果想要光标是圆形的，如何实现呢？[询问 DS](https://chat.deepseek.com/share/2req35v53ulzzmxzr6) 后得知可以用“方形+圆角”实现圆形的效果。如何让光标元素不变成会跟着光标走的遮挡物呢？需要采用 `pointer-events: none;`。同时，DS 也提示可以加入 `will-change: transform;` 来让浏览器得知这个元素会经常变化，提升渲染效率。

## 光标动起来

简而言之，用 JS 监听光标移动 `mousemove` 的事件，并且实时将新的光标位置传递给两个 div。

采用了缓动更新的策略，参考了 LLM 的解法，下简述如何实现这个缓动的过程，以 x 为例。

- mousemove: `e.ClientX` -> `mx` 维护 mx
- render: `dx = (mx-dx) * coe` 维护 dx，应用到 transform 上让其动起来
- `requestAnimationFrame(render)` 让浏览器在下一个帧更新的时候调用 render

## 浮光掠影之 hover

说实话，都是大同小异：监听特定的事件并且特定地 toggle Classname，不过这里有个技巧可以记录下来：

当移出某个元素的时候，需要考虑到移入的新元素是不是 hoverable，以规避“闪动”的问题。

为了防止移入没有新元素 / 移入的新元素没有父 DOM 等意外情况，结合 JS 从左到右做判断的特性，可以这样写：

1. `e.relatedTarget` 是否有移入新元素？
2. `e.relatedTarget.closest` 新元素有没有 closest 方法？（防止下一步因为调用了不存在的 closet 方法而报错）
3. `e.relatedTarget.closest(hoverable)` 新元素是否 hoverable？

## 其他操作

监听鼠标离开网页的操作，让光标消失。

## 另外

用 Deepseek 做了一遍，这次效果差异不大了，但是可以看出来 DS 交付的网页的鲁棒性以及对移动设备的支持明显好得多。
![pasted-image.png · 596](https://img.cdn1.vip/i/6ac4af193e808_1791274777.webp)
