import './style.css'
import {SCREEN_WIDTH, SCREEN_HEIGHT, createContext, postRender, setPixel} from './system'

const render = (time: number) => {
  for (let y = 0; y < SCREEN_HEIGHT; y++) {
    for (let x = 0; x < SCREEN_WIDTH; x++) {
      setPixel(x, y, { r: x ^ y, g: x & y, b: x | y })
    }
  }
  
  setPixel(100, 100, { r: 255, g: 255, b: 0 })
}

let lastUpdateTime = 0
const UPDATE_INTERVAL = 1000
const onRenderFrame = (time: number) => {
  if (time - lastUpdateTime >= UPDATE_INTERVAL) {
    console.log('Update!')
    lastUpdateTime = time
  }

  render(time)

  postRender(time)

  requestAnimationFrame(onRenderFrame)
}

const onWindowLoad = async () => {
  console.log('Here we go.')

  await createContext();

  // Begin the render loop.
  requestAnimationFrame(onRenderFrame)
}

window.addEventListener('load', onWindowLoad, false)
