var x = 10;
var playerImage;
var animSpeed = 10;
var frameNum = 0;
var playerPosX = 0;
var playerPosY = 0;
var playerSize = 0;

function keydown(event)
{
  if (event.key == "ArrowLeft")
  {
    playerPosX-=5;
  }
  else if (event.key == "ArrowRight")
  {
    playerPosX+=5;
  }
  else if (event.key == "ArrowDown")
  {
    playerPosY +=5;
  }
  else if (event.key == "ArrowUp")
  {
    playerPosY -=5;
  }
}

function load()
{
  playerImage = new Image();

  playerImage.src = "images/player.png";
}


function main()
{

  load();

  var canvas = document.getElementById("canvas");

  var ctx = canvas.getContext('2d');
  playerSize = 100;

  draw(ctx);

}

function draw(ctx)
{
  ctx.fillStyle = 'gray';
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.width);

  var frameWidth = playerImage.width / 5;
  var frameHeight = playerImage.height / 4;

  ctx.drawImage(playerImage,
  frameWidth * frameNum, 0, frameWidth, frameHeight,
  playerPosX, playerPosY, playerSize, playerSize);

  x++;

  if(x % animSpeed == 0)
    frameNum++
  }

  if (frameNum > 4)
  {
    frameNum = 0;
  }

  window.requestAnimationFrame(function(){draw(ctx);});
}

window.onload = main;
window.addEventListener("keydown", keydown)
