const Engine = Matter.Engine,
      Render = Matter.Render,
      World = Matter.World,
      Bodies = Matter.Bodies,
      Body = Matter.Body;

class SandSimulator {
  constructor() {
    this.engine = Engine.create({
      enableSleeping: false
    });

    this.container = document.getElementById('container');
    this.canvas = document.getElementById('sandCanvas');
    this.startPrompt = document.getElementById('startPrompt');
    this.setupComplete = false;
    
    // Initialize renderer
    this.render = Render.create({
      canvas: this.canvas,
      engine: this.engine,
      options: {
        width: this.container.clientWidth,
        height: this.container.clientHeight,
        wireframes: false,
        background: 'transparent'
      }
    });

    this.setupEventListeners();
  }

  async initialize() {
    try {
      // Request fullscreen
      if (this.container.requestFullscreen) {
        await this.container.requestFullscreen();
      } else if (this.container.webkitRequestFullscreen) {
        await this.container.webkitRequestFullscreen();
      }

      // Lock screen orientation to landscape
      if (screen.orientation && screen.orientation.lock) {
        try {
          await screen.orientation.lock('landscape');
        } catch (e) {
          console.log('Orientation lock failed:', e);
        }
      }

      // Request device motion/orientation permission
      if (typeof DeviceOrientationEvent !== 'undefined' && 
          typeof DeviceOrientationEvent.requestPermission === 'function') {
        const permission = await DeviceOrientationEvent.requestPermission();
        if (permission !== 'granted') {
          throw new Error('Permission not granted');
        }
      }

      this.setupPhysics();
      this.startPrompt.style.display = 'none';
      this.setupComplete = true;

    } catch (error) {
      console.error('Setup failed:', error);
      this.startPrompt.textContent = 'Setup failed. Please reload and try again.';
    }
  }

  setupPhysics() {
    // Create walls
    const wallThickness = 20;
    this.walls = [
      // Bottom
      Bodies.rectangle(this.render.options.width/2, this.render.options.height + wallThickness/2, 
        this.render.options.width, wallThickness, { 
        isStatic: true,
        render: { fillStyle: '#444444' }
      }),
      // Left
      Bodies.rectangle(-wallThickness/2, this.render.options.height/2, 
        wallThickness, this.render.options.height, { 
        isStatic: true,
        render: { fillStyle: '#444444' }
      }),
      // Right
      Bodies.rectangle(this.render.options.width + wallThickness/2, this.render.options.height/2, 
        wallThickness, this.render.options.height, { 
        isStatic: true,
        render: { fillStyle: '#444444' }
      })
    ];

    // Create sand particles
    const particles = [];
    const particleSize = 8;
    const particleOptions = {
      friction: 0.5,
      restitution: 0.2,
      density: 1,
      render: {
        fillStyle: '#F7E197'
      }
    };

    // Add particles in a grid
    for (let i = 0; i < 20; i++) {
      for (let j = 0; j < 20; j++) {
        particles.push(
          Bodies.circle(
            this.render.options.width/2 - 100 + i * (particleSize + 2),
            this.render.options.height/2 - 200 + j * (particleSize + 2),
            particleSize/2,
            particleOptions
          )
        );
      }
    }

    World.add(this.engine.world, [...this.walls, ...particles]);
    Engine.run(this.engine);
    Render.run(this.render);
  }

  setupEventListeners() {
    // Start simulation on tap
    this.startPrompt.addEventListener('click', () => this.initialize());
    
    // Handle device orientation
    window.addEventListener('deviceorientation', (event) => {
      if (!this.setupComplete) return;
      
      const gravity = this.engine.world.gravity;
      const beta = event.beta * Math.PI / 180;
      const gamma = event.gamma * Math.PI / 180;
      
      gravity.x = Math.sin(gamma) * 0.001;
      gravity.y = Math.sin(beta) * 0.001;
    }, true);

    // Handle resize
    window.addEventListener('resize', () => {
      if (!this.setupComplete) return;
      
      this.render.canvas.width = this.container.clientWidth;
      this.render.canvas.height = this.container.clientHeight;
      this.render.options.width = this.container.clientWidth;
      this.render.options.height = this.container.clientHeight;
      
      // Update walls positions
      const wallThickness = 20;
      Body.setPosition(this.walls[0], { 
        x: this.render.options.width/2,
        y: this.render.options.height + wallThickness/2
      });
      Body.setPosition(this.walls[2], {
        x: this.render.options.width + wallThickness/2,
        y: this.render.options.height/2
      });
    });
  }
}

// Start the simulation
new SandSimulator();