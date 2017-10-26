function Level(){
    this.sceneInit = sceneInit;
    this.animateScene = animateScene;
    this.loadPlanetsScene1 = loadPlanetsScene1;
    this.scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000000000);
    camera.position.set(0, 0, 1700);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableKeys = false;
    controls.maxDistance = 200000000;
    controls.zoomSpeed = 1;
    /*controls.enabled=false;
     controls.enableZoom=true;*/
}

function goToPlanet(planet){
    previousCameraTarget.hasCamera = false;
    if(previousCameraTarget.guiOpen) previousCameraTarget.looseCamera();
    previousCameraTarget = planet;
    controls.target = planet.sphere.position;
    planet.targetOfCamera();
    //camera.position.set(planet.sphere.position.x, planet.sphere.position.y, planet.radius);
    controls.update();
}

function sceneInit() {
    //INTERACTION WITH PLANETS
    var projector = new THREE.Projector();
    var mouse = new THREE.Vector3();
    document.addEventListener('mousedown', onDocumentMouseDown, false);

    previousCameraTarget = planets[0];

    //Prevent using arrow keys and space to scroll the page
    document.addEventListener("keydown", function(e) {
        // space and arrow keys
        if([32, 37, 38, 39, 40].indexOf(e.keyCode) > -1) {
            e.preventDefault();
        }
    }, false);

    function onDocumentMouseDown(event) {
        mouse.x = ( event.clientX / renderer.domElement.clientWidth ) * 2 - 1;
        mouse.y = -( event.clientY / renderer.domElement.clientHeight ) * 2 + 1;

        raycasterPlanets.setFromCamera(mouse, camera);
        raycasterPlane.setFromCamera(mouse,camera);

        var intersects = raycasterPlanets.intersectObjects(spheresIntersection);
        var planeIntersects = raycasterPlane.intersectObjects(planeAddingIntersect);

        /*
        if (intersects.length > 0) {
            var planet = planets[0];
            for (var i = 0; i < planets.length; i++) {
                if (planets[i].sphere.position.equals(intersects[0].object.position)) {
                    planet = planets[i];
                }
            }

            goToPlanet(planet);
        }
        */
        if(isAdding && planeIntersects.length>0){
            var geometry = new THREE.SphereGeometry(30,100,100);
            var material = new THREE.MeshLambertMaterial( {
                color: 0x117ab3} );
            tempPlanet = new THREE.Mesh( geometry, material );
            tempPlanet.position.set(planeIntersects[0].point.x,planeIntersects[0].point.y,planeAddingIntersect[0].position.z);
            scene.add(tempPlanet);
            scene.remove(planeAddingIntersect[0]);
            scene.remove(planeAddingIntersect[1]);
            planeAddingIntersect=[];
            controls.target = tempPlanet.position;
            previousCameraTarget.hasCamera=false;
            loadNewPlanetGUI(planeIntersects[0].point.x);
        }
    }

    return scene;
}

function dispose(){
    document.removeEventListener('mousedown', onDocumentMouseDown, false);
    document.removeEventListener("keydown", onDocumentKeyDown, false);
}

function animateScene(){
    timePassed++;
    for(var j=0;j<animationVelocity;j++) {
        for (var i = 0; i < planets.length; i++) {
            planets[i].applyGravity(planets, i);
            planets[i].update();
        }
    }
    axes.updateAxis();
}
//UNITS
//weight kg
//length Mm (1000km = 1Mm)
//time s
function loadPlanetsScene1(number){

    //SUN
    planets.push(new Planet(1.98855e30, 695.7, 0, 0, 0, 0, "Sun", true));
    controls.target = planets[0].sphere.position;
    planets[0].sphere.castShadow = false;
    planets[0].sphere.receiveShadow = false;

    //PLANETS
    switch(number) {
        case 1:
            planets.push(new Planet(5.9722e24, 6.371, 149597.8707, 0, 0, 0,"Earth", false));
            //planets.push(new Planet(3.43234e23, 4.321, 155821.4, 0, 0, 0,"Earth-2", false));
            break;
        case 2:
            planets.push(new Planet(3.3011e23, 2.4397, 57909.05, 0, 0, 0,"Mercury", false, 0xe2e2e2)); //, new THREE.Vector3(0, 0.047362, 0)
            planets.push(new Planet(4.8675e24, 6.0518, 108208, 0, 0, 0,"Venus", false, 0xe39e1c)); //, new THREE.Vector3(0, 0.03502, 0)
            planets.push(new Planet(5.9722e24, 6.371, 149597.8707, 0, 0, 0,"Earth", false, 0x6b93d6)); //, new THREE.Vector3(0, 0.02978, 0)
            planets.push(new Planet(6.4171e23, 3.3895, 227939.2, 0, 0, 0,"Mars", false, 0xc1440e)); //, new THREE.Vector3(0, 0.024077, 0)
            planets.push(new Planet(1.8982e27, 69.911, 778570, 0, 0, 0,"Jupiter", false, 0xd8ca9d)); //, new THREE.Vector3(0, 0.01307, 0)
            planets.push(new Planet(5.6834e26, 58.232, 1433530, 0, 0, 0,"Saturn", false, 0xead6b8)); //, new THREE.Vector3(0, 0.00968, 0)
            planets.push(new Planet(8.681e25, 25.362, 2875040, 0, 0, 0,"Uranus", false, 0xd1e7e7)); //, new THREE.Vector3(0, 0, 0)
            planets.push(new Planet(1.0243e26, 24.622, 4500000, 0, 0, 0,"Neptune", false, 0x3d5ef9)); //, new THREE.Vector3(0, 0, 0)
            break;
    }
    /*

     */


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
    planets[0].sphere.material = new THREE.MeshBasicMaterial({color: 0xffffff}); //0xffd700
    var spriteMaterial = new THREE.SpriteMaterial(
        {
            map: new THREE.TextureLoader().load('images/glow.png'),
            color: 0xffffff, transparent: false, blending: THREE.AdditiveBlending //0xffd700
        });
    var sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(3000, 3000, 1);
    planets[0].sphere.add(sprite);

    //Main GUI
    mainGUI = new dat.GUI();
    planetFolder = mainGUI.addFolder('Current planets');
    planetFolder.open();
    loadAddPlanetButton();
    loadPlanetListGUI();
    loadTimeGUI();
    loadConfigurationGUI();
    backAndResetGUI();

    return this.scene;
}


function calculateVelocity(initialPosition, angleYZ){
    var velocity = new THREE.Vector3(0,0,0);
    //velocity
    for (var i = 0; i < planets.length; i++) {
        if (planets[i].isSun) {
            var hostStar = planets[i];
        }
    }
    var distanceFromSun = calculateDistance(initialPosition, hostStar.sphere.position);
    var directionFromSun = calculateDistance(initialPosition, hostStar.sphere.position);
    var totalVelocity = Math.sqrt((this.G*hostStar.mass)/distanceFromSun);

    var radiansYZ =  angleYZ * (Math.PI / 180);
    //var radiansXY = angleXZ * (Math.PI / 180);

    velocity.z = totalVelocity * Math.pow(Math.sin(radiansYZ), 2);
    velocity.y = totalVelocity* Math.pow(Math.cos(radiansYZ), 2);
    //velocity.x = totalVelocity * Math.pow(Math.cos(radiansXY), 2);
    return velocity;
}

function vectorModule(vector){
    return Math.pow(Math.pow(vector[0], 2) + Math.pow(vector[1], 2) + Math.pow(vector[2], 2), 1/2);
}
