import './style.css'

let lastUpdateTime = 0
const UPDATE_INTERVAL = 1000
function onRenderFrame(time: number) {
  if (time - lastUpdateTime >= UPDATE_INTERVAL) {
    console.log('Update!')
    lastUpdateTime = time
  }
  //console.log('Render.')
  //graphics.refresh(time)

  requestAnimationFrame(onRenderFrame)
}

function onWindowLoad() {
  console.log('Here we go.')

  // Begin the render loop.
  requestAnimationFrame(onRenderFrame)
}

window.addEventListener('load', onWindowLoad, false)
