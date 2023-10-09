import './style.css'
import fragmentShader from ''

// Setup a unit quad composed of 2 triangles for rendering the framebuffer to the canvas.
const FRAMEBUFFER_POSITIONS = [1, 1, -1, 1, -1, -1, 1, 1, -1, -1, 1, -1]

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

const onWindowLoad = async () => {
  console.log('Here we go.')

  const canvas = document.createElement('canvas')
  document.body.appendChild(canvas)

  const gl = canvas.getContext('webgl2')
  if (!gl) throw new Error('Unable to acquire the webgl2 context.')

  // Create the shader program.

  const vertexShader = gl.createShader(gl.VERTEX_SHADER)
  if (!vertexShader) throw new Error('Unable to create vertex shader.')
  gl.shaderSource(vertexShader, await fetch('canvas.vs').then((response) => response.text()))
  gl.compileShader(vertexShader)

  const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)
  if (!fragmentShader) throw new Error('Unable to create fragment shader.')
  gl.shaderSource(fragmentShader, await fetch('canvas.fs').then((response) => response.text()))
  gl.compileShader(fragmentShader)

  const shaderProgram = gl.createProgram()
  if (!shaderProgram) throw new Error('Unable to create shader program.')
  gl.attachShader(shaderProgram, vertexShader)
  gl.attachShader(shaderProgram, fragmentShader)
  gl.linkProgram(shaderProgram)

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    console.error('Failed to link shader program: ', gl.getProgramInfoLog(shaderProgram))
  }

  // Activate the shader.
  gl.useProgram(shaderProgram)

  // Draw the image data to the frame buffer.

  const vertBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, vertBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(FRAMEBUFFER_POSITIONS), gl.STATIC_DRAW)
  gl.enableVertexAttribArray(0)
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0)
  gl.drawArrays(gl.TRIANGLES, 0, FRAMEBUFFER_POSITIONS.length / 2)

  // Begin the render loop.
  requestAnimationFrame(onRenderFrame)
}

window.addEventListener('load', onWindowLoad, false)
