export function createWebGLScene(canvas, seed = 7) {
  const gl = canvas.getContext('webgl', { preserveDrawingBuffer: true });
  if (!gl) throw new Error('WebGL is unavailable; report this capability as unverified');
  function shader(type, source) {
    const value = gl.createShader(type); gl.shaderSource(value, source); gl.compileShader(value);
    if (!gl.getShaderParameter(value, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(value));
    return value;
  }
  const program = gl.createProgram();
  gl.attachShader(program, shader(gl.VERTEX_SHADER, 'attribute vec2 position; varying vec2 uv; void main(){uv=position;gl_Position=vec4(position,0.,1.);}'));
  gl.attachShader(program, shader(gl.FRAGMENT_SHADER, `precision highp float;
    varying vec2 uv; uniform float time; uniform float seed;
    void main(){vec2 p=uv-vec2(sin(time+seed)*.3,cos(time*.7)*.2);
    float rings=.5+.5*cos(length(p)*25.-time*3.);
    vec3 base=time<1.?vec3(.07,.14,.20):vec3(.14,.24,.26);
    gl_FragColor=vec4(base+vec3(.1,.45,.35)*rings,1.);}`));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program));
  gl.useProgram(program);
  const buffer = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]), gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, 'position'); gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
  gl.uniform1f(gl.getUniformLocation(program, 'seed'), seed);
  const clock = gl.getUniformLocation(program, 'time');
  return { renderAt(time) {
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform1f(clock, time); gl.drawArrays(gl.TRIANGLES, 0, 6); gl.finish();
  }};
}
