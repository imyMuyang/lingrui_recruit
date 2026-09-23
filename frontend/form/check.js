window.onload = e => {
  $('#form').on('submit', event => {
    console.log('user submit')
    event.preventDefault()
    check()
  })
  $('#form').on('reset', e => {
    console.log('user reset')
    $('#textdata').text('当前已写 0 字').css('color', '#a6acaf')
    $('.err').hide()
    $('#hint').text('火速提交信息，然后开始交题 8-3')
  })
  $('#intro').on('input', e => {
    if ($('#intro').val().length > 100) {
      $('#textdata')
        .text(`当前已写 ${$('#intro').val().length} 字，已经超过 100 字啦！`)
        .css('color', '#ec7063')
    } else {
      $('#textdata')
        .text(`当前已写 ${$('#intro').val().length} 字`)
        .css('color', '#a6acaf')
    }
  })
}

function check () {
  errnum = 0
  console.log('start checking')
  if ($('#agree').is(':checked')) {
    $('#agreeerr').hide()
  } else {
    $('#agreeerr').show()
    errnum += 1
  }
  if ($('#intro').val().length == 0) {
    $('#introerr1').show()
    $('#intro').focus()
    errnum += 1
  } else if ($('#intro').val().length > 100) {
    $('#introerr2').show()
    $('#intro').focus()
    errnum += 1
  } else {
    $('#introerr1').hide()
    $('#introerr2').hide()
  }
  if ($('select#path option:selected').text() == '请选择') {
    $('#patherr').show()
    $('#path').focus()
    errnum += 1
  } else {
    $('#patherr').hide()
  }
  if ($('#name').val().length == 0) {
    $('#nameerr').show()
    $('#name').focus()
    errnum += 1
  } else {
    $('#nameerr').hide()
  }
  if (errnum > 0) {
    $('#hint').text(`当前还有 ${errnum} 个地方需要再看看哦~`)
    return 0
  } else {
    window.location.replace(`success.html?name=${$('#name').val()}&path=${$('select#path option:selected').text()}`)
  }
}
