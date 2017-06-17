/**
 * Created by Ignacio on 16/6/2017.
 */
function Planet(mass, radius, xPosition, yPosition){
    this.mass=mass;
    this.radius=radius;
    var geometry = new THREE.SphereGeometry(radius,10,10);
    var material = new THREE.MeshLambertMaterial( {
        color: 0x00ff00} );
    this.sphere = new THREE.Mesh( geometry, material );
    this.sphere.castShadow=true;
    this.sphere.receiveShadow=true;
    this.sphere.position.set(xPosition,yPosition,-500);
}

