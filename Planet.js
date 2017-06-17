/**
 * Created by Ignacio on 16/6/2017.
 */
function Planet(mass, radius, xPostion, yPosition){
    this.m
}
function newPlanet(xPosition,yPosition, radius){
    var geometry = new THREE.SphereGeometry(radius,10,10);
    var material = new THREE.MeshLambertMaterial( {
        color: 0x00ff00} );
    var sphere = new THREE.Mesh( geometry, material );
    sphere.position.set(xPosition,yPosition,-500);
    sphere.castShadow=true;
    sphere.receiveShadow=true;
    return sphere;
}
