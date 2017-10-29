function Planet(mass, radius, xPosition, yPosition, angleXY, name, isSun, color, velocity){ //, color
    this.mass=mass;
    this.radius=radius;
    this.name = name;
    var geometry = new THREE.SphereGeometry(radius,100,100);


    if (color === undefined){
        color = Math.random() * 0xffffff;
        this.colorTrack  =  Math.random() * 0xffffff;
    }else{
        this.colorTrack = color;
    }

    var material = new THREE.MeshLambertMaterial( {
        color: color} );

    this.sphere = new THREE.Mesh( geometry, material );

    this.sphere.castShadow=true;
    this.sphere.receiveShadow=true;
    this.sphere.position.set(xPosition,yPosition,-500);

    var clickableMaterial = new THREE.MeshBasicMaterial({color: 0xff0000});
    clickableMaterial.visible=false;
    this.clickableSphere = new THREE.Mesh(geometry,clickableMaterial);
    this.clickableSphere.position.set(xPosition,yPosition,-500);
    spheresIntersection.push(this.clickableSphere);

    this.applyGravity = applyGravity;
    this.applyGravityOfOnePlanet = applyGravityOfOnePlanet;
    this.calculateDirection = calculateDirection;
    this.calculateDistance = calculateDistance;


    this.materialTrack = new THREE.LineBasicMaterial({ color: this.colorTrack });
    this.vertices = [];
    this.line = new THREE.Line();
    this.tracks = new THREE.Line();
    this.eraseTrack = eraseTrack;

    this.destroy = destroy;
    this.update = update;

    this.targetOfCamera = targetOfCamera;
    this.looseCamera = looseCamera;
    this.hasCamera = false;

    this.isSun=isSun;
    this.sphereScale=1;

    this.velocityConstant = velocityConstant;

    this.G = G;

    //this.gSeconds = 6.67408e-29;
    //this.gMinutes = 2.4026688e-25;
    //this.gHour = 8.64960768e-22;
    //this.gDays = 4.982174024e-19;

    var newVelocity = new THREE.Vector3(0,0,0);
    if(!this.isSun && velocity === undefined){
        newVelocity = calculateVelocity(this.sphere.position, angleXY);
    }else if(!this.isSun){
        newVelocity = velocity;
    }

    this.velocity = [newVelocity.x, newVelocity.y, newVelocity.z];
    this.changingVelocity = false;
    this.openGUI = openGui;
    this.closeGUI = closeGUI;
    this.radiusGUI=radius;
    this.infoPlanetGUI = null;
    this.guiOpen = false;
    this.planetModificationGUI=null;

    //circle around the planet
    this.circle = createCircleAroundPlanet();
}

function update() {
    if (!this.isSun) {
        //moves the planet
        this.sphere.position.x += this.velocity[0];
        this.sphere.position.y += this.velocity[1];
        this.sphere.position.z += this.velocity[2];
        this.clickableSphere.position.set(this.sphere.position.x, this.sphere.position.y, this.sphere.position.z);

        //creates track
        this.currentFrame++;
        if(trackActivated) {
            var geometryTrack = new THREE.Geometry();
            this.vertices.push(new THREE.Vector3(this.sphere.position.x,this.sphere.position.y,this.sphere.position.z));
            while(this.vertices.length>trackLength){
                this.vertices.splice(0, 1);
            }
            geometryTrack.vertices = this.vertices;
            scene.remove(this.track);
            this.track = new THREE.Line(geometryTrack, this.materialTrack);
            scene.add(this.track);
        }

        //if it has the camera, it moves it.
        if (this.hasCamera) {
            camera.position.x += this.velocity[0];
            camera.position.y += this.velocity[1];
            camera.position.z += this.velocity[2];

            //Circle around the planet, only when it has the camera
            var circleScale = this.sphere.position.distanceTo(camera.position)/20;
            this.circle.scale.set(circleScale, circleScale, circleScale);
            this.circle.position.set(this.sphere.position.x, this.sphere.position.y, this.sphere.position.z);
        }
    }else{
        this.sphere.position.x = 0;
        this.sphere.position.y = 0;
        this.velocity = [0, 0, 0];
    }

    //update the size of the clickable sphere
    var scale = this.clickableSphere.position.distanceTo(camera.position)/100;
    scale = Math.max(1, scale);
    this.clickableSphere.scale.set(scale,scale,scale);

    //update the info of the gui
    //Move to openGUI
    if(this.guiOpen){
        this.name=this.planetModificationGUI.planetName;
        this.sphereScale = this.planetModificationGUI.planetRadius/this.radiusGUI;
        this.sphere.scale.x = this.sphere.scale.y = this.sphere.scale.z = this.sphereScale;
        var tempRadius = parseFloat(this.planetModificationGUI.planetRadius);
        var tempMass = parseFloat(this.planetModificationGUI.planetMass);

        if(!this.changingVelocity){
            this.planetModificationGUI.planetSpeed = (vectorModule(new THREE.Vector3(this.velocity[0], this.velocity[1], this.velocity[2]))/this.velocityConstant).toFixed(3);
            this.infoPlanetGUI.updateDisplay();
        }

        if(!isNaN(tempRadius) && tempRadius>0){
            this.radius = tempRadius;
        }else{
            this.planetModificationGUI.planetRadius = this.radius;
            this.infoPlanetGUI.updateDisplay();
        }
        if(!isNaN(tempMass) && tempMass>0) {
            this.mass = tempMass;
        }else{
            this.planetModificationGUI.planetMass = this.mass;
            this.infoPlanetGUI.updateDisplay();
        }
    }
}

function openGui(){
    var planet = this;
    var planetModificationGUI = new function () {
        this.planetMass = planet.mass.toString();
        this.planetRadius = planet.radius.toString();
        this.planetName = planet.name;
        this.planetSpeed = vectorModule(planet.velocity).toString();
    };
    var destroyButton = {
        Destroy: function () {
            this.destroy();
            refreshPlanetListGUI();
        }
    };
    this.planetModificationGUI=planetModificationGUI;
    this.infoPlanetGUI = new dat.GUI();
    var nameController = this.infoPlanetGUI.add(this.planetModificationGUI,'planetName').name('Name');
    this.infoPlanetGUI.add(this.planetModificationGUI, 'planetMass' , 1 ).name('Mass (kg)');
    this.infoPlanetGUI.add(this.planetModificationGUI, 'planetRadius' , 1) .name('Radius (Mm)');
    var speedController = this.infoPlanetGUI.add(this.planetModificationGUI, 'planetSpeed', 0.000001).name('Speed (M/s)');
    this.infoPlanetGUI.add({Destroy: destroyButton.Destroy.bind(this)},'Destroy');
    this.guiOpen=true;
    nameController.onFinishChange(function(value) {
        refreshPlanetListGUI();
    });

    speedController.onFinishChange(function (value) {
        planet.changingVelocity = true;
    });

    speedController.onChange(function (value) {
        var tempValue = parseFloat(value).toFixed(3);
        if(!isNaN(tempValue) && tempValue>0){
            console.log("On change: " + value);
            var currentSpeed = vectorModule(new THREE.Vector3(planet.velocity[0], planet.velocity[1], planet.velocity[2]));
            planet.velocity[0] = planet.velocity[0] * (value/currentSpeed);
            planet.velocity[1] = planet.velocity[1] * (value/currentSpeed);
            planet.velocity[2] = planet.velocity[2] * (value/currentSpeed);
        }

    })

}

function closeGUI(){
    if(this.guiOpen) {
        //this.infoPlanetGUI.hide=true;
        this.infoPlanetGUI.destroy();
        this.guiOpen = false;
        this.changingVelocity = false;
    }
}

function eraseTrack(){
    this.vertices = [];
    scene.remove(this.track);
}

function applyGravity(planets, index){
    for(var i=0;i<planets.length;i++){
        if(index!==i){
            this.applyGravityOfOnePlanet(planets[i]);
        }
    }
}

function applyGravityOfOnePlanet(planet){
    var gravity = [];
    var direction = this.calculateDirection(planet);
    var number = -this.G*(this.mass * planet.mass)/Math.pow(this.calculateDistance(this.sphere.position, planet.sphere.position), 2); //[G]=((Mm)^3)/(kg*s^2)
    gravity[0] = number * direction[0]/this.mass;
    gravity[1] = number * direction[1]/this.mass;
    gravity[2] = number * direction[2]/this.mass;
    this.velocity[0] += gravity[0]; //there's probably a better way of doing this
    this.velocity[1] += gravity[1];
    this.velocity[2] += gravity[2];
}

function calculateDirection(planet){
    var direction=[];
    var distance = this.calculateDistance(this.sphere.position, planet.sphere.position);
    direction[0] = (this.sphere.position.x - planet.sphere.position.x)/distance; //normalized
    direction[1] = (this.sphere.position.y - planet.sphere.position.y)/distance; //normalized
    direction[2] = (this.sphere.position.z - planet.sphere.position.z)/distance; //normalized
    return direction;
}

function calculateDistance(position1, position2){
    var distance = 0;
    distance += Math.pow(position1.x - position2.x, 2);
    distance += Math.pow(position1.y - position2.y, 2);
    distance += Math.pow(position1.z - position2.z, 2);
    distance = Math.sqrt(distance);
    return distance;
}

function destroy(){
    scene.remove(this.sphere);
    scene.remove(this.circle);
    for(var i=0;i<planets.length;i++){
        if(planets[i]===this){
            planets.splice(i,1);
            this.eraseTrack();
            this.closeGUI();
            return;
        }
    }
}

function targetOfCamera(){
    this.hasCamera = true;
    this.openGUI();
    scene.add(this.circle);
}

function looseCamera(){
    this.closeGUI();
    scene.remove(this.circle);
}


function createCircleAroundPlanet(){
    var spriteMap = new THREE.TextureLoader().load( 'images/Ring.png' );
    var material = new THREE.SpriteMaterial( { map: spriteMap, color: 0xffffff } );
    return new THREE.Sprite( material );
}
