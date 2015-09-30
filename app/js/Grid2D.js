import THREE from "three";
import defaults from "lodash/object/defaults";

class Grid2D {
  constructor(scene, width, height, cellSize, opts) {
    this._scene = scene;
    this._w = width;
    this._h = height;
    this._cellSize = cellSize;
    this._opts = defaults(opts || {}, Grid2D.DEFAULTS);
    this._blocked = {};

    if (this._opts.debug) {
      var gridSize = Math.max(width, height) * this._cellSize * 0.5;
      const gridHelper = new THREE.GridHelper(gridSize, this._cellSize);
      gridHelper.setColors(0xaaaaaa, 0xaaaaaa);
      gridHelper.position.x = gridSize - this._cellSize * 0.5;
      gridHelper.position.z = -gridSize + this._cellSize * 0.5;
      scene.add(gridHelper);
    }

    this._wallGeometry = new THREE.BoxGeometry(this._cellSize, this._cellSize, this._cellSize);
    this._wallMaterial = new THREE.MeshPhongMaterial({
      map: THREE.ImageUtils.loadTexture(require("../img/stone/stone.jpg")),
      normalMap: THREE.ImageUtils.loadTexture(require("../img/stone/stone-normal.png"))
    });
  }

  placeWall(gridX, gridY) {
    const wall = new THREE.Mesh(this._wallGeometry, this._wallMaterial);
    wall.position.set(gridX * this._cellSize, this._cellSize / 2, -gridY * this._cellSize);
    this._scene.add(wall);
    this._blocked[`${gridX}-${gridY}`] = true
  }

  isWalkable(gridX, gridY) {
    return !this._blocked[`${gridX}-${gridY}`];
  }
}

Grid2D.DEFAULTS = {
  debug: false
};

export default Grid2D;
