var container = document.getElementById( 'container' );
var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
container.appendChild( renderer.domElement );
renderer.setClearColor(0x000000);

var stats = new Stats();
stats.showPanel( 0 );
document.body.appendChild( stats.dom );

var scene;
var camera;

//For the interactions
var raycasterPlanets = new THREE.Raycaster();
var animationVelocity=1;
var spheresIntersection=[];
var planets = [];
var G = 6.67408e-29;
var velocityConstant = 1;
var control;
var previousCameraTarget;

//Configuration
var configurationFolder;
var trackActivated = true;
var trackLength = 1000;

//Time GUI
var timePassed=0;

//List of planets GUI
var mainGUI;
var planetFolder;
var controllerArray;

//Add planets
var raycasterPlane = new THREE.Raycaster();
var addPlanetGUI;
var planeAddingIntersect = [];
var tempPlanet;
var isAdding=false;
var angleZYLine;
var angleXZLine;

//Load scene
var level = new Level();
var levelLoaded = 1;

//Load Axes
var axes = new AxesXYZ();

function init(levelToLoad){
    levelLoaded = levelToLoad;
    scene = level.loadPlanetsScene1(levelToLoad);
    level.sceneInit();
    console.log(levelToLoad);
    render();
}

function render() {
    stats.begin();
    level.animateScene();
    //  console.log(timePassed);
    stats.end();
    renderer.render(scene, camera);
    axisRenderer.render( axisScene, axisCamera );
    requestAnimationFrame(render);
}


