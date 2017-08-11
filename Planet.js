function Planet(mass, radius, xPosition, yPosition, angle, name){
    this.mass=mass;
    this.radius=radius;
    this.name = name;
    var geometry = new THREE.SphereGeometry(radius,100,100);
    var material = new THREE.MeshLambertMaterial( {
        color: 0x117ab3} );
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
    this.eraseTrack = eraseTrack;
    this.destroy = destroy;
    this.update = update;
    this.hasCamera = false;
    this.tracks = [];
    this.colorTrack  =  Math.random() * 0xffffff;
    var totalVelocity = 2.5; //we have to tweak this values
    var zVelocity = totalVelocity * (angle/90);
    var yVelocity = totalVelocity-zVelocity;
    this.velocity = [0, yVelocity, zVelocity];
    this.openGUI = openGui;
    this.closeGUI = closeGUI;
    this.radiusGUI=radius;
    this.infoPlanetGUI = null;
    this.guiOpen = false;
    this.planetModificationGUI=null;
    this.isSun=false;
    this.sphereScale=1;
}

function update() {
    if (!this.isSun) {
        //if it has the camera, it moves it.
        if (this.hasCamera) {
            camera.position.x += this.velocity[0];
            camera.position.y += this.velocity[1];
            camera.position.z += this.velocity[2];
        }

        //creates track
        if(trackActivated) {
            var material = new THREE.LineBasicMaterial({ color: this.colorTrack });
            var geometry = new THREE.Geometry();
            geometry.vertices.push(new THREE.Vector3(this.sphere.position.x,this.sphere.position.y,this.sphere.position.z));
            geometry.vertices.push(new THREE.Vector3(this.sphere.position.x+1,this.sphere.position.y+1,this.sphere.position.z+1));
            var track = new THREE.Line(geometry, material);
            scene.add(track);
            this.tracks[this.tracks.length] = track;
            while(this.tracks.length>trackLength){
                scene.remove(this.tracks[0]);
                this.tracks.splice(0, 1);
            }
        }

        //moves the planet
        this.sphere.position.x += this.velocity[0];
        this.sphere.position.y += this.velocity[1];
        this.sphere.position.z += this.velocity[2];
        this.clickableSphere.position.set(this.sphere.position.x, this.sphere.position.y, this.sphere.position.z);
    }else{
        this.sphere.position.x = 0;
        this.sphere.position.y = 0;
        this.velocity = [0, 0, 0];
    }

    //update the size of the clickable sphere
    var scale = this.clickableSphere.position.distanceTo(camera.position)/1000 + this.radius/100 ;
    scale = Math.max(1, scale);
    this.clickableSphere.scale.set(scale,scale,scale);

    //update the info of the gui
    //Move to openGUI
    if(this.guiOpen){
        this.mass=this.planetModificationGUI.planetMass;
        this.sphereScale = this.planetModificationGUI.planetRadius/this.radiusGUI;
        this.sphere.scale.x = this.sphere.scale.y = this.sphere.scale.z = this.sphereScale;
        this.radius = this.planetModificationGUI.planetRadius;
        this.name = this.planetModificationGUI.planetName;
    }
}

function openGui(){
    var planet = this;
    var planetModificationGUI = new function () {
        this.planetMass = planet.mass;
        this.planetRadius = planet.radius;
        this.planetName = planet.name;
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
    this.infoPlanetGUI.add(this.planetModificationGUI, 'planetMass' , 1 ).name('Mass');
    this.infoPlanetGUI.add(this.planetModificationGUI, 'planetRadius' , 1) .name('Radius');
    this.infoPlanetGUI.add({Destroy: destroyButton.Destroy.bind(this)},'Destroy');
    this.guiOpen=true;
    nameController.onFinishChange(function(value) {
        refreshPlanetListGUI();
    });
}

function closeGUI(){
    if(this.guiOpen) {
        //this.infoPlanetGUI.hide=true;
        this.infoPlanetGUI.destroy();
        this.guiOpen = false;
    }
}

function eraseTrack(){
    for(var i=0;i<this.tracks.length;i++){
        scene.remove(this.tracks[i]);
    }
    this.tracks = [];
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
    var number = -(this.mass * planet.mass)/Math.pow(this.calculateDistance(planet), 2); //needs to be multiplied by G
    gravity[0] = number * direction[0];
    gravity[1] = number * direction[1];
    gravity[2] = number * direction[2];
    this.velocity[0] += gravity[0]; //there's probably a better way of doing this
    this.velocity[1] += gravity[1];
    this.velocity[2] += gravity[2];
}

function calculateDirection(planet){
    var direction=[];
    var distance = this.calculateDistance(planet);
    direction[0] = (this.sphere.position.x - planet.sphere.position.x)/distance; //normalized
    direction[1] = (this.sphere.position.y - planet.sphere.position.y)/distance; //normalized
    direction[2] = (this.sphere.position.z - planet.sphere.position.z)/distance; //normalized
    return direction;
}

function calculateDistance(planet){
    var distance = 0;
    distance += Math.pow(this.sphere.position.x - planet.sphere.position.x, 2);
    distance += Math.pow(this.sphere.position.y - planet.sphere.position.y, 2);
    distance += Math.pow(this.sphere.position.z - planet.sphere.position.z, 2);
    distance = Math.sqrt(distance);
    return distance;
}

function destroy(){
    scene.remove(this.sphere);
    for(var i=0;i<planets.length;i++){
        if(planets[i]===this){
            planets.splice(i,1);
            this.eraseTrack();
            this.closeGUI();
            return;
        }
    }
}
