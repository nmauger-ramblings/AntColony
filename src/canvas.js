// Graphics :
// 0 - Draw the colony => DONE
// 1 - ant must head in the right direction => DONE
// 2 - Proper body circles (correct size) => Done

// TODO - 3 - Collision detection => Change direction if obstacle in front + test if obstacle == food.

// Ant :
// Is empty => No pheromons path created
// Is carrying => Pheromon creation (+8 on the path)
// If is Carrying, then, go home (approx heading to the colony)
// 
// Path :
// Store and render a pheromon path. All path must be kept (+8 points, every second, loose 1 point each second for instance).
// If one a track carrying => +8 again.
// 
// Render tracks : RGB value modified by pheromons qty


//get a reference to the canvas
$(document).ready(function () {
  'use strict';
  var ctx = $('#canvas')[0].getContext("2d"),
    circle = function (x, y, r) {
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.fill();
    },
//BEGIN LIBRARY CODE
    NB_ANTS = 50,
    NB_FOODS = 10,
    NB_OBSTACLES = 10,
    BLOCK_SIZE = 25,
    BALL_SIZE = 2,
    HEAD_SIZE = 2,
    TORSO_SIZE = 2,
    MIDDLE_SIZE = 2,
    ABDOMEN_SIZE = 2,
    FOOD_SIZE = 10,
    ROCK_SIZE = 20,

    MIN_SPEED = 0.0,
    MAX_SPEED = 5,

    ants = [],
    foodReserves = [],
    obstacles = [],
    colony,

    antsColor = ["#556622", "#775522", "#553311"],
    groundColor = "#081200",

    WIDTH,
    HEIGHT,
    i,

    Colony = function () {
      this.x = Math.random() * WIDTH / 2;
      this.y = Math.random() * HEIGHT / 2;
      this.color = "#115511";

      this.draw = function () {
        ctx.save();
        ctx.fillStyle = this.color;
        circle(this.x, this.y, BLOCK_SIZE);
        circle(this.x + BLOCK_SIZE, this.y, BLOCK_SIZE);
        circle(this.x - BLOCK_SIZE, this.y, BLOCK_SIZE);
        circle(this.x, this.y - BLOCK_SIZE, BLOCK_SIZE);
        ctx.restore();
      };
    },

    Ant = function () {
      this.x = Math.random() * WIDTH * 0.90;
      this.y = Math.random() * HEIGHT * 0.90;
      this.dx = Math.random() * 4 - 2;
      this.dy = Math.random() * 4 - 2;
      this.speed = Math.random() + MAX_SPEED;
      this.heading = Math.atan(this.dy / this.dx);
      this.collide = false;
      this.antLength = (HEAD_SIZE + TORSO_SIZE + MIDDLE_SIZE)/2;
      this.antWidth = (MIDDLE_SIZE)/2;

      this.color = antsColor[Math.floor((Math.random() * 3))];

      this.draw = function () {
        ctx.save();
        ctx.translate(this.x + this.antLength, this.y + this.antWidth);
        ctx.rotate(this.heading);
        ctx.translate(-this.x - this.antLength, -this.y - this.antWidth);

        ctx.fillStyle = this.color;
        circle(this.x, this.y, HEAD_SIZE);
        circle(this.x + HEAD_SIZE, this.y, TORSO_SIZE);
        circle(this.x + HEAD_SIZE + TORSO_SIZE, this.y, MIDDLE_SIZE);
        circle(this.x + HEAD_SIZE + TORSO_SIZE + MIDDLE_SIZE, this.y, ABDOMEN_SIZE);

        //this.angle += this.dAngle;

        ctx.restore();
      };

      this.update = function () {
        this.collide = false;
        // Border collision
        if (this.x + this.dx + BALL_SIZE > WIDTH || this.x + this.dx - BALL_SIZE < 0) {
          this.dx = -this.dx;
        }

        if (this.y + this.dy + BALL_SIZE > HEIGHT || this.y + this.dy - BALL_SIZE < 0) {
          this.dy = -this.dy;
        }

        // Ants Collision
        for (i = 0; i < ants.length; i++) {
          if ((this.x + this.dx < ants[i].x + ants[i].dx && this.x + this.dx + BALL_SIZE * 2 > ants[i].x + ants[i].dx - BALL_SIZE * 2) ||
              (this.x + this.dx > ants[i].x + ants[i].dx && this.x + this.dx - BALL_SIZE * 2 < ants[i].x + ants[i].dx + BALL_SIZE * 2)) {
            if ((this.y + this.dy < ants[i].y + ants[i].dy && this.y + this.dy + BALL_SIZE > ants[i].y + ants[i].dy - BALL_SIZE) ||
                (this.y + this.dy > ants[i].y + ants[i].dy && this.y + this.dy - BALL_SIZE < ants[i].y + ants[i].dy + BALL_SIZE)) {
              this.dx = -this.dx;
              this.dy = -this.dy;
//              this.collide = true;
            }
          }
        }

        // Colony collision
        if ((this.x + this.dx < colony.x && this.x + this.dx + this.antLength > colony.x - BLOCK_SIZE * 2) ||
             (this.x + this.dx > colony.x && this.x + this.dx - this.antLength < colony.x + BLOCK_SIZE * 2)) {
          if (this.y + this.dy < colony.y && this.y + this.dy + this.antWidth > colony.y - BLOCK_SIZE * 2) {
            this.collide = true;
          } else if (this.y + this.dy > colony.y && this.y + this.dy - this.antWidth < colony.y + BLOCK_SIZE) {
            this.collide = true;
          }
        }

        // obstacles collision
        for (i = 0; i < obstacles.length; i++) {

          if ((this.x + this.dx < obstacles[i].x && this.x + this.dx + this.antLength > obstacles[i].x - ROCK_SIZE) ||
               (this.x + this.dx > obstacles[i].x && this.x + this.dx - this.antLength < obstacles[i].x + ROCK_SIZE)) {
            if (this.y + this.dy < obstacles[i].y && this.y + this.dy + this.antWidth > obstacles[i].y - ROCK_SIZE) {
              this.collide = true;
/*
              this.dx = -this.dx;
              this.dy = -this.dy;
*/
            } else if (this.y + this.dy > obstacles[i].y && this.y + this.dy - this.antWidth < obstacles[i].y + ROCK_SIZE) {
              this.collide = true;
/*
              this.dx = -this.dx;
              this.dy = -this.dy;
*/
            }

          }
        }

        // Food collision
        for (i = 0; i < foodReserves.length; i++) {

          if ((this.x + this.dx < foodReserves[i].x && this.x + this.dx + this.antLength > foodReserves[i].x - FOOD_SIZE) ||
               (this.x + this.dx > foodReserves[i].x && this.x + this.dx - this.antLength < foodReserves[i].x + FOOD_SIZE)) {
            if (this.y + this.dy < foodReserves[i].y && this.y + this.dy + this.antLength > foodReserves[i].y - FOOD_SIZE) {
//              this.collide = true;
              this.dx = -this.dx;
              this.dy = -this.dy;
            } else if (this.y + this.dy > foodReserves[i].y && this.y + this.dy - this.antLength < foodReserves[i].y + FOOD_SIZE) {
//              this.collide = true;
              this.dx = -this.dx;
              this.dy = -this.dy;
            }
          }
        }

        // TODO :
        // problem 2 : should move anyway in order to exit the "obstacle trap"
        this.heading = Math.atan2(this.dy, this.dx);
        if (this.collide) {
          this.speed = MIN_SPEED;
          // change direction by increments
          this.heading += 0.01;
          this.dx = Math.cos(this.heading);
          this.dy = Math.sin(this.heading);
        }
        if (this.speed < MAX_SPEED) {
          this.speed += 0.05;
        }
        this.x += this.dx * this.speed;
        this.y += this.dy * this.speed;

      };
    },

    FoodReserve = function () {
      this.x = Math.random() * WIDTH * 0.85;
      this.y = Math.random() * HEIGHT * 0.85;
      this.color = "#CC3333";

      this.draw = function () {
        ctx.save();
        ctx.fillStyle = this.color;
        circle(this.x, this.y, FOOD_SIZE);
        ctx.restore();
      };
    },

    Rock = function () {
      this.x = Math.random() * WIDTH * 0.85;
      this.y = Math.random() * HEIGHT * 0.85;
      this.color = "#BBBBBB";

      this.draw = function () {
        ctx.save();
        ctx.fillStyle = this.color;
        circle(this.x, this.y, ROCK_SIZE);
        ctx.restore();
      };
    };

  function clear() {
    ctx.fillStyle = groundColor;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.fillStyle = "#000000";
    //ctx.clearRect(0, 0, WIDTH, HEIGHT);
  }

  function draw() {
    clear();

    colony.draw();

    var i;

    for (i = 0; i < ants.length; i++) {
      ants[i].update();
      ants[i].draw();
    }

    for (i = 0; i < foodReserves.length; i++) {
      foodReserves[i].draw();
    }

    for (i = 0; i < obstacles.length; i++) {
      obstacles[i].draw();
    }
  }

  function init() {
    ctx = $('#canvas')[0].getContext("2d");
    ctx.canvas.width  = window.innerWidth / 2;
    ctx.canvas.height = window.innerHeight / 2;
    var mycanvas = $("#canvas");

    WIDTH = mycanvas.width();
    HEIGHT = mycanvas.height();

    for (i = 0; i < NB_ANTS; i++) {
      ants.push(new Ant());
    }

    for (i = 0; i < NB_FOODS; i++) {
      foodReserves.push(new FoodReserve());
    }

    for (i = 0; i < NB_OBSTACLES; i++) {
      obstacles.push(new Rock());
    }

    colony = new Colony();

    return window.setInterval(draw, 10);
  }
  /*
  function rect(x,y,w,h) {
    ctx.beginPath();
    ctx.rect(x,y,w,h);
    ctx.closePath();
    ctx.fill();
  }*/
  //END LIBRARY CODE
  init();
});


