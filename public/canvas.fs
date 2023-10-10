#version 300 es
precision highp float;

#define SCREEN_SIZE vec2(SCREEN_WIDTH, SCREEN_HEIGHT)
#define SCREEN_MAX_X (SCREEN_WIDTH - 1.0)
#define SCREEN_MAX_Y (SCREEN_HEIGHT - 1.0)
#define SCREEN_MIN_X 0
#define SCREEN_MIN_Y 0

out vec4 outColor;
in vec2 v_texcoord;
uniform vec2 actual_screen_size;
uniform sampler2D render_texture;
uniform float time;
uniform vec2 target_screen_size;

vec4 get_color(vec2 pos) {
  //return vec4(1, 0, 0, 1);
  return texture(render_texture, pos);
}

vec4 get_color(float x, float y) {
  return get_color(vec2(x, y));
}

/**
 * Vignette inspired by: https://babylonjs.medium.com/retro-crt-shader-a-post-processing-effect-study-1cb3f783afbc
 */
vec2 curve_remap_uv(vec2 pos) {
	#define CURVATURE vec2(4.0, 4.0)

  // As we near the edge of our screen apply greater distortion using a cubic function.
  pos = pos * 2.0f - 1.0f;
  vec2 offset = abs(pos.yx) / vec2(CURVATURE.x, CURVATURE.y);
  pos = pos + pos * offset * offset;
  pos = pos * 0.5f + 0.5f;
  return pos;
}

vec4 vignette_intensity(vec2 pos) {
	#define VIGNETTE_OPACITY 0.6
	#define VIGNETTE_ROUNDNESS 2.0

  float intensity = pos.x * pos.y * (1.0f - pos.x) * (1.0f - pos.y);
  return vec4(vec3(clamp(pow((actual_screen_size.x / VIGNETTE_ROUNDNESS) * intensity, VIGNETTE_OPACITY), 0.0f, 1.0f)), 1.0f);
}

/**
 * Returns accurate MOD when arguments are approximate integers.
 */
float mod_i(float a, float b) {
  float m = a - floor((a + 0.5f) / b) * b;
  return floor(m + 0.5f);
}

vec4 scanlines(vec2 pos, vec4 color) {
  float delta = time * 0.0000005f;
  float y = pos.y * target_screen_size.y;

  color *= (sin((delta + pos.y) * target_screen_size.y * 4.0f) + 1.0f) / 2.0f * 0.5f + 0.5f;

  if(int(y * 2.0f) % 2 == 0) {
    color *= 0.9f;
  }

  color.a = 1.0f;

  return color;
}

vec4 bloom(vec4 color, vec2 pos) {
	#define GLOW_FACTOR 0.9
	#define ORIGIN_WEIGHT 0.1

  float dx = 1.0f / target_screen_size.x / 2.0f;
  float dy = 1.0f / target_screen_size.y / 2.0f;
  vec4 color0 = get_color(pos.x + 0.0f, pos.y + 0.0f);
  vec4 color1 = get_color(pos.x - dx, pos.y - dy);
  vec4 color2 = get_color(pos.x + 0.0f, pos.y - dy);
  vec4 color3 = get_color(pos.x + dx, pos.y - dy);
  vec4 color4 = get_color(pos.x - dx, pos.y + 0.0f);
  vec4 color5 = get_color(pos.x + dx, pos.y + 0.0f);
  vec4 color6 = get_color(pos.x - dx, pos.y + dy);
  vec4 color7 = get_color(pos.x + 0.0f, pos.y + dy);
  vec4 color8 = get_color(pos.x + dx, pos.y + dy);

  color = (color + color0 + color1 + color2 + color3 + color4 + color5 + color6 + color7 + color8) / 9.0f * (1.0f - ORIGIN_WEIGHT) + color * (ORIGIN_WEIGHT + GLOW_FACTOR);
  return color;
}

void main() {
  vec2 pos = v_texcoord;

  pos = curve_remap_uv(pos);

  if(pos.x < 0.0f || pos.x > 1.0f || pos.y < 0.0f || pos.y > 1.0f) {
    outColor = vec4(0.0f, 0.0f, 0.0f, 1.0f);
    return;
  }

  //pos /= get_scale();

  outColor = get_color(pos);
  outColor = scanlines(pos, outColor);
  //outColor = bloom(outColor, pos);
  outColor *= vignette_intensity(pos);
}