import "../css/main.css"

import THREE from "three";
import stats from "./stats";
import forEach from "lodash/collection/forEach";

import Grid2D from "./Grid2D";

const BLOCK_SIZE = 8;

const container = document.getElementById("gameContainer");

const camera = new THREE.PerspectiveCamera(45, null, 0.1, 100);
const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer();
renderer.setPixelRatio(window.devicePixelRatio);

gameContainer.appendChild(renderer.domElement);

function resize() {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
}
window.addEventListener("resize", resize);
resize();

const map = parseMap(
  "XXXXXXXXXX\n" +
  "X@       X\n" +
  "X XX XX XX\n" +
  "X XX  X  X\n" +
  "X X   X XX\n" +
  "X XXX X  X\n" +
  "X XXX XX X\n" +
  "X XXXXXX X\n" +
  "X   XXX  X\n" +
  "XXXXXXXXXX"
);

// const { geometry: playerGeometry } = new THREE.JSONLoader().parse(require("../mesh/chevron.json"), "");
// const  player = new THREE.Mesh(playerGeometry, new THREE.MeshBasicMaterial());
const player = new THREE.Object3D();
player.gridPosition = new THREE.Vector2(map.player.x, map.player.y);
player.position.copy(toGameCoords(player.gridPosition));
player.motionAlpha = 0;
console.log(player.position, player.gridPosition);
scene.add(player);

// camera.position.set(0, 0, BLOCK_SIZE * 0.5);
camera.lookAt(new THREE.Vector3());
camera.zoom = 0.8;
player.add(camera);

createGround(scene, map.width, map.height);

// Light it up
const overheadLight = new THREE.DirectionalLight(0xffffff, 0.25);
overheadLight.position.set(0, 50, 0);
scene.add(overheadLight);
const flashlight = new THREE.PointLight(0xffffff, 0.75, BLOCK_SIZE * 6);
player.add(flashlight);

const grid = new Grid2D(scene, map.width, map.height, BLOCK_SIZE);
for (let wall of map.walls) {
  grid.placeWall(wall.x, wall.y);
}

function loop() {
  stats.begin();
  movePlayer();
  renderer.render(scene, camera);
  stats.end();
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

const LEFT_KEY = 37;
const UP_KEY = 38;
const RIGHT_KEY = 39;
const DOWN_KEY = 40;

function movePlayer() {
  if (player.targetRotation) {
    player.motionAlpha = Math.min(player.motionAlpha + 0.03, 1);
    player.rotation.setFromVector3(
      player.rotation.toVector3().lerpVectors(player.startRotation, player.targetRotation, player.motionAlpha));
  } else if (player.targetPosition) {
    player.motionAlpha = Math.min(player.motionAlpha + 0.05, 1);
    player.position.lerpVectors(player.startPosition, player.targetPosition, player.motionAlpha);
  }

  if (player.motionAlpha === 1) {
    player.motionAlpha = 0;
    player.startRotation = null;
    player.targetRotation = null;
    player.startPosition = null;
    player.targetPosition = null;
  }
}

window.addEventListener("keydown", event => {
  if (!player.targetPosition && !player.targetRotation) {
    let newGridPos;
    switch (event.keyCode) {
      case LEFT_KEY:
        player.startRotation = player.rotation.clone();
        player.targetRotation = player.rotation.clone();
        player.targetRotation.y += Math.PI / 2;
        event.preventDefault();
        break;
      case RIGHT_KEY:
        player.startRotation = player.rotation.clone();
        player.targetRotation = player.rotation.clone();
        player.targetRotation.y -= Math.PI / 2;
        event.preventDefault();
        break;
      case UP_KEY:
        newGridPos = newGridPosition(player, 1);
        if (grid.isWalkable(newGridPos.x, newGridPos.y)) {
          player.gridPosition = newGridPos;
          player.startPosition = player.position.clone();
          player.targetPosition = toGameCoords(newGridPos);
        }
        event.preventDefault();
        break;
      case DOWN_KEY:
        newGridPos = newGridPosition(player, -1);
        if (grid.isWalkable(newGridPos.x, newGridPos.y)) {
          player.gridPosition = newGridPos;
          player.startPosition = player.position.clone();
          player.targetPosition = toGameCoords(newGridPos);
        }
        event.preventDefault();
        break;
    }
  }
});

function parseMap(mapString) {
  const wallStrings = mapString.split("\n");
  const map = {
    walls: [],
    player: { x: 0, y: 0 },
    width: wallStrings[0].length,
    height: wallStrings.length
  };

  forEach(wallStrings, function(rowString, y) {
    forEach(rowString, function(ch, x) {
      if (ch === "X") {
        map.walls.push({ x, y });
      } else if (ch === "@") {
        map.player = { x, y };
      }
    });
  });
  return map;
}

function newGridPosition(player, scale) {
  const v = new THREE.Vector2(Math.sin(-player.rotation.y), Math.cos(player.rotation.y))
    .multiplyScalar(scale);
  return player.gridPosition.clone().add(v).round();
}

function toGameCoords(gridCoords) {
  return new THREE.Vector3(gridCoords.x * BLOCK_SIZE, BLOCK_SIZE * 0.5, -gridCoords.y * BLOCK_SIZE);
}

function createGround(scene, width, height) {
  const geometry = new THREE.PlaneGeometry(BLOCK_SIZE * map.width, BLOCK_SIZE * map.height, 1, 1);
  const texture = THREE.ImageUtils.loadTexture(require("../img/stone/stone.jpg"));
  // const bumpMap = THREE.ImageUtils.loadTexture(require("../img/stone/stone-bump.png"));
  const normalMap = THREE.ImageUtils.loadTexture(require("../img/stone/stone-normal.png"));

  normalMap.wrapS = /* bumpMap.wrapS = */ texture.wrapS = THREE.RepeatWrapping;
  normalMap.wrapT = /* bumpMap.wrapT = */ texture.wrapT = THREE.RepeatWrapping;
  normalMap.repeat.x = /* bumpMap.repeat.x = */ texture.repeat.x = 8;
  normalMap.repeat.y = /* bumpMap.repeat.y = */ texture.repeat.y = 8;

  const material = new THREE.MeshPhongMaterial({
    map: texture,
    // bumpMap: bumpMap,
    normalMap: normalMap
  });
  const ground = new THREE.Mesh(geometry, material);
  ground.rotation.x = -Math.PI * 0.5;
  ground.position.x = BLOCK_SIZE * (map.width - 1) * 0.5;
  ground.position.z = BLOCK_SIZE * (-map.height + 1) * 0.5;
  scene.add(ground);
}

console.log("Bundle loaded!");
