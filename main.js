let camera, controls, scene, renderer, group;
const { PI, sin, cos } = Math;
const HUE_DIVISIONS = 40;
const SQ_SIZE = 8;
const START_RADIUS = 20;
const RADIANS_PER_SLICE = (2 * PI) / HUE_DIVISIONS;
const PLATE_DISTANCE = 20;
const EXTRUDE_SETTINGS = {
  depth: 8,
  bevelEnabled: false,
  bevelSegments: 0,
  steps: 1,
  bevelSize: 0,
  bevelThickness: 0
};

const range = n =>
  Array(n)
    .fill(0)
    .map((_, i) => i);

function init() {
  container = document.createElement("div");
  document.body.appendChild(container);

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf0f0f0);

  camera = new THREE.PerspectiveCamera(
    50,
    window.innerWidth / window.innerHeight,
    1,
    10000
  );
  camera.position.set(750, 750, 200);
  scene.add(camera);

  const light1 = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(light1);
  const light2 = new THREE.PointLight(0xffffff, 0.5);
  camera.add(light2);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);

  group = new THREE.Group();
  group.rotation.set(Math.PI / 2, 0, 0);
  scene.add(group);

  controls = new THREE.OrbitControls(camera, renderer.domElement);

  window.addEventListener("resize", onWindowResize, false);
}
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
function addShapes() {
  const addShape = ({ shape, z, hue, chroma, value,isAxis }) => {
    let newExtrdeSettings = EXTRUDE_SETTINGS
    if(isAxis){
      newExtrdeSettings = {...newExtrdeSettings, depth:newExtrdeSettings.depth + PLATE_DISTANCE}
    }
    var geometry = new THREE.ExtrudeBufferGeometry(shape, newExtrdeSettings);
    var color = new THREE.Color();
    color.setHSL(hue, chroma, value);
    var mesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({ color }));
    mesh.position.set(0, 0, z);
    group.add(mesh);
  };

  const createArc = ({ rInner, rOuter, startAngle, endAngle, z, color,isAxis }) => {
    const x1 = rInner * cos(startAngle);
    const y1 = rInner * sin(startAngle);

    const x2 = rOuter * cos(startAngle);
    const y2 = rOuter * sin(startAngle);

    const x3 = rOuter * cos(endAngle);
    const y3 = rOuter * sin(endAngle);

    const x4 = rInner * cos(endAngle);
    const y4 = rInner * sin(endAngle);

    const shape = new THREE.Shape()
      .moveTo(x1, y1)
      .lineTo(x2, y2)
      .absarc(0, 0, rOuter, startAngle, endAngle, false)
      .lineTo(x4, y4)
      .absarc(0, 0, rInner, endAngle, startAngle, true);
    addShape({ shape, z, ...color,isAxis });
  };
  range((SQ_SIZE * 2) + 1).forEach(vi => {
    const chromaRange = (SQ_SIZE - Math.abs(SQ_SIZE - vi))*2
    const z = (EXTRUDE_SETTINGS.depth + PLATE_DISTANCE) * (SQ_SIZE - vi);


    range(chromaRange).forEach(ci => {
      const rInner = START_RADIUS + ci * 30;
      const rOuter = START_RADIUS + (((ci + 1) * 30)-10);
      range(HUE_DIVISIONS).forEach(hi => {
        const startAngle = RADIANS_PER_SLICE * hi;
        const endAngle = RADIANS_PER_SLICE * (hi + 0.6)  ;
        const hue = hi / HUE_DIVISIONS;
        const value = vi / (SQ_SIZE * 2);
        const chroma = ci / (SQ_SIZE * 2);
        createArc({
          rInner,
          rOuter,
          startAngle,
          endAngle,
          z,
          color: { hue, chroma, value },
        });
      });
    });


    createArc({
      rInner:0,
      rOuter:10,
      startAngle:0,
      endAngle:PI*2,
      z,
      color: { hue:0, chroma:0, value:vi / (SQ_SIZE * 2),
      },
      isAxis:true,
    });
  });
}
init();
addShapes();
animate();
