#version 300 es
precision highp float;

#define SCREEN_WIDTH 256.0
#define SCREEN_HEIGHT 224.0 // SNES aspect ratio 8:7

in vec4 position;
out vec2 v_texcoord;
uniform vec2 actual_screen_size;

void main() {
  float aspectRatio = SCREEN_WIDTH / SCREEN_HEIGHT;
  float heightFromWidth = actual_screen_size.x / aspectRatio;
  float widthFromHeight = actual_screen_size.y * aspectRatio;

  float tx = position.x;
  float ty = position.y;

  // This will maintain the desired aspect ratio, adding black bars to the top/bottom or left/right as needed.

  if(actual_screen_size.x > widthFromHeight) {
    if(tx > 0.0f) {
      tx -= (actual_screen_size.x - widthFromHeight) / actual_screen_size.x;
    } else {
      tx += (actual_screen_size.x - widthFromHeight) / actual_screen_size.x;
    }
  } else if(actual_screen_size.y > heightFromWidth) {
    if(ty > 0.0f) {
      ty -= (actual_screen_size.y - heightFromWidth) / actual_screen_size.y;
    } else {
      ty += (actual_screen_size.y - heightFromWidth) / actual_screen_size.y;
    }
  }

  //gl_Position = position;
  gl_Position = vec4(tx, ty, 0, 1);

  // This bit will flip the Y and put (0, 0) in the top-left corner.  Like old-school.
  v_texcoord = position.xy * vec2(0.5f, -0.5f) + 0.5f; 
  //v_texcoord = position.xy;
}