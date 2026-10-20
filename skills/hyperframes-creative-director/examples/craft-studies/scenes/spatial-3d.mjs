import {frame, progress, ease} from './shared.mjs';

function panelMesh() {
  const points = [];
  const faces = [
    [[0,0,1], [[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]]],
    [[0,0,-1], [[1,-1,-1],[-1,-1,-1],[-1,1,-1],[1,1,-1]]],
    [[1,0,0], [[1,-1,1],[1,-1,-1],[1,1,-1],[1,1,1]]],
    [[-1,0,0], [[-1,-1,-1],[-1,-1,1],[-1,1,1],[-1,1,-1]]],
    [[0,1,0], [[-1,1,1],[1,1,1],[1,1,-1],[-1,1,-1]]],
    [[0,-1,0], [[-1,-1,-1],[1,-1,-1],[1,-1,1],[-1,-1,1]]],
  ];
  for (const [normal, vertices] of faces) {
    for (const i of [0,1,2,0,2,3]) points.push(vertices[i][0] * .72, vertices[i][1], vertices[i][2] * .10, ...normal);
  }
  return new Float32Array(points);
}

export function createStudy(options) {
  const scene = frame(options, `<canvas aria-label="Illustrative three-dimensional panel geometry"></canvas><div class="eyebrow">05 / A spatial relationship</div><h1 data-text>See how it fits.</h1><p data-text class="caption">A window reveals the supporting layers.</p><div class="source">Original geometry / illustrative product stage</div>`, `
    canvas{position:absolute;inset:0;width:100%;height:100%}h1{position:absolute;left:7%;top:15%;font-size:4.5cqw;letter-spacing:-.04em}
    .caption{position:absolute;left:7%;top:80%;width:86%;font-size:1.8cqw}
    .portrait h1{font-size:9cqw;top:17%}
    .portrait .caption{font-size:3.5cqw}
  `);
  const canvas = scene.host.querySelector('canvas');
  canvas.width = options.assets?.width || 960;
  canvas.height = options.assets?.height || 540;
  const gl = canvas.getContext('webgl', {antialias: true, preserveDrawingBuffer: true, alpha: false});
  if (!gl) {
    return {...scene, ready: scene.ready.then(() => { throw Error('WebGL is unavailable; spatial study cannot initialize'); }), renderAt() {}};
  }
  const shaders = [];
  let program, buffer;
  let initialized = false;
  let lost = false;
  const onLost = event => {
    event.preventDefault();
    lost = true;
    canvas.dispatchEvent(new CustomEvent('craft-study-failure', {
      bubbles: true, detail: new Error('WebGL context lost; reload and rerender required'),
    }));
  };
  canvas.addEventListener('webglcontextlost', onLost);
  const shader = (type, source) => {
    const item = gl.createShader(type);
    shaders.push(item);
    gl.shaderSource(item, source);
    gl.compileShader(item);
    if (!gl.getShaderParameter(item, gl.COMPILE_STATUS)) throw Error(`WebGL shader: ${gl.getShaderInfoLog(item)}`);
    return item;
  };
  const ready = scene.ready.then(() => {
    if (lost) throw Error('WebGL context lost during initialization');
    const vertex = shader(gl.VERTEX_SHADER, `
      attribute vec3 position; attribute vec3 normal;
      uniform mat4 projection; uniform vec3 offset; uniform vec3 camera; uniform float angle;
      varying vec3 n; varying vec3 world; varying vec3 localPosition;
      void main(){
        float c=cos(angle),s=sin(angle);
        mat3 rotation=mat3(c,0.,-s,0.,1.,0.,s,0.,c);
        localPosition=position; world=rotation*position+offset; n=rotation*normal;
        gl_Position=projection*vec4(world-camera,1.);
      }`);
    const fragment = shader(gl.FRAGMENT_SHADER, `
      precision mediump float; varying vec3 n; varying vec3 world; varying vec3 localPosition;
      uniform vec3 color; uniform float aperture;
      void main(){
        // A window in the foreground layer reveals the supporting layers behind it.
        if(aperture>0. && abs(localPosition.x)<aperture*.55 && abs(localPosition.y)<aperture*.66) discard;
        vec3 normal=normalize(n); vec3 light=normalize(vec3(-2.,3.,4.)-world);
        float diffuse=max(dot(normal,light),0.);
        float spec=pow(max(dot(reflect(-light,normal),normalize(vec3(0.,0.,6.)-world)),0.),36.);
        gl_FragColor=vec4(color*(.28+.72*diffuse)+vec3(.24)*spec,1.);
      }`);
    program = gl.createProgram();
    gl.attachShader(program, vertex); gl.attachShader(program, fragment); gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw Error(`WebGL program: ${gl.getProgramInfoLog(program)}`);
    gl.useProgram(program);
    buffer = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buffer); gl.bufferData(gl.ARRAY_BUFFER, panelMesh(), gl.STATIC_DRAW);
    for (const [name, offset] of [['position',0],['normal',12]]) {
      const location = gl.getAttribLocation(program, name);
      gl.enableVertexAttribArray(location); gl.vertexAttribPointer(location,3,gl.FLOAT,false,24,offset);
    }
    gl.enable(gl.DEPTH_TEST);
    initialized = true;
  });
  const uniform = name => gl.getUniformLocation(program, name);
  return {...scene, ready, renderAt(t) {
    if (lost || gl.isContextLost()) throw Error('WebGL context lost');
    if (!initialized) throw Error('Await study.ready before rendering');
    const p = ease(progress(t, .2, 3.4));
    const weak = options.variant === 'weak';
    const aspect = canvas.width / canvas.height;
    const f = 1 / Math.tan(Math.PI / 8), near = .1, far = 40;
    const projection = new Float32Array([f/aspect,0,0,0, 0,f,0,0, 0,0,(far+near)/(near-far),-1, 0,0,2*far*near/(near-far),0]);
    gl.viewport(0,0,canvas.width,canvas.height);
    gl.clearColor(.89,.9,.85,1); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.useProgram(program); gl.uniformMatrix4fv(uniform('projection'),false,projection);
    const distance = (aspect < 1 ? 10 : 7) - p * 1.2;
    gl.uniform3f(uniform('camera'),weak ? Math.sin(t*2)*1.8 : .6*(1-p),.35,distance);
    for (let i=0;i<3;i++) {
      gl.uniform3f(uniform('offset'),(i-1)*.62,-.30,i===1?.3:-.65);
      gl.uniform1f(uniform('aperture'),i===1?ease(progress(t,1.2,3)):0);
      gl.uniform1f(uniform('angle'),weak ? t*2+i : .55-.25*p);
      gl.uniform3f(uniform('color'),.24+i*.12,.37+i*.09,.31+i*.05);
      gl.drawArrays(gl.TRIANGLES,0,36);
    }
  }, dispose() {
    canvas.removeEventListener('webglcontextlost',onLost);
    if (buffer) gl.deleteBuffer(buffer);
    if (program) gl.deleteProgram(program);
    shaders.forEach(item => gl.deleteShader(item));
    scene.dispose();
  }};
}
