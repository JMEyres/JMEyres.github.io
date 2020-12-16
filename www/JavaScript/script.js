const c = document.getElementById("canvas").getContext("2d");

let currentLevel;

let keysDown = {};

const player = {
  x: 0,
  y: 0,
  width: 32,
  height: 32,
  gpe: 0,
  yke: 0,
  mass: 64,
  speed: 3,
  gfldstr: 9.8
}

const level = `1111111111111111










    PP^^bbvv


 &
1111111111111111`;

function main() {
  draw();
  gravity(player);
  input();
  requestAnimationFrame(main);
}

function draw() {
  c.clearRect(0, 0, canvas.width, canvas.height);
  c.fillStyle = "red"
  c.fillRect(player.x, player.y, player.width, player.height)
  for (let row = 0; row < currentLevel.length; row++) {
    for (let col = 0; col < currentLevel[0].length; col++) {

      if (currentLevel[row][col] === "1") {
        c.fillStyle = "black";
        c.fillRect(col * 32, row * 32, 32, 32);
      }

      if (currentLevel[row][col] === "v") {
        c.fillStyle = "grey"
        c.fillRect(col * 32, (row * 32) + 16, 32, 16);
      }

      if (currentLevel[row][col] === "^") {
        c.fillStyle = "grey"
        c.fillRect(col * 32, row * 32, 32, 16);
      }

      if (currentLevel[row][col] === "P") {
        c.fillStyle = "pink"
        c.fillRect(col * 32, row * 32, 32, 32);
      }

      if (currentLevel[row][col] === "b") {
        c.fillStyle = "blue";
        c.fillRect(col * 32, row * 32, 32, 32);
      }

      if (currentLevel[row][col] === "&") {
        player.x = col * 32;
        player.y = row * 32;
        currentLevel[row][col] = " ";
      }
    }
  }
}

function parseLevel(lvl) {
  const toRows = lvl.split("\n");
  const toColumns = toRows.map(r => r.split(""));
  return toColumns;
}


function gravity(obj) {
  obj.y -= obj.yke;
  obj.yke -= obj.gpe;
  obj.gpe = calcGPE(obj);

  if (getTile(obj.x, obj.y) === "1" || getTile(obj.x + 32, obj.y) === "1" || getTile(obj.x, obj.y) === "v" || getTile(obj.x + 32, obj.y) === "v") {
    if (obj.yke > 0) {
      obj.y += obj.yke;
      obj.yke = 0;
    }
  } else if (getTile(obj.x + 32, (obj.y + 32)) === "1" || getTile(obj.x, (obj.y + 32)) === "1" || getTile(obj.x + 32, (obj.y + 32)) === "^" || getTile(obj.x, (obj.y + 32)) === "^") {
    if (obj.yke <= 0) {
      obj.yke = 0;
      obj.y -= (obj.y % 32);
    }
  }
  else if (getTile(obj.x + 32, obj.y + 32) === "P" || getTile(obj.x, obj.y + 32) === "P") {
    obj.yke = 0;
    obj.y -= (obj.y % 32);
  }
  else if (getTile(obj.x + 32, obj.y + 32) === "b" || getTile(obj.x, obj.y + 32) === "b") {
    if (obj.yke <= 0) {
      obj.yke = 0;
      obj.y -= (obj.y % 32);
    }
    obj.gfldstr *= -1
  }
  if (getTile(obj.x, obj.y) === "P" || getTile(obj.x + 32, obj.y) === "P") {
    obj.yke = 0;
  }
  if (getTile(obj.x, obj.y) === "b" || getTile(obj.x + 32, obj.y) === "b") {
    if (obj.yke > 0) {
      obj.y += obj.yke;
      obj.yke = 0;
    }
    obj.gfldstr *= -1
  }
}

function calcGPE(obj) {
  return obj.mass * (obj.gfldstr / 1000000) * ((512 - obj.height) - (obj.y / 32));
}

function getTile(x, y) {
  if (x < currentLevel.length * 64 && x > 0 && y < currentLevel[0].length * 32 && y > 0) {
    return currentLevel[Math.floor(y / 32)][Math.floor(x / 32)];
  }
}

function input() {

  if (65 in keysDown) {
    if (getTile((player.x - player.speed), player.y + 16) === " ") {
      player.x -= player.speed;
    }
  }

  if (68 in keysDown) {
    if (getTile(((player.x + player.width) + player.speed), player.y + 16) === " ") {
      player.x += player.speed;
    }
  }

  if (87 in keysDown && player.yke === 0) {
    player.gfldstr = -9.8;
  }

  if (83 in keysDown && player.yke === 0) {
    player.gfldstr = 9.8;
  }

  if (32 in keysDown && player.yke === 0) {
    player.gfldstr = 9.8;
    currentLevel = parseLevel(level);
  }
}

addEventListener("keydown", function (event) {
  keysDown[event.keyCode] = true;
});

addEventListener("keyup", function (event) {
  delete keysDown[event.keyCode];
});

window.onload = function () {
  currentLevel = parseLevel(level);
  main();
}
