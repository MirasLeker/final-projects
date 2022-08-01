const activePage = window.location.pathname;
const navLinks = document.querySelectorAll('nav a').forEach(link => {
  if(link.href.includes(`${activePage}`)){
    link.classList.add('active');
    console.log(link);
  }
}


var Fireworks = function(){
	
	var self = this;
	var rand = function(rMi, rMa){return ~~((Math.random()*(rMa-rMi+1))+rMi);}
	var hitTest = function(x1, y1, w1, h1, x2, y2, w2, h2){return !(x1 + w1 < x2 || x2 + w2 < x1 || y1 + h1 < y2 || y2 + h2 < y1);};

	

	self.init = function(){	
    self.dt = 0;
		self.oldTime = Date.now();
		self.canvas = document.createElement('canvas');				
		self.canvasContainer = $('#canvas-container');
		
		var canvasContainerDisabled = document.getElementById('canvas-container');
		self.canvas.onselectstart = function() {
			return false;
		};
		
		self.canvas.width = self.cw = screen.width;
		self.canvas.height = self.ch = screen.height;	
		
		self.particles = [];	
		self.partCount = 80;
		self.fireworks = [];	
		self.mx = self.cw/2;
		self.my = self.ch/2;
		self.currentHue = 170;
		self.partSpeed = 1;
		self.partSpeedVariance = 20;
		self.partWind = 50;
		self.partFriction = 5;
		self.partGravity = 0;
		self.hueMin = 0;
		self.hueMax = 360;
		self.fworkSpeed = 2;
		self.fworkAccel = 4;
		self.hueVariance = 30;
		self.flickerDensity = 20;
		self.showShockwave = true;
		self.showTarget = true;
		self.clearAlpha = 25;

		self.canvasContainer.append(self.canvas);
		self.ctx = self.canvas.getContext('2d');
		self.ctx.lineCap = 'round';
		self.ctx.lineJoin = 'round';
		self.lineWidth = 1;
		self.bindEvents();			
		self.canvasLoop();
		
		self.canvas.onselectstart = function() {
			return false;
		};
    
		
	};		
	

	var Particle = function(x, y, hue){
		this.x = x;
		this.y = y;
		this.coordLast = [
			{x: x, y: y},
			{x: x, y: y},
			{x: x, y: y}
		];
		this.angle = rand(0, 360);
		this.speed = rand(((self.partSpeed - self.partSpeedVariance) <= 0) ? 1 : self.partSpeed - self.partSpeedVariance, (self.partSpeed + self.partSpeedVariance));
		this.friction = 1 - self.partFriction/100;
		this.gravity = self.partGravity/2;
		this.hue = rand(hue-self.hueVariance, hue+self.hueVariance);
		this.brightness = rand(50, 80);
		this.alpha = rand(40,100)/100;
		this.decay = rand(10, 50)/1000;
		this.wind = (rand(0, self.partWind) - (self.partWind/2))/25;
		this.lineWidth = self.lineWidth;
	};
	
	Particle.prototype.update = function(index){
		var radians = this.angle * Math.PI / 180;
		var vx = Math.cos(radians) * this.speed;
		var vy = Math.sin(radians) * this.speed + this.gravity;
		this.speed *= this.friction;
						
		this.coordLast[2].x = this.coordLast[1].x;
		this.coordLast[2].y = this.coordLast[1].y;
		this.coordLast[1].x = this.coordLast[0].x;
		this.coordLast[1].y = this.coordLast[0].y;
		this.coordLast[0].x = this.x;
		this.coordLast[0].y = this.y;
		
		this.x += vx * self.dt;
		this.y += vy * self.dt;
		
		this.angle += this.wind;				
		this.alpha -= this.decay;
		
		if(!hitTest(0,0,self.cw,self.ch,this.x-this.radius, this.y-this.radius, this.radius*2, this.radius*2) || this.alpha < .05){					
			self.particles.splice(index, 1);	
		}			
	};
	
	Particle.prototype.draw = function(){
		var coordRand = (rand(1,3)-1);
		self.ctx.beginPath();								
		self.ctx.moveTo(Math.round(this.coordLast[coordRand].x), Math.round(this.coordLast[coordRand].y));
		self.ctx.lineTo(Math.round(this.x), Math.round(this.y));
		self.ctx.closePath();				
		self.ctx.strokeStyle = 'hsla('+this.hue+', 100%, '+this.brightness+'%, '+this.alpha+')';
		self.ctx.stroke();				
		
		if(self.flickerDensity > 0){
			var inverseDensity = 50 - self.flickerDensity;					
			if(rand(0, inverseDensity) === inverseDensity){
				self.ctx.beginPath();
				self.ctx.arc(Math.round(this.x), Math.round(this.y), rand(this.lineWidth,this.lineWidth+3)/2, 0, Math.PI*2, false)
				self.ctx.closePath();
				var randAlpha = rand(50,100)/100;
				self.ctx.fillStyle = 'hsla('+this.hue+', 100%, '+this.brightness+'%, '+randAlpha+')';
				self.ctx.fill();
			}	
		}
	};
	
	self.createParticles = function(x,y, hue){
		var countdown = self.partCount;
		while(countdown--){						
			self.particles.push(new Particle(x, y, hue));
		}
	};
	
			
	self.updateParticles = function(){
		var i = self.particles.length;
		while(i--){
			var p = self.particles[i];
			p.update(i);
		};
	};
	
	
	self.drawParticles = function(){
		var i = self.particles.length;
		while(i--){
			var p = self.particles[i];				
			p.draw();				
		};
	};
}