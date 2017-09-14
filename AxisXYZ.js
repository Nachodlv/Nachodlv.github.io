var axisCamera;
var axisRenderer;
var axisScene;
var axisContainer;

function AxesXYZ() {
    axisContainer = document.getElementById('axisBox');

    axisRenderer = new THREE.WebGLRenderer();
    axisRenderer.setSize( 200, 200 );
    axisRenderer.alpha = true;
    axisContainer.appendChild( axisRenderer.domElement );

    axisScene = new THREE.Scene();

    axisCamera = new THREE.PerspectiveCamera( 50, 1, 1, 1000000 );
    axisCamera.up = camera.up; // important!

    this.axis = new THREE.AxisHelper( 100 );
    axisScene.add( this.axis );

    this.updateAxis = updateAxis;
}


function updateAxis(){
    axisCamera.position.copy( camera.position );
    axisCamera.position.sub( controls.target );
    axisCamera.position.setLength( 300 );

    axisCamera.lookAt( axisScene.position );
}



