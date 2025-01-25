const Engine = Matter.Engine,
      Render = Matter.Render,
      World = Matter.World,
      Bodies = Matter.Bodies,
      Body = Matter.Body;

// Initialize Matter.js engine
const engine = Engine.create({
  enableSleeping: false
});

const canvas = document.getElementById('sandCanvas');
const container = document.getElementById('container');

// Create renderer
const render = Render.create({
  canvas: canvas,
  engine: engine,
  options: {
    width: container.clientWidth,
    height: container.clientHeight,
    wireframes: false,
    background: 'transparent'
  }
});

// Create walls (glass container)
const wallThickness = 20;
const walls = [
  // Bottom
  Bodies.rectangle(render.options.width/2, render.options.height + wallThickness/2, render.options.width, wallThickness, { 
    isStatic: true,
    render: { fillStyle: '#444444' }
  }),
  // Left
  Bodies.rectangle(-wallThickness/2, render.options.height/2, wallThickness, render.options.height, { 
    isStatic: true,
    render: { fillStyle: '#444444' }
  }),
  // Right
  Bodies.rectangle(render.options.width + wallThickness/2, render.options.height/2, wallThickness, render.options.height, { 
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

// Add multiple particles in a grid
for (let i = 0; i < 20; i++) {
  for (let j = 0; j < 20; j++) {
    particles.push(
      Bodies.circle(
        render.options.width/2 - 100 + i * (particleSize + 2),
        render.options.height/2 - 200 + j * (particleSize + 2),
        particleSize/2,
        particleOptions
      )
    );
  }
}

// Add all bodies to the world
World.add(engine.world, [...walls, ...particles]);

// Start the engine and renderer
Engine.run(engine);
Render.run(render);

// Handle device orientation
if (window.DeviceOrientationEvent) {
  window.addEventListener('deviceorientation', function(event) {
    const gravity = engine.world.gravity;
    
    // Convert orientation to gravity
    const beta = event.beta * Math.PI / 180; // Front/back tilt
    const gamma = event.gamma * Math.PI / 180; // Left/right tilt
    
    // Update gravity based on device orientation
    gravity.x = Math.sin(gamma) * 0.001;
    gravity.y = Math.sin(beta) * 0.001;
    
  }, true);
} else {
  document.getElementById('noSupport').style.display = 'block';
}

// Handle window resize
window.addEventListener('resize', function() {
  render.canvas.width = container.clientWidth;
  render.canvas.height = container.clientHeight;
  render.options.width = container.clientWidth;
  render.options.height = container.clientHeight;
  
  // Update walls positions
  Body.setPosition(walls[0], { 
    x: render.options.width/2,
    y: render.options.height + wallThickness/2
  });
  Body.setPosition(walls[2], {
    x: render.options.width + wallThickness/2,
    y: render.options.height/2
  });
});

// Request permission for device orientation on iOS
function requestPermission() {
  if (typeof DeviceOrientationEvent !== 'undefined' && 
      typeof DeviceOrientationEvent.requestPermission === 'function') {
    DeviceOrientationEvent.requestPermission()
      .then(response => {
        if (response === 'granted') {
          window.addEventListener('deviceorientation', handleOrientation);
        }
      })
      .catch(console.error);
  }
}

function handleOrientation(event) {
  const gravity = engine.world.gravity;
  
  // Convert orientation to gravity
  const beta = event.beta * Math.PI / 180; // Front/back tilt
  const gamma = event.gamma * Math.PI / 180; // Left/right tilt
  
  // Update gravity based on device orientation
  gravity.x = Math.sin(gamma) * 0.001;
  gravity.y = Math.sin(beta) * 0.001;
}

// Request permission when page is loaded
document.addEventListener('DOMContentLoaded', requestPermission);
// Also try to request on first user interaction
document.addEventListener('touchend', requestPermission, { once: true });