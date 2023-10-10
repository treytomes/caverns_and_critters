import './style.css'

type ShaderParams = {
  timeLocation: WebGLUniformLocation,
  targetScreenSizeLocation: WebGLUniformLocation,
  actualScreenSizeLocation: WebGLUniformLocation,
  renderTextureLocation: WebGLUniformLocation
}

type SystemContext = {
  canvas: HTMLCanvasElement,
  gl: WebGL2RenderingContext,
  texture: WebGLTexture,
  vertexBuffer: WebGLVertexArrayObject,
  shaderProgram: WebGLProgram,
  shaderParams: ShaderParams
}

// Setup a unit quad composed of 2 triangles for rendering the framebuffer to the canvas.
const FRAMEBUFFER_POSITIONS = new Float32Array([1, 1, -1, 1, -1, -1, 1, 1, -1, -1, 1, -1])

const SCREEN_WIDTH = 256
const SCREEN_HEIGHT = 224
const SCREEN_BPP = 3
const SCREEN_STRIDE = SCREEN_WIDTH * SCREEN_BPP
const PIXELS = new Uint8Array(SCREEN_STRIDE * SCREEN_HEIGHT)
let context: SystemContext

const render = () => {
  for (let y = 0; y < SCREEN_HEIGHT; y++) {
    for (let x = 0; x < SCREEN_WIDTH; x++) {
      const index = (y * SCREEN_WIDTH + x) * SCREEN_BPP;
      PIXELS[index] = x ^ y;
      PIXELS[index + 1] = x & y;
      PIXELS[index + 2] = x | y;
    }
  }
}

let lastUpdateTime = 0
const UPDATE_INTERVAL = 1000
const onRenderFrame = (time: number) => {
  if (time - lastUpdateTime >= UPDATE_INTERVAL) {
    console.log('Update!')
    lastUpdateTime = time
  }

  render()

  const gl = context.gl
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, SCREEN_WIDTH, SCREEN_HEIGHT, 0, gl.RGB, gl.UNSIGNED_BYTE, PIXELS)
  
  gl.uniform1f(context.shaderParams.timeLocation, time)

  gl.uniform2f(context.shaderParams.actualScreenSizeLocation, context.canvas.clientWidth, context.canvas.clientHeight)

  // Draw the image data to the frame buffer.
  gl.drawArrays(gl.TRIANGLES, 0, FRAMEBUFFER_POSITIONS.length / 2)

  requestAnimationFrame(onRenderFrame)
}

const createRenderTexture = (gl: WebGL2RenderingContext) => {
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  
  if (!texture) throw new Error('Unable to create the render texture.')
  return texture
}

const onWindowLoad = async () => {
  console.log('Here we go.')

  const canvas = document.createElement('canvas')
  //canvas.setAttribute('image-rendering', 'pixelated')
  document.body.appendChild(canvas)

  const gl = canvas.getContext('webgl2', {
    antialias: false,
  })
  if (!gl) throw new Error('Unable to acquire the webgl2 context.')

  // Create the render texture.
  const texture = createRenderTexture(gl)

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

  const timeLocation = gl.getUniformLocation(shaderProgram, 'time')
  if (!timeLocation) throw new Error('Unable to locate time.')
  gl.uniform1f(timeLocation, 0.0);

  const targetScreenSizeLocation = gl.getUniformLocation(shaderProgram, 'target_screen_size')
  if (!targetScreenSizeLocation) throw new Error('Unable to locate target_screen_size.')
  gl.uniform2f(targetScreenSizeLocation, SCREEN_WIDTH, SCREEN_HEIGHT);

  const actualScreenSizeLocation = gl.getUniformLocation(shaderProgram, 'actual_screen_size')
  if (!actualScreenSizeLocation) throw new Error('Unable to locate actual_screen_size.')
  gl.uniform2f(actualScreenSizeLocation, canvas.width, canvas.height);

  const renderTextureLocation = gl.getUniformLocation(shaderProgram, 'render_texture')
  if (!renderTextureLocation) throw new Error('Unable to locate render_texture.')
  gl.uniform1i(renderTextureLocation, 0);

  const vertexBuffer = gl.createBuffer()
  if (!vertexBuffer) throw new Error('Unable to create vertex buffer.')
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, FRAMEBUFFER_POSITIONS, gl.STATIC_DRAW)
  gl.enableVertexAttribArray(0)
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0)

  context = {
    canvas,
    gl,
    texture,
    shaderProgram,
    vertexBuffer,
    shaderParams: {
      timeLocation,
      actualScreenSizeLocation,
      renderTextureLocation,
      targetScreenSizeLocation,
    },
  }

  // Begin the render loop.
  requestAnimationFrame(onRenderFrame)
}

window.addEventListener('load', onWindowLoad, false)
