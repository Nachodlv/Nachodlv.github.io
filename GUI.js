function loadAddPlanetButton(){
    var addPlanetButton = {
        AddPlanet: function () {
            if(isAdding){
                return;
            }
            isAdding=true;
            var geometry = new THREE.PlaneGeometry(10000,10000,32,32);
            var material = new THREE.MeshBasicMaterial( {
                color: 0x117ab3} );
            material.side = THREE.DoubleSide;
            material.wireframe=true;
            var planeAdding = new THREE.Mesh( geometry, material );
            planeAdding.position.set(0,0,-500);
            planeAdding.rotateZ(90);
            scene.add(planeAdding);
            planeAddingIntersect[0]=planeAdding;
        }
    };
    mainGUI.add(addPlanetButton,'AddPlanet').name('Add planet');
}


function loadTtimeGUI() {
    var timeFolder = mainGUI.addFolder('Time controller');
    timeFolder.open();

    var configVariable = new function () {
        this.timeSpeed = animationVelocity;
        this.customSpeed = 0;
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
    var customSpeedController = timeFolder.add(configVariable, 'customSpeed').name('Time passed');

    timeSpeedController.onFinishChange(function (value) {
        animationVelocity=value;
    });
    customSpeedController.onFinishChange(function (value) {
       for(var i=0;i<value;i++){
           level.animateScene();
       }
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
    controllerArray=[];
    for(var i=0;i<planets.length;i++){
        controllerArray[i]=planetFolder.add({Button: planetButton.Button.bind(this, planets[i])},'Button').name(planets[i].name);
    }
}

function loadNewPlanetGUI(){
    var initialRadius = 30;
    var planetInfo = new function () {
        this.name = "New Planet";
        this.mass = 100;
        this.radius = initialRadius;
        this.angle = 0;
    };
    addPlanetGUI = new dat.GUI();
    var createPlanetButton = {
        CreatePlanet: function () {
            addPlanetGUI.destroy();
            var planet = new Planet(planetInfo.mass,planetInfo.radius,tempPlanet.position.x,tempPlanet.position.y,planetInfo.angle,planetInfo.name);
            scene.add(planet.sphere);
            scene.add(planet.clickableSphere);
            scene.remove(tempPlanet);
            scene.remove(angleLine);
            planets[planets.length]=planet;
            refreshPlanetListGUI();
            isAdding=false;
            goToPlanet(planet);
        }
    };

    var cancelButton = {
        Cancel: function () {
            addPlanetGUI.destroy();
            scene.remove(tempPlanet);
            scene.remove(angleLine);
            isAdding=false;
            goToPlanet(previousCameraTarget);
        }
    };
    addPlanetGUI.add(planetInfo,'name').name('Name');
    addPlanetGUI.add(planetInfo,'mass').name('Mass');
    var radiusController = addPlanetGUI.add(planetInfo,'radius').name('Radius');
    var angleController = addPlanetGUI.add(planetInfo,'angle',0,90).name('Angle');
    addPlanetGUI.add(createPlanetButton,'CreatePlanet').name('Create planet');
    addPlanetGUI.add(cancelButton, 'Cancel');

    radiusController.onFinishChange(function (value) {
        var scale = value/initialRadius;
        tempPlanet.scale.set(scale,scale,scale);
    });
    angleController.onFinishChange(function (value) {
        scene.remove(angleLine);
        var scale = tempPlanet.position.distanceTo(camera.position)/5;
        var vector3 = new THREE.Vector3(0,0,0);
        vector3.z = scale * value/90;
        vector3.y = scale-vector3.z;

        var material = new THREE.LineBasicMaterial({ color: 0xff0000});
        var geometry = new THREE.Geometry();
        geometry.vertices.push(new THREE.Vector3(tempPlanet.position.x,tempPlanet.position.y,tempPlanet.position.z));
        geometry.vertices.push(new THREE.Vector3(tempPlanet.position.x + vector3.x, tempPlanet.position.y + vector3.y, tempPlanet.position.z + vector3.z));
        angleLine = new THREE.Line(geometry, material);
        scene.add(angleLine);
    })
}
