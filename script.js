var sketchProc = function(processingInstance) {
     with (processingInstance) {
        size(600, 600);

        {
            var scene;

            var Scene = function() {
                this.speed = -0.3;        
                this.fishes = [];
                this.bubbles = [];
                this.algae = [];
                this.auto = true;
                this.sceneBack = this.getSceneBack();
                this.sceneFront = this.getSceneFront();
                this.rays = this.getRays();
                this.plant = null;
                this.maxFish = 4;
            };
        } //Scene

        {
            var Fish = function(config) {
                this.position = config.position || new PVector(random(width), random(height));
                this.velocity = new PVector(0, 0);
                this.acceleration = new PVector(0, 0);

                this.scale = config.scale || 1;
                this.direction = -1; //-1 is smaller, 1 is larger
                this.change = false;
                this.xOffset = 0;

                this.follow = config.follow || false;

                //widths of each segment
                this.segmentSizes = [
                    0, //head
                    2,
                    3,
                    4,
                    5,
                    5.5,
                    6,
                    6.5,
                    7,
                    7.3,
                    7,
                    6.5,
                    6,
                    5.5,
                    5,
                    4.5,
                    4,
                    3.5,
                    3,
                    2.5,
                    2,
                    1.5,
                    1,
                    0, //tail
                    0,
                    0,
                    0,
                    0
                ];

                this.segments = [];
                for(var i = 0; i < this.segmentSizes.length; i++) {
                    this.segments.push(new PVector(0, 0));
                }

                //length of each segment for the fish
                this.segmentLength = floor(random(5,7));

                //segment colors
                this.colors = [];
                this.colors.push(config.color1 || color(random(255), random(255), random(255), random() < 0.5 ? random(100, 200) : 255));
                this.colors.push(config.color2 || color(random(255), random(255), random(255), random() < 0.5 ? random(100, 200) : 255));
                this.colors.push(config.color3 || color(random(255), random(255), random(255), random() < 0.5 ? random(100, 200) : 255));

                //location of the fish food
                this.food = new PVector(0, 0);
            };

            Fish.prototype.update = function() {
                if(scene.auto === false && this.follow) {
                    this.food = new PVector(mouseX, mouseY);
                }
                var dir = PVector.sub(this.food, this.position);
                dir.normalize();
                dir.mult(0.1);
                this.acceleration = dir;
                this.velocity.add(this.acceleration);
                this.velocity.limit(4);
                this.position.add(this.velocity);
            };

            Fish.prototype.calculate = function(i, segment) {
                var dx = segment.x - this.segments[i].x;
                var dy = segment.y - this.segments[i].y;
                var angle = atan2(dy, dx);
                if(i <= 21) {
                    this.segments[i].x = segment.x - cos(angle) * this.segmentLength * this.scale;
                    this.segments[i].y = segment.y - sin(angle) * this.segmentLength * this.scale;
                }
                else {
                    this.segments[i].x = segment.x - cos(angle) * this.segmentLength * 0.7 * this.scale;
                    this.segments[i].y = segment.y - sin(angle) * this.segmentLength * 0.7 * this.scale;
                }
            };

            Fish.prototype.display = function(i) {
                pushMatrix();
                pushStyle();
                    rectMode(CENTER);
                    translate(this.segments[i].x, this.segments[i].y);
                    scale(this.scale);

                    var segColor = this.colors[i % this.colors.length];

                    //flesh
                    noStroke();
                    fill(segColor);
                    ellipse(this.segmentSizes[i], -this.segmentSizes[i], this.segmentSizes[i] * 4.5, this.segmentSizes[i] * 8);

                    //eyes
                    if(i === 3) {
                        stroke(36, 36, 36);
                        strokeWeight(3);
                        //right
                        ellipse(this.segmentSizes[i]*3.2, -this.segmentSizes[i] * 2, 2, 2);
                        //left
                        ellipse(-this.segmentSizes[i]*1.1, -this.segmentSizes[i] * 2, 2, 2);
                    }

                    noStroke();

                    //top fin
                    if(i >= 6 && i <= 15) {
                        rect(-this.segmentSizes[i] * -0.8, -this.segmentSizes[i] * 6, 1, pow((this.segmentSizes[i] * 0.5), 2.6));
                    }

                    //bottom fin
                    if(i >= 7 && i <= 10) {
                        //bottom fin
                        rect(-this.segmentSizes[i] * -0.8, -this.segmentSizes[i] * -4, 1, pow((this.segmentSizes[i] * 0.5), 2.2));
                    }

                    //side fins
                    if(i >= 5 && i <= 7) {
                        //side fins
                        rect(-this.segmentSizes[i] * 2, -this.segmentSizes[i] * 0.5, this.segmentSizes[i] * 4, 1);
                        rect(-this.segmentSizes[i] * -4, -this.segmentSizes[i] * 0.5, this.segmentSizes[i] * 4, 1);
                    }

                    //tail
                    if(i > 21) {
                        fill(this.colors[0]);
                        rect(0, 0, 3, 10 * (i - 21));
                    }
                popStyle();
                popMatrix();
            };

            Fish.run = function() {
                for(var i = 0; i < scene.fishes.length; i++) {
                    var fish = scene.fishes[i];

                    if(scene.auto === true && fish.change === true) {
                        fish.food = new PVector(fish.xOffset, fish.position.y);
                        if((fish.xOffset === -70 && fish.position.x < fish.xOffset) || (fish.xOffset === width + 70 && fish.position.x > fish.xOffset)) {
                            fish.direction *= -1;
                            fish.scale = constrain(fish.scale - 0.001 * fish.direction, 0.5, 1);
                            fish.change = false;   
                        }
                    }
                    else if(random() < 0.05) {
                        fish.food = new PVector(random(width), random(height));
                    }

                    fish.update();

                    if(scene.auto === false && fish.follow) {
                        fish.direction = -1;   
                    }

                    if(fish.change === false && (fish.scale === 0.5 || fish.scale === 1)) {
                        if(random() < 0.5) {
                            fish.xOffset = -70;
                        }
                        else {
                            fish.xOffset = width + 70;
                        }
                        fish.change = true;
                    }

                    fish.scale = constrain(fish.scale - 0.001 * fish.direction, 0.5, 1);

                    fish.calculate(0, fish.position);
                    for(var j = 0; j < fish.segments.length - 1; j++) {
                        fish.calculate(j + 1, fish.segments[j]);
                    }

                    if(fish.direction === -1) {
                        for(var k = fish.segments.length - 1; k >= 0; k--) {
                            fish.display(k);
                        }
                    }
                    else {
                        for(var k = 0; k < fish.segments.length; k++) {
                            fish.display(k);
                        }
                    }
                }

                //sort the fish so larger ones are in front
                var len = scene.fishes.length;
                for (var i = len - 1; i >= 0; i--){
                    for(var j = 1; j <= i; j++){
                        if(scene.fishes[j-1].scale > scene.fishes[j].scale){
                            var temp = scene.fishes[j-1];
                            scene.fishes[j-1] = scene.fishes[j];
                            scene.fishes[j] = temp;
                        }
                    }
                }
            };
        } //Fish

        {
            var Bubble = function(position, size) {
                this.position = position || new PVector(random(30, 70), height);
                this.velocity = new PVector(0, 0);
                this.acceleration = new PVector(0, 0);
                this.size = size || random(5, 20);
                this.color = random(100, 200);
            };

            Bubble.prototype.update = function() {
                var target = new PVector(this.position.x, -this.size);
                var dir = PVector.sub(target, this.position);
                dir.normalize();
                dir.mult(0.1);
                this.acceleration = dir;
                this.velocity.add(this.acceleration);
                this.velocity.limit(random(0.5, 1));
                this.position.add(this.velocity);
            };

            Bubble.prototype.display = function() {
                fill(this.color, this.color, this.color, 20);
                noStroke();
                ellipse(this.position.x, this.position.y, this.size, this.size);
            };

            Bubble.run = function() {
                for (var i = scene.bubbles.length - 1; i >= 0; i--) {
                    var bubble = scene.bubbles[i];

                    bubble.update();
                    bubble.display();

                    if (bubble.position.y < -bubble.size) {
                        scene.bubbles.splice(i, 1);
                    }
                }

                if (random(1) < 0.01) {
                    scene.bubbles.push(new Bubble());
                }
            };
        } //Bubbles

        {
            var Plant = function() {
                this.x = 0;
                this.offset = 150;
                this.theta = 0.0;
                this.amplitude = 20.0;
                this.dy = 0.0;
                this.color = color(69, 11, 66);
            };

            Plant.prototype.display = function() {
                stroke(0, 0, 0, 100);
                strokeWeight(3);
                noFill();

                this.theta += 0.01;
                this.dy = cos(this.theta) * this.amplitude;

                this.x = this.dy + this.offset;

                beginShape();
                    vertex(this.offset, 600);
                    bezierVertex(this.x-15, 566, this.x-15, 533, this.x-10, 500);
                endShape();

                beginShape();
                    vertex(this.offset, 600);
                    bezierVertex(this.x-12, 570, this.x-12, 560, this.x-8, 550);
                endShape();

                beginShape();
                    vertex(this.offset, 600);
                    bezierVertex(this.x-15, 566, this.x+15, 533, this.x+10, 520);
                endShape();

                beginShape();
                    vertex(this.offset, 600);
                    bezierVertex(this.x+20, 566, this.x+25, 533, this.x+15, 480);
                endShape();

                beginShape();
                    vertex(this.offset, 600);
                    bezierVertex(this.x+25, 566, this.x+35, 553, this.x+40, 540);
                endShape();

                beginShape();
                    vertex(this.offset, 600);
                    bezierVertex(this.x-35, 580, this.x-25, 570, this.x-30, 560);
                endShape();

                fill(this.color);
                noStroke();
                ellipse(this.x-10, 500, 12, 12);
                ellipse(this.x-8, 550, 10, 10);
                ellipse(this.x+10, 520, 10, 10);
                ellipse(this.x+15, 480, 14, 14);
                ellipse(this.x+40, 540, 12, 12);
                ellipse(this.x-30, 560, 10, 10);  
            };
        } //Plant (Swaying)

        {
            Scene.prototype.getSceneBack = function() {
                background(0, 0, 0, 0);

                //plant on left
                noFill();
                stroke(18, 18, 18, 80);

                strokeWeight(4);
                beginShape();
                    vertex(10, 490);
                    vertex(35, 430);
                    vertex(45, 395);
                endShape();

                beginShape();
                    vertex(10, 490);
                    vertex(10, 460);
                    vertex(15, 400);
                endShape();

                strokeWeight(3);
                beginShape();
                    vertex(10, 490);
                    vertex(20, 450);
                    vertex(20, 420);
                endShape();

                beginShape();
                    vertex(10, 490);
                    vertex(25, 470);
                    vertex(40, 450);
                endShape();

                beginShape();
                    vertex(10, 490);
                    vertex(5, 470);
                    vertex(2, 430);
                endShape();

                //plant in middle
                noFill();
                stroke(18, 18, 18, 80);

                strokeWeight(3);
                beginShape();
                    vertex(300, 510);
                    vertex(303, 485);
                    vertex(300, 470);
                endShape();

                beginShape();
                    vertex(300, 510);
                    vertex(296, 485);
                    vertex(294, 477);
                endShape();

                beginShape();
                    vertex(305, 510);
                    vertex(290, 495);
                    vertex(285, 488);
                endShape();

                beginShape();
                    vertex(300, 510);
                    vertex(307, 495);
                    vertex(312, 488);
                endShape();

                beginShape();
                    vertex(300, 510);
                    vertex(295, 495);
                    vertex(290, 488);
                endShape();

                //hills
                noStroke();

                //from back to front
                fill(20, 63, 99);
                beginShape();
                    vertex(0, 480);
                    bezierVertex(150, 470, 200, 510, 250, 520);
                    bezierVertex(600, 600, 600, 600, 600, 600);
                    vertex(0, 600);
                    vertex(0, 480);
                endShape();

                fill(16, 60, 89);
                beginShape();
                    vertex(0, 600);
                    bezierVertex(300, 450, 400, 500, 600, 550);
                    vertex(600, 600);
                    vertex(0, 600);
                endShape();

                fill(22, 55, 82);
                beginShape();
                    vertex(0, 510);
                    bezierVertex(100, 520, 200, 530, 300, 600);
                    vertex(0, 600);
                    vertex(0, 510);
                endShape();

                fill(10, 53, 74);
                beginShape();
                    vertex(600, 490);
                    bezierVertex(400, 480, 300, 550, 200, 600);
                    vertex(600, 600);
                    vertex(600, 490);
                endShape();

                return get(0, 0, width, height);
            };

            Scene.prototype.getSceneFront = function() {
                background(0, 0, 0, 0);

                //plant on right
                noFill();
                stroke(18, 18, 18, 200);
                strokeWeight(8);

                beginShape();
                    vertex(600, 600);
                    vertex(590, 440);
                    vertex(575, 350);
                endShape();

                strokeWeight(15);
                beginShape();
                    vertex(600, 600);
                    vertex(560, 430);
                    vertex(550, 300);
                endShape();

                strokeWeight(12);
                beginShape();
                    vertex(600, 600);
                    vertex(570, 430);
                    vertex(530, 320);
                endShape();

                beginShape();
                    vertex(570, 600);
                    vertex(540, 480);
                    vertex(500, 410);
                endShape();

                noStroke();
                fill(8, 47, 69);
                beginShape();
                    vertex(0, 550);
                    bezierVertex(300, 510, 500, 550, 600, 570);
                    vertex(600, 600);
                    vertex(0, 600);
                    vertex(0, 550);
                endShape();

                return get(0, 0, width, height);
            };

            Scene.prototype.getRays = function() {
                background(0, 0, 0, 0);

                noFill();
                stroke(255, 255, 255, 20);
                var j = 250;

                for(var i = -150; i < 800; i+= 20) {
                    strokeWeight(random(2, 10));
                    line(j, -50, i, height);
                    j+= 5;
                }

                filter(BLUR, 12);

                return get(0, 0, width, height);
            };

            Scene.prototype.init = function() {
                //Add Fish
                this.fishes.push(new Fish({
                    color1: color(255, 87, 51), 
                    color2: color(255, 195, 0), 
                    color3: color(243, 156, 18),
                    scale: random(0.6, 0.8),
                    follow: true}));

                this.fishes.push(new Fish({
                    scale: random(0.6, 0.8)
                }));

                this.plant = new Plant();
            };

            Scene.run = function() {
                background(27, 95, 135);
                image(scene.sceneBack, 0, 0);
                Fish.run();    
                image(scene.sceneFront, 0, 0);
                scene.plant.display();
                image(scene.rays, 0, 0);
                Bubble.run();
            };

            scene = new Scene();
            scene.init();
        } //Scene Methods and Declaration

        draw = function() {
            Scene.run();
        };

        {
            //Mouse click to add another fish
            mouseClicked = function() {
                if(scene.fishes.length < scene.maxFish) {        
                    scene.fishes.push(
                        new Fish({
                            position: new PVector(mouseX, mouseY),
                            scale: random(0.6, 1)
                        }));
                }
            };

            //take control of the fish
            mouseOver = function() {
                scene.auto = false;
            };

            //release control of the fish
            mouseOut = function() {
                scene.auto = true;  
            };
        } //Mouse Events

     }
}

// Get the canvas that Processing-js will use
var canvas = document.getElementById("canvas"); 
// Pass the function sketchProc (defined in myCode.js) to Processing's constructor.
var processingInstance = new Processing(canvas, sketchProc);