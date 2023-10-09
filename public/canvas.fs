#version 300 es
precision highp float;

// SNES aspect ratio 8:7
#define SCREEN_WIDTH 256.0
#define SCREEN_HEIGHT 224.0

#define SCREEN_SIZE vec2(SCREEN_WIDTH, SCREEN_HEIGHT)
#define SCREEN_MAX_X (SCREEN_WIDTH - 1.0)
#define SCREEN_MAX_Y (SCREEN_HEIGHT - 1.0)
#define SCREEN_MIN_X 0
#define SCREEN_MIN_Y 0

out vec4 outColor;
in vec2 v_texcoord;
uniform vec2 actual_screen_size;
uniform sampler2D render_texture;
uniform int time;

vec2 get_scale() {
  return vec2(1.0f, 1.0f); // actual_screen_size / SCREEN_SIZE;
}

vec4 get_color(vec2 pos) {
  return vec4(1,1,1,1);
  //return texture(render_texture, pos);
}

vec4 get_color(float x, float y) {
  return get_color(vec2(x, y));
}

void main() {
  vec2 pos = v_texcoord;

  //pos = curve_remap_uv(pos);

  //if (pos.x < 0.0 || pos.x > 1.0 || pos.y < 0.0 || pos.y > 1.0) {
  //	outColor = vec4(0.0, 0.0, 0.0, 1.0);
  //	return;
  //}

  //pos /= get_scale();

  pos.x *= 1.0f;
  pos.y *= 1.0f;

  outColor = get_color(pos);
  //outColor = scanlines(pos, outColor);
  //outColor = bloom(pos, outColor);
  //outColor *= vignette_intensity(pos);
}