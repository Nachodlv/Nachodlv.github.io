function Level(){
    this.sceneInit = sceneInit;
    this.animateScene = animateScene;
    this.loadPlanetsScene1 = loadPlanetsScene1;
    this.scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
    camera.position.set(0, 0, 1700);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.addEventListener('change', render);
    controls.maxDistance = 2000;
    /*controls.enabled=false;
     controls.enableZoom=true;*/
}

function loadPlanetGUI(planet){
    var planetModificationGUI = new function () {
        this.mass = planet.mass;
        this.radius = planet.radius;
        this.name = planet.name;
    };
    planet.openGUI(planetModificationGUI);
}
function consoleLog(){
    console.log("clicked");
}

function refreshPlanetListGUI(){
    for(var i=0;i<controllerArray.length;i++){
        planetFolder.remove(controllerArray[i]);
    }
    loadPlanetListGUI();
}

function loadPlanetListGUI(){
    var planetButton = {
        Button: function (planet) {
            goToPlanet(planet);
        }
    };

    controllerArray = [];
    for(var i=0;i<planets.length;i++){
        controllerArray[i] = planetFolder.add({Button: planetButton.Button.bind(this, planets[i])},'Button').name(planets[i].name);
    }
}

function goToPlanet(planet){
    previousCameraTarget.hasCamera = false;
    if(previousCameraTarget.guiOpen) previousCameraTarget.closeGUI();
    previousCameraTarget = planet;
    controls.target = planet.sphere.position;
    planet.setCameraTarget(camera);
    loadPlanetGUI(planet);
    controls.update();
}

function sceneInit() {
    //INTERACTION WITH PLANETS
    var projector = new THREE.Projector();
    raycaster = new THREE.Raycaster();
    var mouse = new THREE.Vector3();
    document.addEventListener('mousedown', onDocumentMouseDown, false);
    document.addEventListener("keydown", onDocumentKeyDown, false);

    previousCameraTarget = planets[0];
    function onDocumentMouseDown(event) {
        mouse.x = ( event.clientX / renderer.domElement.clientWidth ) * 2 - 1;
        mouse.y = -( event.clientY / renderer.domElement.clientHeight ) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);

        var intersects = raycaster.intersectObjects(spheresIntersection);

        if (intersects.length > 0) {
            var planet = planets[0];
            for (var i = 0; i < planets.length; i++) {
                if (planets[i].sphere.position.equals(intersects[0].object.position)) {
                    planet = planets[i];
                }
            }

            goToPlanet(planet);
        }
    }



    function onDocumentKeyDown(event) {
        var keyCode = event.which;

        // 'D'
        if (keyCode === 68)
            animationVelocity -= 1;
        // 'F'
        else if (keyCode === 70)
            animationVelocity += 1;
    }
    return scene;
}

function dispose(){
    document.removeEventListener('mousedown', onDocumentMouseDown, false);
    document.removeEventListener("keydown", onDocumentKeyDown, false);
}

function animateScene(){
    for(var j=0;j<animationVelocity;j++) {
        for (var i = 0; i < planets.length; i++) {
            planets[i].applyGravity(planets, i);
            planets[i].update();
        }
    }
}

function loadPlanetsScene1(){
    //PLANETS
    planets.push(new Planet(700, 50, 0, 0, 0, "Sun"));//down to 10 from 100
    controls.target = planets[0].sphere.position;
    spheresIntersection.push(planets[0].clickableSphere);
    planets.push(new Planet(10, 20, 1000, 0, 15, "Earth"));
    spheresIntersection.push(planets[1].clickableSphere);
    planets.push(new Planet(15, 30, 1558, 0, 0, "Earth-2"));
    spheresIntersection.push(planets[2].clickableSphere);
    planets[0].sphere.castShadow = false;
    planets[0].sphere.receiveShadow = false;
    planets[0].isSun=true;
    for (var i = 0; i < planets.length; i++) {
        this.scene.add(planets[i].clickableSphere);
        this.scene.add(planets[i].sphere);
    }

    //LIGHT
    var sunLight = new THREE.PointLight(0xffffff, 3);
    sunLight.position.set(0, 0, -500);
    sunLight.shadow = new THREE.LightShadow(new THREE.PerspectiveCamera(100, 1, 500, 1000));
    sunLight.shadow.bias = 0.0001;
    sunLight.shadow.mapSize.width = 2048 * 2;
    sunLight.shadow.mapSize.height = 2048 * 2;
    this.scene.add(sunLight);

    //SUN GLOW
    planets[0].sphere.material = new THREE.MeshBasicMaterial({color: 0xffd700});
    var spriteMaterial = new THREE.SpriteMaterial(
        {
            map: new THREE.ImageUtils.loadTexture('images/glow.png'),
            color: 0xffd700, transparent: false, blending: THREE.AdditiveBlending
        });
    var sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(200, 200, 1.0);
    planets[0].sphere.add(sprite);

    //Main GUI
    mainGUI = new dat.GUI({autoPlace: true});
    planetFolder = mainGUI.addFolder('Current planets');
    planetFolder.open();
    loadPlanetListGUI();
    loadTtimeGUI();
    loadConfigurationGUI();

    return this.scene;
}

function loadTtimeGUI() {
    var timeFolder = mainGUI.addFolder('Time controller');
    timeFolder.open();

    var configVariable = new function () {
        this.timeSpeed = animationVelocity;
    };
    var playButton = {
        Play: function () {
            animationVelocity = configVariable.timeSpeed;
        }
    };
    var stopButton = {
        Stop: function () {
            animationVelocity = 0;

        }
    };
    var timeSpeedController = timeFolder.add(configVariable, 'timeSpeed',1).name('Time speed');
    timeFolder.add(playButton, 'Play');
    timeFolder.add(stopButton, 'Stop');
    timeSpeedController.onFinishChange(function (value) {
        animationVelocity=value;
    });
}
//Configuration GUI
function loadConfigurationGUI() {
    var configVariable = new function () {
        this.trackLength = trackLength;
        this.trackActivated = trackActivated;
        this.timeSpeed = animationVelocity;
        this.shadows = true;
    };
    configurationFolder = mainGUI.addFolder('Configuration');
    var lengthController = configurationFolder.add(configVariable,'trackLength',1).name('Track length');
    var trackActivatedController = configurationFolder.add(configVariable, 'trackActivated').name('Activate track');
    var shadowsController = configurationFolder.add(configVariable, 'shadows').name('Shadows');

    lengthController.onFinishChange(function(value){
        trackLength = value;
    });
    trackActivatedController.onFinishChange(function (value) {
        trackActivated=value;
        for(var i=0;i<planets.length;i++){
            planets[i].eraseTrack();
        }
    });
    shadowsController.onFinishChange(function (value) {
       for(var i=0;i<planets.length;i++) {
           if (!planets[i].isSun) {
               planets[i].sphere.receiveShadow = value;
               planets[i].sphere.castShadow = value;
               planets[i].needsUpdate = true;
           }
       }
    });
}