function loadAddPlanetButton(){
    var addPlanetButton = {
        AddPlanet: function () {
            if(isAdding){
                return;
            }
            isAdding=true;
            var geometry = new THREE.PlaneGeometry(1e6,1e6,32,32);
            var geometry2 = new THREE.PlaneGeometry(1e6,300,32,32);
            var material = new THREE.MeshBasicMaterial( {
                color: 0x117ab3} );
            material.side = THREE.DoubleSide;
            material.wireframe=true;
            var material2 = new THREE.MeshBasicMaterial({ color: 0xFF0000});
            material2.side = THREE.DoubleSide;
            var planeAdding = new THREE.Mesh( geometry, material );
            var plane2Adding = new THREE.Mesh(geometry2, material2);
            planeAdding.position.set(0,0,-500);
            plane2Adding.position.set(0,0,-500);
            planeAdding.rotateZ(90);
            scene.add(planeAdding);
            scene.add(plane2Adding);
            planeAddingIntersect[0]=planeAdding;
            planeAddingIntersect[1]=plane2Adding;
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
        this.timeOptions = 'Time Unit';
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
    var timePassedButton = {
        Button: function () {
            for(var i=0;i<configVariable.customSpeed;i++){
                level.animateScene();
            }
        }
    };

    var timeConfigurationController = timeFolder.add(configVariable, 'timeOptions', ["Seconds", "Minutes", "Hours", "Days"]).name('Time Unit');
    var timeSpeedController = timeFolder.add(configVariable, 'timeSpeed',1).name('Time speed');
    timeFolder.add(playButton, 'Play');
    timeFolder.add(stopButton, 'Stop');
    var customSpeedController = timeFolder.add(configVariable, 'customSpeed').name('Time passed');
    timeFolder.add(timePassedButton, 'Button').name('Pass Time');

    timeSpeedController.onFinishChange(function (value) {
        animationVelocity=value;
        for(var i=0;i<planets.length();i++){
            planets[i].changeTracksPerFrame(value);
        }
    });

    timeConfigurationController.onFinishChange(function (value) {
        switch (value) {
            case "Seconds":
                for(var i=0;i<planets.length;i++){
                    var temp1 = planets[i].velocityConstant;
                    planets[i].velocityConstant = 1;
                    planets[i].velocity[0] = planets[i].velocity[0]*(planets[i].velocityConstant/temp1);
                    planets[i].velocity[1] = planets[i].velocity[1]*(planets[i].velocityConstant/temp1);
                    planets[i].velocity[2] = planets[i].velocity[2]*(planets[i].velocityConstant/temp1);
                    planets[i].G = 6.67408e-29;
                }
                G = 6.67408e-29;
                velocityConstant = 1;
                break;
            case "Minutes":
                for(var j=0;j<planets.length;j++){
                    var temp2 = planets[j].velocityConstant;
                    planets[j].velocityConstant = 60;
                    planets[j].velocity[0] = planets[j].velocity[0]*(planets[j].velocityConstant/temp2);
                    planets[j].velocity[1] = planets[j].velocity[1]*(planets[j].velocityConstant/temp2);
                    planets[j].velocity[2] = planets[j].velocity[2]*(planets[j].velocityConstant/temp2);
                    planets[j].G = 2.4026688e-25;
                }
                G = 2.4026688e-25;
                velocityConstant = 60;
                break;
            case "Hours":
                for(var k=0;k<planets.length;k++){
                    var temp3 = planets[k].velocityConstant;
                    planets[k].velocityConstant = 3600;
                    planets[k].velocity[0] = planets[k].velocity[0]*(planets[k].velocityConstant/temp3);
                    planets[k].velocity[1] = planets[k].velocity[1]*(planets[k].velocityConstant/temp3);
                    planets[k].velocity[2] = planets[k].velocity[2]*(planets[k].velocityConstant/temp3);
                    planets[k].G = 8.64960768e-22;
                }
                G = 8.64960768e-22;
                velocityConstant = 3600;
                break;
            case "Days":
                for(var l=0;l<planets.length;l++){
                    var temp4 = planets[l].velocityConstant;
                    planets[l].velocityConstant = 86400;
                    planets[l].velocity[0] = planets[l].velocity[0]*(planets[l].velocityConstant/temp4);
                    planets[l].velocity[1] = planets[l].velocity[1]*(planets[l].velocityConstant/temp4);
                    planets[l].velocity[2] = planets[l].velocity[2]*(planets[l].velocityConstant/temp4);
                    planets[l].G = 4.982174024e-19;
                }
                G = 4.982174024e-19;
                velocityConstant = 86400;
                break;
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
        this.zoomSpeed = controls.zoomSpeed;
    };

    configurationFolder = mainGUI.addFolder('Configuration');
    var lengthController = configurationFolder.add(configVariable,'trackLength',1).name('Track length');
    var trackActivatedController = configurationFolder.add(configVariable, 'trackActivated').name('Activate track');
    var shadowsController = configurationFolder.add(configVariable, 'shadows').name('Shadows');
    var zoomSpeedController = configurationFolder.add(configVariable, 'zoomSpeed',1).name('Zoom Speed');

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
    zoomSpeedController.onFinishChange(function (value) {
        controls.zoomSpeed=value;
    })
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
    var initialRadius = 5;
    var planetInfo = new function () {
        this.name = "New Planet";
        this.mass = 5e24;
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
    addPlanetGUI.add(planetInfo,'mass').name('Mass (kg)');
    var radiusController = addPlanetGUI.add(planetInfo,'radius').name('Radius (Mm)');
    var angleController = addPlanetGUI.add(planetInfo,'angle',0,90).name('Angle (Degrees)');
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
