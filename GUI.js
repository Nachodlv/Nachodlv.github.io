function loadAddPlanetButton(){
    var addPlanetButton = {
        AddPlanet: function () {
            if(isAdding){
                return;
            }
            isAdding=true;
            var scale = calculateDistance(planets[0].sphere.position, camera.position);
            var geometry = new THREE.PlaneGeometry(1e6,10,32,32);
            var material = new THREE.MeshBasicMaterial({ color: 0xFF0000});
            material.side = THREE.DoubleSide;
            var planeAdding = new THREE.Mesh(geometry, material);
            planeAdding.scale.set(1,scale*0.001, 1);
            planeAdding.position.set((1e6)/2,0,-500);
            scene.add(planeAdding);
            planeAddingIntersect[0]=planeAdding;
        }
    };
    mainGUI.add(addPlanetButton,'AddPlanet').name('Add planet (+)');
}


function loadTimeGUI() {
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
    var timeUnits = ['Seconds', 'Minutes', 'Hours', 'Days'];
    var timeConfigurationController = timeFolder.add(configVariable, 'timeOptions', timeUnits).name('Time Unit');
    configVariable.timeOptions = timeUnits[0];
    timeConfigurationController.updateDisplay();

    var timeSpeedController = timeFolder.add(configVariable, 'timeSpeed',1).name('Time speed');
    timeFolder.add(playButton, 'Play');
    timeFolder.add(stopButton, 'Stop');
    var customSpeedController = timeFolder.add(configVariable, 'customSpeed').name('Time passed');
    timeFolder.add(timePassedButton, 'Button').name('Pass Time');
    //configVariable.timeOptions = "Seconds";

    timeSpeedController.onFinishChange(function (value) {
        animationVelocity=value;
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
        this.zoomSpeed = controls.zoomSpeed;
    };

    configurationFolder = mainGUI.addFolder('Configuration');
    configurationFolder.open();
    var lengthController = configurationFolder.add(configVariable,'trackLength',1).name('Track length');
    var trackActivatedController = configurationFolder.add(configVariable, 'trackActivated').name('Activate track');
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

function loadNewPlanetGUI(distanceFromSun){
    var initialRadius = 5;
    var planetInfo = new function () {
        this.name = "New Planet";
        this.mass = 5e24;
        this.radius = initialRadius;
        this.distanceFromSun = distanceFromSun;
        //this.angleZY = 0;
        this.angleXY = 90;
        this.defaultVelocity = true;
        this.starterVelocity = vectorModule(calculateVelocity(new THREE.Vector3(distanceFromSun,0,0), this.angleXY));
        this.initialVelocity = this.starterVelocity.toFixed(3).toString();
    };
    addPlanetGUI = new dat.GUI();
    var createPlanetButton = {
        CreatePlanet: function () {
            addPlanetGUI.destroy();
            if(planetInfo.defaultVelocity){
                planetInfo.starterVelocity = calculateVelocity(new THREE.Vector3(distanceFromSun,0,0), planetInfo.angleXY);
            }else {
                var velocity = calculateVelocity(new THREE.Vector3(distanceFromSun, 0, 0), planetInfo.angleXY);
                var scale = planetInfo.initialVelocity/vectorModule(velocity);
                planetInfo.starterVelocity = new THREE.Vector3(velocity.x *scale, velocity.y*scale, velocity.z*scale);
            }
            var planet = new Planet(planetInfo.mass,planetInfo.radius,tempPlanet.position.x,tempPlanet.position.y,planetInfo.angleXY,planetInfo.name, false, planetInfo.starterVelocity);
            scene.add(planet.sphere);
            scene.add(planet.clickableSphere);
            scene.remove(tempPlanet);
            scene.remove(angleZYLine);
            scene.remove(angleXZLine);
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
            scene.remove(angleZYLine);
            isAdding=false;
            goToPlanet(previousCameraTarget);
        }
    };
    addPlanetGUI.add(planetInfo,'name').name('Name');
    addPlanetGUI.add(planetInfo,'mass').name('Mass (kg)');
    var radiusController = addPlanetGUI.add(planetInfo,'radius').name('Radius (Mm)');
   // var angleZYController = addPlanetGUI.add(planetInfo,'angleZY',0,90).name('AngleZY (Degrees)');
    var angleXZController = addPlanetGUI.add(planetInfo, 'angleXY',0,180).name('AngleXY (Degrees)');
    var distanceFromSunController = addPlanetGUI.add(planetInfo, 'distanceFromSun', planets[0].radius).name('Position(Mm)');
    addPlanetGUI.add(planetInfo, 'defaultVelocity').name("Auto-calculate speed");
    addPlanetGUI.add(planetInfo, 'initialVelocity').name("Speed (M/s)");
    addPlanetGUI.add(createPlanetButton,'CreatePlanet').name('Create planet');
    addPlanetGUI.add(cancelButton, 'Cancel');

    radiusController.onFinishChange(function (value) {
        var scale = value/initialRadius;
        tempPlanet.scale.set(scale,scale,scale);
    });
    /*angleZYController.onFinishChange(function (value) {
        scene.remove(angleZYLine);
        var scale = tempPlanet.position.distanceTo(camera.position)/5;
        var vector3 = new THREE.Vector3(0,0,0);
        var valueRadians = value * (Math.PI / 180);
        vector3.z = scale * Math.pow(Math.sin(valueRadians), 2);
        vector3.y = scale * Math.pow(Math.cos(valueRadians), 2);

        var material = new THREE.LineBasicMaterial({ color: 0xff0000});
        var geometry = new THREE.Geometry();
        geometry.vertices.push(new THREE.Vector3(tempPlanet.position.x,tempPlanet.position.y,tempPlanet.position.z));
        geometry.vertices.push(new THREE.Vector3(tempPlanet.position.x + vector3.x, tempPlanet.position.y + vector3.y, tempPlanet.position.z + vector3.z));
        angleZYLine = new THREE.Line(geometry, material);
        scene.add(angleZYLine);
    });*/

    angleXZController.onFinishChange(function (value) {
        scene.remove(angleXZLine);
        var scale = tempPlanet.position.distanceTo(camera.position)/5;
        var vector3 = new THREE.Vector3(0,0,0);
        var valueRadians = value * (Math.PI / 180);
        vector3.y = scale * Math.pow(Math.sin(valueRadians), 2);
        vector3.x = scale * Math.cos(valueRadians);

        var material = new THREE.LineBasicMaterial({ color: 0xff0000});
        var geometry = new THREE.Geometry();
        geometry.vertices.push(new THREE.Vector3(tempPlanet.position.x,tempPlanet.position.y,tempPlanet.position.z));
        geometry.vertices.push(new THREE.Vector3(tempPlanet.position.x + vector3.x, tempPlanet.position.y + vector3.y, tempPlanet.position.z + vector3.z));
        angleXZLine = new THREE.Line(geometry, material);
        scene.add(angleXZLine);
    });

    distanceFromSunController.onChange(function (value) {
        scene.remove(tempPlanet);
        scene.remove(angleXZLine);
        scene.remove(angleZYLine);
        tempPlanet.position.x = value;
        planetInfo.distanceFromSun = value;
        scene.add(tempPlanet);
        controls.update();
    })
}

function backAndResetGUI(){

    var Buttons = {
        goBackButton: function () {
            window.location.href = "index.html";
        },
        resetButton: function () {
            window.location.href = "Sandbox.html"
        }
    };
    mainGUI.add(Buttons, 'resetButton').name("Reset");
    mainGUI.add(Buttons, 'goBackButton').name("Menu");
}
