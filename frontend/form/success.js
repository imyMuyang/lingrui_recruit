data = URL.parse(window.location.href)
form = {}
console.log(data)
for (const [k, v] of data.searchParams) {
  form[k] = v
}
console.log(form)
window.onload = e => {
  if (
    'name' in form &&
    'path' in form &&
    form['name'] != '' &&
    form['path'] != ''
  ) {
    $('#fake').hide()
    $('#fake').after(
      `<p>注册报名成功~</p><p>欢迎${form['name']}同学加入${form['path']}方向！</p><p>点击<a href="https://www.bilibili.com/video/BV1GJ411x7h7/">这里</a>获取我们专为${form['path']}方向同学准备的学习指南吧。`
    )
  }
}
