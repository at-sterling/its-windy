//const { FlatShading } = require("three");
//const { ajaxTransport } = require("jquery");

var Colors = {
    red: 0xf25346,
    white: 0xd8d0d1,
    brown: 0x59332e,
    pink: 0xF5986E,
    brownDark: 0x23190f,
    blue: 0x68c3c0,
};

//three.js variables
var scene, camera, fieldOfView, aspectRatio, nearPlane, farPlane, renderer, container;
//screen + mouse variables
var HEIGHT, WIDTH,
    mousePos = { x: 0, y: 0 };

function createScene() {
    //get w,h of screen and set up aspect ratio + renderer
    HEIGHT = window.innerHeight;
    WIDTH = window.innerWidth;

    //create scene
    scene = new THREE.Scene();

    //add fog using background color in CSS
    scene.fog = new THREE.Fog(0xf7d9aa, 100, 950);

    //create camera
    aspectRatio = WIDTH / HEIGHT;
    fieldOfView = 60;
    nearPlane = 1;
    farPlane = 10000;
    camera = new THREE.PerspectiveCamera(
        fieldOfView, aspectRatio, nearPlane, farPlane
    );

    //set camera position
    camera.position.x = 0;
    camera.position.z = 200;
    camera.position.y = 100;

    //create the renderer
    renderer = new THREE.WebGLRenderer({
        //allow transparency to show gradient background
        alpha: true,

        //turn on anti-aliasing
        antialias: true
    });

    //define renderer size (full screen)
    renderer.setSize(WIDTH, HEIGHT);

    //enable shadow rendering
    renderer.shadowMap.enabled = true;

    //add to the DOM
    container = document.getElementById('world');
    container.appendChild(renderer.domElement);

    //accounting for resizing
    window.addEventListener('resize', handleWindowResize, false);
}

function handleWindowResize() {
    //update w,h of camera and renderer
    HEIGHT = window.innerHeight;
    WIDTH = window.innerWidth;
    renderer.setSize(WIDTH, HEIGHT);
    camera.aspect = WIDTH / HEIGHT;
    camera.updateProjectionMatrix();
}

var hemisphereLight, shadowLight;

function createLights() {
    hemisphereLight = new THREE.HemisphereLight(0xaaaaaa, 0x000000, .9);
    shadowLight = new THREE.DirectionalLight(0xffffff, .9);
    ambientLight = new THREE.AmbientLight(0xdc8874, .5);

    //direction of the light
    shadowLight.position.set(150, 350, 350);

    //shadow casting
    shadowLight.castShadow = true;

    //define visible area of the projected shadow
    shadowLight.shadow.camera.left = -400;
    shadowLight.shadow.camera.right = 400;
    shadowLight.shadow.camera.top = 400;
    shadowLight.shadow.camera.bottom = -400;
    shadowLight.shadow.camera.near = 1;
    shadowLight.shadow.camera.far = 1000;

    //define shadow resolution (better = more expensive)
    shadowLight.shadow.mapSize.width = 2048;
    shadowLight.shadow.mapSize.height = 2048;

    //active lights by adding to the scene
    scene.add(hemisphereLight);
    scene.add(shadowLight);
    scene.add(ambientLight);
}

var Pilot = function () {
    this.mesh = new THREE.Object3D();
    this.mesh.name = "pilot";

    //angleHairs will be used to animate hair later
    this.angleHairs = 0;

    //body of the pilot
    var geomBody = new THREE.BoxGeometry(15, 15, 15);
    var matBody = new THREE.MeshPhongMaterial({
        color: Colors.brown,
        shading: THREE.FlatShading
    });
    var body = new THREE.Mesh(geomBody, matBody);
    body.position.set(2, -12, 0);
    this.mesh.add(body);

    //face of the pilot
    var geomFace = new THREE.BoxGeometry(10, 10, 10);
    var matFace = new THREE.MeshLambertMaterial({
        color: Colors.pink
    });
    var face = new THREE.Mesh(geomFace, matFace)
    this.mesh.add(face);

    //hair of the pilot
    var geomHair = new THREE.BoxGeometry(4, 4, 4);
    var matHair = new THREE.MeshLambertMaterial({ color: Colors.brown });
    var hair = new THREE.Mesh(geomHair, matHair);
    //align the hair to the bottom boundary for scaling ease
    hair.geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0, 2, 0));
    //container for hair
    var hairs = new THREE.Object3D();

    //create container for the animated hairs
    this.hairsTop = new THREE.Object3D();
    //create hairs at top of head and position them in a 3x4 grid
    for (var i = 0; i < 12; i++) {
        var h = hair.clone();
        var col = i % 3;
        var row = Math.floor(i / 3);
        var startPosZ = -4;
        var startPosX = -4;
        h.position.set(startPosX + row * 4, 0, startPosZ + col * 4);
        this.hairsTop.add(h);
    }
    hairs.add(this.hairsTop);

    //create hairs on side of face
    var geomHairSide = new THREE.BoxGeometry(12, 4, 2);
    geomHairSide.applyMatrix(new THREE.Matrix4().makeTranslation(-6, 0, 0));
    var hairSideR = new THREE.Mesh(geomHairSide, matHair);
    var hairSideL = hairSideR.clone();
    hairSideR.position.set(8, -2, 6);
    hairSideL.position.set(8, -2, -6);
    hairs.add(hairSideR);
    hairs.add(hairSideL);

    //create hairs on back of the head
    var geomHairBack = new THREE.BoxGeometry(2, 8, 10);
    var hairBack = new THREE.Mesh(geomHairBack, matHair);
    hairBack.position.set(-1, -4, 0);
    hairs.add(hairBack);
    hairs.position.set(-5, 5, 0);

    this.mesh.add(hairs);

    //create glass
    var geomGlass = new THREE.BoxGeometry(5, 5, 5);
    var matGlass = new THREE.MeshLambertMaterial({ color: Colors.brown })
    var glassR = new THREE.Mesh(geomGlass, matGlass);
    glassR.position.set(6, 0, 3);
    var glassL = glassR.clone();
    glassL.position.z = -glassR.position.z;

    var geomGlassA = new THREE.BoxGeometry(11, 1, 11);
    var glassA = new THREE.Mesh(geomGlassA, matGlass);
    this.mesh.add(glassR);
    this.mesh.add(glassL);
    this.mesh.add(glassA);

    //create ear
    var geomEar = new THREE.BoxGeometry(2, 3, 2);
    var earL = new THREE.Mesh(geomEar, matFace);
    earL.position.set(0, 0, -6);
    var earR = earL.clone();
    earR.position.set(0, 0, 6);
    this.mesh.add(earL);
    this.mesh.add(earR);
}

//move the hair
Pilot.prototype.updateHairs = function () {
    //get hair
    var hairs = this.hairsTop.children;

    //update them according to angle AngleHairs
    var l = hairs.length;
    for (var i = 0; i < l; i++) {
        var h = hairs[i];
        //each hair will scale on a cyclical basis between 75% and 100% of its orginal side
        h.scale.y = .75 + Math.cos(this.angleHairs + i / 3) * .25;
    }
    // increment the angle for the next frame
    this.angleHairs += 0.16;
}

Sea = function () {
    //create the geometry of the cylinder
    //parameters: radius top, radius bottom, height, # of segments on the radius, # of segments vertically
    var geom = new THREE.CylinderGeometry(600, 600, 800, 40, 10);
    console.log(geom.isBufferGeometry);
    //rotate the geometry on the x axis
    geom.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI / 2));

    //create the material
    var mat = new THREE.MeshPhongMaterial({
        color: Colors.blue,
        transparent: true,
        opacity: 0.8,
        shading: THREE.FlatShading,
    });

    //to create an object in Three.js, create a mesh (combo of geo + material)
    this.mesh = new THREE.Mesh(geom, mat);

    //allow the sea to receive shadows
    this.mesh.receiveShadow = true;
}

//instantiate the sea and add to scene
var sea;

function createSea() {
    sea = new Sea();

    //position to bottom of the scene
    sea.mesh.position.y = -600;

    //add mesh of the sea to the scene
    scene.add(sea.mesh);
}

Cloud = function () {
    //create an empty container to hold the different parts of the cloud
    this.mesh = new THREE.Object3D();

    //create a cube geometry (will be duplicated to create the cloud)
    var geom = new THREE.BoxGeometry(20, 20, 20);

    //create the material
    var mat = new THREE.MeshPhongMaterial({
        color: Colors.white,
    });

    //duplicate the geom a random amount of times
    var nBlocs = 3 + Math.floor(Math.random() * 3);
    for (var i = 0; i < nBlocs; i++) {
        //create the new mesh by cloning the geometry
        var m = new THREE.Mesh(geom.clone(), mat);

        // set the position and the rotation of each cube randomly
        m.position.x = i * 15;
        m.position.y = Math.random() * 10;
        m.position.z = Math.random() * 10;
        m.rotation.z = Math.random() * Math.PI * 2;
        m.rotation.y = Math.random() * Math.PI * 2;

        // set the size of the cube randomly
        var s = .1 + Math.random() * .9;
        m.scale.set(s, s, s);

        // allow each cube to cast and to receive shadows
        m.castShadow = true;
        m.receiveShadow = true;

        // add the cube to the container we first created
        this.mesh.add(m);
    }
}

//defining a Sky object
Sky = function () {
    //create empty container
    this.mesh = new THREE.Object3D();

    //choose a # of clouds to be scattered in the sky
    this.nClouds = 20;
    this.clouds = [];

    //for cloud distribution consistently, plaec them at a uniform angle
    var stepAngle = Math.PI * 2 / this.nClouds;

    //create Clouds
    for (var i = 0; i < this.nClouds; i++) {
        var c = new Cloud();
        this.clouds.push(c);
        //set the rotatopn and position of each cloud
        //trig!
        var a = stepAngle * i;    //final angle of the cloud
        var h = 750 + Math.random() * 200;    //distance between the center of the axis and the cloud itself

        //convert polar coords (angle, distance) into Cartesian coords (x, y)
        c.mesh.position.y = Math.sin(a) * h;
        c.mesh.position.x = Math.cos(a) * h;
        //position clouds at random depths
        c.mesh.position.z = -400 - Math.random() * 400;
        //rotate cloud according to its position
        c.mesh.rotation.z = a + Math.PI / 2;

        //set a random scale for each cloud
        var s = 1 + Math.random() * 2;
        c.mesh.scale.set(s, s, s);

        //add the mesh of each cloud into the scene
        this.mesh.add(c.mesh);
    }
}

//instantiate the sky and position it
var sky;

function createSky() {
    sky = new Sky();
    sky.mesh.position.y = -600;
    scene.add(sky.mesh);
}

//creating the AirPlane object
var AirPlane = function () {
    this.mesh = new THREE.Object3D();
    this.mesh.name = "airPlane";

    // Cockpit
    var geomCockpit = new THREE.BoxGeometry(80, 50, 50, 1, 1, 1);
    var matCockpit = new THREE.MeshPhongMaterial({ color: Colors.red, shading: THREE.FlatShading });

    var cockpit = new THREE.Mesh(geomCockpit, matCockpit);
    cockpit.castShadow = true;
    cockpit.receiveShadow = true;
    this.mesh.add(cockpit);

    // Engine

    var geomEngine = new THREE.BoxGeometry(20, 50, 50, 1, 1, 1);
    var matEngine = new THREE.MeshPhongMaterial({ color: Colors.white, shading: THREE.FlatShading });
    var engine = new THREE.Mesh(geomEngine, matEngine);
    engine.position.x = 50;
    engine.castShadow = true;
    engine.receiveShadow = true;
    this.mesh.add(engine);

    // Tail Plane

    var geomTailPlane = new THREE.BoxGeometry(15, 20, 5, 1, 1, 1);
    var matTailPlane = new THREE.MeshPhongMaterial({ color: Colors.red, shading: THREE.FlatShading });
    var tailPlane = new THREE.Mesh(geomTailPlane, matTailPlane);
    tailPlane.position.set(-40, 20, 0);
    tailPlane.castShadow = true;
    tailPlane.receiveShadow = true;
    this.mesh.add(tailPlane);

    // Wings

    var geomSideWing = new THREE.BoxGeometry(30, 5, 120, 1, 1, 1);
    var matSideWing = new THREE.MeshPhongMaterial({ color: Colors.red, shading: THREE.FlatShading });
    var sideWing = new THREE.Mesh(geomSideWing, matSideWing);
    sideWing.position.set(0, 15, 0);
    sideWing.castShadow = true;
    sideWing.receiveShadow = true;
    this.mesh.add(sideWing);

    var geomWindshield = new THREE.BoxGeometry(3, 15, 20, 1, 1, 1);
    var matWindshield = new THREE.MeshPhongMaterial({ color: Colors.white, transparent: true, opacity: .3, shading: THREE.FlatShading });;
    var windshield = new THREE.Mesh(geomWindshield, matWindshield);
    windshield.position.set(5, 27, 0);

    windshield.castShadow = true;
    windshield.receiveShadow = true;

    this.mesh.add(windshield);

    var geomPropeller = new THREE.BoxGeometry(20, 10, 10, 1, 1, 1);
    var matPropeller = new THREE.MeshPhongMaterial({ color: Colors.brown, shading: THREE.FlatShading });
    this.propeller = new THREE.Mesh(geomPropeller, matPropeller);

    this.propeller.castShadow = true;
    this.propeller.receiveShadow = true;

    var geomBlade = new THREE.BoxGeometry(1, 80, 10, 1, 1, 1);
    var matBlade = new THREE.MeshPhongMaterial({ color: Colors.brownDark, shading: THREE.FlatShading });
    var blade1 = new THREE.Mesh(geomBlade, matBlade);
    blade1.position.set(8, 0, 0);

    blade1.castShadow = true;
    blade1.receiveShadow = true;

    var blade2 = blade1.clone();
    blade2.rotation.x = Math.PI / 2;

    blade2.castShadow = true;
    blade2.receiveShadow = true;

    this.propeller.add(blade1);
    this.propeller.add(blade2);
    this.propeller.position.set(60, 0, 0);
    this.mesh.add(this.propeller);

    var wheelProtecGeom = new THREE.BoxGeometry(30, 15, 10, 1, 1, 1);
    var wheelProtecMat = new THREE.MeshPhongMaterial({ color: Colors.red, shading: THREE.FlatShading });
    var wheelProtecR = new THREE.Mesh(wheelProtecGeom, wheelProtecMat);
    wheelProtecR.position.set(25, -20, 25);
    this.mesh.add(wheelProtecR);

    var wheelTireGeom = new THREE.BoxGeometry(24, 24, 4);
    var wheelTireMat = new THREE.MeshPhongMaterial({ color: Colors.brownDark, shading: THREE.FlatShading });
    var wheelTireR = new THREE.Mesh(wheelTireGeom, wheelTireMat);
    wheelTireR.position.set(25, -28, 25);

    var wheelAxisGeom = new THREE.BoxGeometry(10, 10, 6);
    var wheelAxisMat = new THREE.MeshPhongMaterial({ color: Colors.brown, shading: THREE.FlatShading });
    var wheelAxis = new THREE.Mesh(wheelAxisGeom, wheelAxisMat);
    wheelTireR.add(wheelAxis);

    this.mesh.add(wheelTireR);

    var wheelProtecL = wheelProtecR.clone();
    wheelProtecL.position.z = -wheelProtecR.position.z;
    this.mesh.add(wheelProtecL);

    var wheelTireL = wheelTireR.clone();
    wheelTireL.position.z = -wheelTireR.position.z;
    this.mesh.add(wheelTireL);

    var wheelTireB = wheelTireR.clone();
    wheelTireB.scale.set(.5, .5, .5);
    wheelTireB.position.set(-35, -5, 0);
    this.mesh.add(wheelTireB);

    var suspensionGeom = new THREE.BoxGeometry(4, 20, 4);
    suspensionGeom.applyMatrix(new THREE.Matrix4().makeTranslation(0, 10, 0))
    var suspensionMat = new THREE.MeshPhongMaterial({ color: Colors.red, shading: THREE.FlatShading });
    var suspension = new THREE.Mesh(suspensionGeom, suspensionMat);
    suspension.position.set(-35, -5, 0);
    suspension.rotation.z = -.3;
    this.mesh.add(suspension);

    this.pilot = new Pilot();
    this.pilot.mesh.position.set(-10, 27, 0);
    this.mesh.add(this.pilot.mesh);

    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;

};

//instantiate airplane and add to scene
var airplane;

function createPlane() {
    airplane = new AirPlane();
    airplane.mesh.scale.set(.25, .25, .25);
    airplane.mesh.position.y = 100;
    scene.add(airplane.mesh);
}

function loop() {
    //update the plane on each frame and render scene
    updatePlane();
    //rotate sea and sky
    sea.mesh.rotation.z += 0.005;
    sky.mesh.rotation.z += 0.01;
    airplane.pilot.updateHairs();
    updateCameraFOV();

    renderer.render(scene, camera);
    //call loop again
    requestAnimationFrame(loop);
}

function updatePlane() {
    //we're moving the plane -100 to 100 on the horizontal axis
    //and 25 to 175 on the vertical axis, depending on the mouse pos
    //which varies from -1 to 1 on both axes. we use a normalize func to do this
    var targetY = normalize(mousePos.y, -.75, .75, 25, 175);
    var targetX = normalize(mousePos.x, -.75, .75, -100, 100);

    //move the plane at each frame by adding a fraction of the remaining distance
    airplane.mesh.position.y += (targetY - airplane.mesh.position.y) * 0.1;
    // Rotate the plane proportionally to the remaining distance
    airplane.mesh.rotation.z = (targetY - airplane.mesh.position.y) * 0.0128;
    airplane.mesh.rotation.x = (airplane.mesh.position.y - targetY) * 0.0064;

    airplane.propeller.rotation.x += 0.3;
}

function updateCameraFOV() {
    camera.fov = normalize(mousePos.x, -1, 1, 40, 80);
    camera.updateProjectionMatrix();
}

function normalize(v, vmin, vmax, tmin, tmax) {
    var nv = Math.max(Math.min(v, vmax), vmin);
    var dv = vmax - vmin;
    var pc = (nv - vmin) / dv;
    var dt = tmax - tmin;
    var tv = tmin + (pc * dt);
    return tv;
}

var mousePos = { x: 0, y: 0 };

function handleMouseMove(event) {
    //we convert the mouse position value toa normalizaed value from
    //-1 to 1. this is the formula for the horizontal axis
    var tx = -1 + (event.clientX / WIDTH) * 2;

    //we inverse the formula for the vertical axis
    //since the 2D vertical y-axis goes in the opposite direction of the 3D y-axis
    var ty = 1 - (event.clientY / HEIGHT) * 2;
    mousePos = { x: tx, y: ty };
}










function init() {
    //set up scene, camera, and renderer
    createScene();
    //add lighting
    createLights();
    //add objects
    createPlane();
    createSea();
    createSky();

    //add listener
    document.addEventListener('mousemove', handleMouseMove, false);

    //loop will update positions and render each frame
    loop();
}

window.addEventListener('load', init, false);
