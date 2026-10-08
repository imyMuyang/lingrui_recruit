let poplist = []

function pop (req) {
  const data = JSON.parse(req)
  data.id = poplist.length
  data.currentX = Math.round((Math.random() - 0.5) * 512)
  data.currentY = Math.round((Math.random() - 0.5) * 512)
  data.isDragging = 0
  console.log(data)
  poplist.push(data)
  // 准备 DOM
  const popupTextContent = `<div class="pout" id="pop-${data.id}">
      <div class="ptitle">${data.title}</div>
      <div class="pcontent">${data.text}</div>
      <div class="pbuttons">
        <div class="pbtn" id="pop-${data.id}-yes">好</div>
        <div class="pbtn" id="pop-${data.id}-no">不要</div>
      </div>
    </div>`
  // DOM 进入文档流
  $('body').append(popupTextContent)
  $(`#pop-${data.id}`).css(
    'transform',
    `translate3d(${data.currentX}px, ${data.currentY}px, 0)`
  )
  bringToFront($(`#pop-${data.id}`)[0])

  $(`#pop-${data.id} > .ptitle`).on('mousedown', e => {
    // 只有标题栏按下后才会引发拖动等状态
    console.log(`${data.id} 标题栏按下`)
    // 记录拖拽状态并且存储当前 X Y 坐标
    data.isDragging = 1
    data.startX = e.clientX
    data.startY = e.clientY
    data.baseX = data.currentX
    data.baseY = data.currentY

    $(document).on('mousemove.pop' + data.id, e => {
      console.log(`${data.id} 标题栏拖动`)
      if (!data.isDragging) return
      data.currentX = data.baseX + (e.clientX - data.startX) // 更新变化态
      data.currentY = data.baseY + (e.clientY - data.startY)
      $(`#pop-${data.id}`).css(
        'transform',
        `translate3d(${data.currentX}px, ${data.currentY}px, 0)`
      ) // 实现变化
    })

    $(document).on('mouseup.pop' + data.id, () => {
      console.log(`${data.id} 标题栏弹起`)
      data.isDragging = 0
      $(document).off('mousemove.pop' + data.id) // 生命周期结束，注销两个 EventListener
      $(document).off('mouseup.pop' + data.id)
    })
  })

  $(`#pop-${data.id}`).on('mousedown', function () {
    bringToFront(this)
  })
  $(`#pop-${data.id}-yes`).on('click', () => {
    console.log(`${data.id} 跳转`)
    window.location.href = data['link']
  })
  $(`#pop-${data.id}-no`).on('click', () => {
    console.log(`${data.id} 关闭`)
    $(`#pop-${data.id}`).hide()
  })

}

let topZ = 10
function bringToFront (el) {
  topZ += 1
  el.style.zIndex = topZ
}

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))
async function run () {
  pop(
    '{"title":"HELLO WORLD","link":"https://hanye.netlify.app/","text":"我是寒叶，想要看看我的博客嘛..."}'
  )
  await delay(1000)
  pop(
    '{"title":"难道你也看……","link":"https://bgm.tv/user/1079232","text":"来看看我的 Bangumi，查查成分吧"}'
  )
  await delay(2000)
  pop(
    '{"title":"你说你不看 ACGN？","link":"https://github.com/imyMuyang","text":"那 Github 怎么说呢"}'
  )
  await delay(5000)
  pop(
    '{"title":"原来你都不满意QAQ","link":"#","text":"在背后，你可以创建自己的弹窗。"}'
  )
}
run()
