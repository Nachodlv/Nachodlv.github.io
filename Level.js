function Level(){
    this.sceneInit = sceneInit;
    this.animateScene = animateScene;
    this.loadPlanetsScene1 = loadPlanetsScene1;
    this.scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
    camera.position.set(0, 0, 1700);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.addEventListener('change', render);
    controls.maxDistance = 20000;
    /*controls.enabled=false;
     controls.enableZoom=true;*/
}

function goToPlanet(planet){
    previousCameraTarget.hasCamera = false;
    if(previousCameraTarget.guiOpen) previousCameraTarget.closeGUI();
    previousCameraTarget = planet;
    controls.target = planet.sphere.position;
    planet.hasCamera = true;
    planet.openGUI();
    controls.update();
}

function sceneInit() {
    //INTERACTION WITH PLANETS
    var projector = new THREE.Projector();
    var mouse = new THREE.Vector3();
    document.addEventListener('mousedown', onDocumentMouseDown, false);

    previousCameraTarget = planets[0];
    function onDocumentMouseDown(event) {
        mouse.x = ( event.clientX / renderer.domElement.clientWidth ) * 2 - 1;
        mouse.y = -( event.clientY / renderer.domElement.clientHeight ) * 2 + 1;

        raycasterPlanets.setFromCamera(mouse, camera);
        raycasterPlane.setFromCamera(mouse,camera);

        var intersects = raycasterPlanets.intersectObjects(spheresIntersection);
        var planeIntersects = raycasterPlane.intersectObjects(planeAddingIntersect);

        if (intersects.length > 0) {
            var planet = planets[0];
            for (var i = 0; i < planets.length; i++) {
                if (planets[i].sphere.position.equals(intersects[0].object.position)) {
                    planet = planets[i];
                }
            }

            goToPlanet(planet);
        }
        if(isAdding && planeIntersects.length>0){
            var geometry = new THREE.SphereGeometry(30,100,100);
            var material = new THREE.MeshLambertMaterial( {
                color: 0x117ab3} );
            tempPlanet = new THREE.Mesh( geometry, material );
            tempPlanet.position.set(planeIntersects[0].point.x,planeIntersects[0].point.y,planeAddingIntersect[0].position.z);
            scene.add(tempPlanet);
            scene.remove(planeAddingIntersect[0]);
            planeAddingIntersect=[];
            controls.target = tempPlanet.position;
            previousCameraTarget.hasCamera=false;
            loadNewPlanetGUI();
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
}

function loadPlanetsScene1(){
    //PLANETS
    planets.push(new Planet(700, 50, 0, 0, 0, "Sun"));//down to 10 from 100
    controls.target = planets[0].sphere.position;
    planets.push(new Planet(10, 20, 1000, 0, 15, "Earth"));
    planets.push(new Planet(15, 30, 1558, 0, 0, "Earth-2"));
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
    loadAddPlanetButton();

    return this.scene;
}
