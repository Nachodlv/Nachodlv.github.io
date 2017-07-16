/**
 * Created by Ignacio on 16/6/2017.
 */
function Planet(mass, radius, xPosition, yPosition, angle){
    this.mass=mass;
    this.radius=radius;
    var geometry = new THREE.SphereGeometry(radius,100,100);
    var material = new THREE.MeshLambertMaterial( {
        color: 0x117ab3} );
    this.sphere = new THREE.Mesh( geometry, material );
    this.sphere.castShadow=true;
    this.sphere.receiveShadow=true;
    this.sphere.position.set(xPosition,yPosition,-500);
    this.applyGravity = applyGravity;
    this.applyGravityOfOnePlanet = applyGravityOfOnePlanet;
    this.calculateDirection = calculateDirection;
    this.calculateDistance = calculateDistance;
    this.update = update;
    this.camera = null;
    this.hasCamera = false;
    this.setCameraTarget = setCameraTarget;
    this.tracks = [];
    this.colorTrack  =  Math.random() * 0xffffff;
    this.trackLength = 1500; //we have to tweak this values
    var totalVelocity = 2.5; //we have to tweak this values
    var zVelocity = totalVelocity * (angle/90);
    var yVelocity = totalVelocity-zVelocity;
    this.velocity = [0, yVelocity, zVelocity];
}

function update(velocity){
    if(this.hasCamera){
        this.camera.position.x += this.velocity[0];
        this.camera.position.y += this.velocity[1];
        this.camera.position.z += this.velocity[2];
    }

    //creates track
    var track = new THREE.Mesh(new THREE.BoxGeometry(2,2,2),new THREE.MeshBasicMaterial({color: this.colorTrack}));
    track.position.x = this.sphere.position.x;
    track.position.y = this.sphere.position.y;
    track.position.z = this.sphere.position.z;
    scene.add(track);
    this.tracks[this.tracks.length]=track;
    if(this.tracks.length>this.trackLength){
        scene.remove(this.tracks[0]);
        this.tracks.splice(0,1);
    }


    this.sphere.position.x += this.velocity[0];
    this.sphere.position.y += this.velocity[1];
    this.sphere.position.z += this.velocity[2];

}

function setCameraTarget(camera){
    this.hasCamera=true;
    this.camera=camera;
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
