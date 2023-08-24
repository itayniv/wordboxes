import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js'
import * as TWEEN from '@tweenjs/tween.js'
import * as dat from 'lil-gui'
import * as Matter from 'matter-js'
import * as _ from 'lodash'

THREE.ColorManagement.enabled = false

// /**
//  * Base
//  */
// // Debug
// const gui = new dat.GUI()


const pointer = new THREE.Vector2();

let raycaster = new THREE.Raycaster();
let INTERSECTED;

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader()
const matcapTexture = textureLoader.load('textures/matcaps/8.png')

/**
 * Fonts
 */
const fontLoader = new FontLoader()

const numberOfLetters = 4;
let letterBoxes = [];
let matterBoxes = [];
let box;

const engine = Matter.Engine.create();
const world = engine.world;

const boxSize = 200;
const matterBox = Matter.Bodies.rectangle(0, 0, boxSize, boxSize);

_.times(numberOfLetters, (i) => { })


Matter.World.add(world, matterBox);




fontLoader.load(
    '/fonts/helvetiker_regular.typeface.json',
    (font) => {
        // Material
        const material = new THREE.MeshMatcapMaterial({ matcap: matcapTexture })

        // Text
        const textGeometry = new TextGeometry(
            'Hello Three.js',
            {
                font: font,
                size: 0.5,
                height: 0.2,
                curveSegments: 12,
                bevelEnabled: true,
                bevelThickness: 0.03,
                bevelSize: 0.02,
                bevelOffset: 0,
                bevelSegments: 5
            }
        )

        document.addEventListener('mousemove', onPointerMove);

        textGeometry.center()
        _.times(numberOfLetters, (i) => {
            let box = createBox(.4, .4, .4, 'lightblue')
            box.position.set(i * .45, 0, 0)
            box.userData.id = `letterNo_${i}`;
            scene.add(box);
            letterBoxes.push(box);
        })
        // box = createBox(1, 1, 1, 'lightblue')
        // scene.add(box);
        createLights().forEach(light => scene.add(light))

        // const text = new THREE.Mesh(textGeometry, material)
        // scene.add(text)


    }
)


const createBox = (width, height, depth, color) => {
    const geometry = new THREE.BoxGeometry(width, height, depth)
    // ctreate a MeshStandardMaterial 
    const material = new THREE.MeshStandardMaterial({ color: color })
    const mesh = new THREE.Mesh(geometry, material)
    return mesh
}



const createLights = () => {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5)
    directionalLight.position.set(4, 2, 2)
    return [ambientLight, directionalLight]
}


/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}



window.addEventListener('resize', () => {
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(55, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 0
camera.position.y = 0
camera.position.z = 4
scene.add(camera)


/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.outputColorSpace = THREE.LinearSRGBColorSpace
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))



const rotateBox = (direction, speed) => {

    const dir = (direction == "up" ? - 1 : 1)

    const letter = _.find(letterBoxes, (box) => {

        return box.userData.id == INTERSECTED.userData.id
    });

    // Define the target rotation (90 degrees in radians)
    const targetRotation = letter.rotation.x + Math.PI / 2 * dir;

    applyForce(dir);
    // Define the duration of the animation in milliseconds
    const animationDuration = 200; // 1 second


    console.log(letter)

    // Create a Tween for the rotation
    const rotationTween = new TWEEN.Tween(letter.rotation)
        .to({ x: targetRotation }, animationDuration)
        .easing(TWEEN.Easing.Quadratic.Out) // You can choose a different easing function
        .start();


}



const applyForce = (direction, speed) => {

    const forceMagnitude = 0.01; // Adjust the force magnitude as needed
    const forceX = 0.0001; // Adjust the force direction and values as needed
    const forceY = -direction * 0.015;

    Matter.Body.applyForce(matterBox, { x: matterBox.position.x, y: matterBox.position.y }, { x: forceX, y: forceY });
}



const constraint = Matter.Constraint.create({
    bodyA: matterBox,
    pointA: { x: 0, y: 0 },
    bodyB: null, // You can define another Matter.js body or use `null` for a fixed point
    pointB: { x: 0, y: 0 },
    length: 0,   // Constraint length, change as needed
    stiffness: 0.03 // Constraint stiffness, change as needed
});

Matter.World.add(world, constraint);


const onPointerMove = (event) => {

    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = - (event.clientY / window.innerHeight) * 2 + 1;

}

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () => {
    const elapsedTime = clock.getElapsedTime()

    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.intersectObjects(scene.children, false);

    if (intersects.length > 0) {

        if (INTERSECTED != intersects[0].object) {

            // if ( INTERSECTED ) INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );

            INTERSECTED = intersects[0].object;
        }

    } else {

        // if ( INTERSECTED ) INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );



    }


    // Update controls
    // controls.update()

    // Update Matter.js physics engine
    Matter.Engine.update(engine);

    // Sync the Matter.js box position with Three.js box
    const { x, y } = matterBox.position;

    // console.log(x, y)
    if (letterBoxes.length == numberOfLetters) {

        _.each(letterBoxes, (box, i) => {
            if (box != undefined && box.position != undefined) {
                box.position.set(i * .41 + x - numberOfLetters / 4, -1 + y, 0);
            }
        })

    }


    // Render
    renderer.render(scene, camera)
    TWEEN.update(); // Update the Tween.js animations


    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()


var touchstartX = 0;
var touchstartY = 0;
var touchendX = 0;
var touchendY = 0;


canvas.addEventListener('mousedown', function (event) {
    // console.log(event)
    touchstartX = event.screenX;
    touchstartY = event.screenY;
}, false);

// canvas.addEventListener("mousemove", (event) => {
//     console.log(event)
// });


canvas.addEventListener('mouseup', function (event) {
    touchendX = event.screenX;
    touchendY = event.screenY;
    handleGesure();
    INTERSECTED = null;
}, false);

function handleGesure() {
    var swiped = 'swiped: ';
    if (touchendX > touchstartX) {
        console.log('left');
    }

    if (touchendX < touchstartX) {
        console.log('right');
    }

    if (touchendY < touchstartY) {
        console.log('up');
        rotateBox("up");
    }

    if (touchendY > touchstartY) {
        console.log('down');
        rotateBox("down");

    }
    if (touchendY == touchstartY) {
        console.log('tap');
    }
}