function Level(){
    this.sceneInit = sceneInit;
    this.animateScene = animateScene;
    this.loadPlanetsScene1 = loadPlanetsScene1;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
    this.camera.position.set(0, 0, 1700);

    controls = new THREE.OrbitControls(this.camera, renderer.domElement);
    controls.addEventListener('change', render);
    /*controls.enabled=false;
     controls.enableZoom=true;*/
}

function sceneInit() {
    //INTERACTION WITH PLANETS
    var projector = new THREE.Projector();
    raycaster = new THREE.Raycaster();
    var mouse = new THREE.Vector3();
    document.addEventListener('mousedown', onDocumentMouseDown, false);
    document.addEventListener("keydown", onDocumentKeyDown, false);

    var previousCameraTarget = planets[0];
    function onDocumentMouseDown(event) {
        event.preventDefault();

        mouse.x = ( event.clientX / renderer.domElement.clientWidth ) * 2 - 1;
        mouse.y = -( event.clientY / renderer.domElement.clientHeight ) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);

        var intersects = raycaster.intersectObjects(spheresIntersection);

        if (intersects.length > 0) {
            previousCameraTarget.hasCamera = false;
            controls.target = intersects[0].object.position;
            var planet = planets[0];
            for (var i = 0; i < planets.length; i++) {
                if (planets[i].sphere.position.equals(intersects[0].object.position)) {
                    planet = planets[i];
                }
            }
            previousCameraTarget = planet;
            planet.setCameraTarget(camera);
            var planetModificationGUI = new function () {
                this.mass = planet.mass;
                this.radius = planet.radius;
            };
            planet.openGUI(planetModificationGUI);
            controls.update();
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
    planets[0].sphere.position.x = 0;
    planets[0].sphere.position.y = 0;
    planets[0].velocity = [0, 0, 0];

    for(var j=0;j<animationVelocity;j++) {
        planets[0].scaleClickableSphere();
        for (var i = 1; i < planets.length; i++) {
            planets[i].applyGravity(planets, i);
            planets[i].update();
            planets[i].scaleClickableSphere();
        }
    }
    this.camera.position = controls.target;
}

function loadPlanetsScene1(){
    //PLANETS
    planets.push(new Planet(700, 50, 0, 0, 0));//down to 10 from 100
    controls.target = planets[0].sphere.position;
    spheresIntersection.push(planets[0].clickableSphere);
    planets.push(new Planet(10, 20, 1000, 0, 15));
    spheresIntersection.push(planets[1].clickableSphere);
    planets.push(new Planet(15, 30, 1558, 0, 0));
    spheresIntersection.push(planets[2].clickableSphere);
    planets[0].sphere.castShadow = false;
    planets[0].sphere.receiveShadow = false;
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

    return this.scene;
}