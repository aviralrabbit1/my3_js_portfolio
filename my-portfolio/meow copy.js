import gsap from 'gsap' //used for animation
// import * as THREE from 'https://unpkg.com/three@0.126.1/build/three.module.js'
import * as THREE from 'https://unpkg.com/three@0.149.0/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.126.1/examples/jsm/controls/OrbitControls.js';
import * as dat from 'dat.gui'

const gui = new dat.GUI();
const world = {
    plane: {
        width: 400,
        height: 400,
        widthSegments: 50,
        heightSegments: 50
    }
}
function generatePlane(){
    planeMesh.geometry.dispose()
    planeMesh.geometry = new THREE.PlaneGeometry(
        world.plane.width, 
        world.plane.height, 
        world.plane.widthSegments, 
        world.plane.heightSegments
        )
    // console.log(world.plane)

    const {array} = planeMesh.geometry.attributes.position
    for (let i = 0; i <array.length; i+=3) {
        const x = array[i]
        const y = array[i+1]
        const z = array[i+2]
    
        array[i] = x+Math.random() - 0.5
        array[i+1] = y+Math.random() - 0.5
        array[i+2] = z+Math.random() - 0.5
        // console.log(array[i]) 
    }

    //  vertexCOlours are defined here
    const colors = []
    for (let i = 0; i < planeMesh.geometry.attributes.position.count; i++) {
        colors.push(0, 0.19, 0.4)
        // we can change colors combinations here
    }

    // console.log(colors)

    planeMesh.geometry.setAttribute('color',
        new THREE.BufferAttribute(new Float32Array(colors),3) //rgb from float 0 to 1
        //grouping numbers in the array, eg. every 3 indices require one position like x,y,z, or rgb
    )
}

gui.add(world.plane, 'width', 1, 500).onChange(generatePlane)
gui.add(world.plane, 'height', 1, 500).onChange(generatePlane)
gui.add(world.plane, 'widthSegments', 1, 100).onChange(generatePlane)
gui.add(world.plane, 'heightSegments', 1, 100).onChange(generatePlane)


const raycaster  = new THREE.Raycaster()
// console.log(raycaster)
const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(75, innerWidth/innerHeight, 0.1,1000)
    // field of view, wide view/telesopic camera
    // ascpect ratio= entire width/height
    // clipping plane, how close objext needs to be not show on screen

const renderer = new THREE.WebGLRenderer()
renderer.setSize(innerWidth, innerHeight)
// removes the jaggery look due to the PC screen
renderer.setPixelRatio(devicePixelRatio)
// put canvas object into our element, into the body tag
document.body.appendChild(renderer.domElement)

// geometry - wirefram of object, data related to object vertices, making a shape
// material goes on top of this geometry, fill in the wireframe

// const boxGeometry = new THREE.BoxGeometry(1,1,1)
// const material = new THREE.MeshBasicMaterial({color: 0x00ff00})
// const mesh = new THREE.Mesh(boxGeometry, material)
// scene.add(mesh)

new OrbitControls(camera, renderer.domElement)
camera.position.z = 50  // make sure not located in center, so move camera backward to see infront

const planeGeometry = new THREE.PlaneGeometry
    (world.plane.width, 
        world.plane.height, 
        world.plane.widthSegments, 
        world.plane.heightSegments)
const planematerial = new THREE.MeshPhongMaterial({
    // color: 0xff0000,
    side: THREE.DoubleSide,
    flatShading: new THREE.MeshLambertMaterial({flatShading:true}),
    // flatShading: THREE.FlatShading,
    vertexColors: true 
    // enables us to impart colors to it
})



const planeMesh = new THREE.Mesh(planeGeometry, planematerial)
scene.add(planeMesh)
generatePlane()
// console.log(planeMesh.geometry.attributes.position.array)
// console.log(planeMesh.geometry.attributes)


const {array} = planeMesh.geometry.attributes.position
const randomValues =[]
for (let i = 0; i <array.length; i++) {

    if (i/3===0){
        const x = array[i]
        const y = array[i+1]
        const z = array[i+2]

        array[i] = x+(Math.random() - 0.5)*3
        array[i+1] = y+(Math.random() - 0.5)*3
        array[i+2] = z+(Math.random() - 0.5)*3
    }
    // console.log(array[i]) 
    randomValues.push((Math.random()-0.5)*Math.PI*2)
} 

planeMesh.geometry.attributes.position.randomValues = randomValues
planeMesh.geometry.attributes.position.originalPosition = planeMesh.geometry.attributes.position.array2


const light = new THREE.DirectionalLight(0xffffff, 1 //intensity/brightness
)
light.position.set(0,1,1)
scene.add(light)

const backlight = new THREE.DirectionalLight(0xffffff, 1)
backlight.position.set(0,0,-1)
scene.add(backlight)

// create mouse object to track location
const mouse = {
    x: undefined,
    y: undefined
}

let frame =0
function animate(){
    requestAnimationFrame(animate)
    // function is in loop
    renderer.render(scene, camera)
    // mesh.rotation.x+=0.01
    // mesh.rotation.y+=0.01
    // planeMesh.rotation.x+=0.01
    // tracking mouse

    raycaster.setFromCamera(mouse, camera)
    frame+=0.01

    const {array, originalPosition, randomValues} = planeMesh.geometry.attributes.position

    for (let i = 0; i < planeMesh.geometry.attributes.position.count; i+=3){
        planeMesh.geometry.attributes.position[i] = planeMesh.geometry.attributes.position[i] 
        + Math.cos(frame+planeMesh.geometry.attributes.position.randomValues[i])*0.003 //movement effect on X-axis
        // console.log(Math.cos(frame))
        planeMesh.geometry.attributes.position[i+1] = planeMesh.geometry.attributes.position[i] 
        + Math.sin(frame+randomValues[i])*0.003
    }
    planeMesh.geometry.attributes.position.needsUpdate = true


    const intersects = raycaster.intersectObject(planeMesh)

    if(intersects.length > 0){
        const {color} = intersects[0].object.geometry.attributes

        intersects[0].object.geometry.attributes.color.needsUpdate = true

        const initialColor = {
            r: 0,
            g: 0.19,
            b: 0.4
        }

        const hoverColor = {
            r: 0.1,
            g: 0.5,
            b: 1
        }
        gsap.to(hoverColor, {
            r: initialColor.r,
            g: initialColor.g,
            b: initialColor.b,
            duration: 1,
            onUpdate: () =>{
                // console.log(hoverColor)
                color.setX(intersects[0].face.a,hoverColor.r) // selecting a face
                color.setY(intersects[0].face.a,hoverColor.b) // selecting a face
                color.setZ(intersects[0].face.a,hoverColor.c) // selecting a face
                
                // Vertice 2
                color.setX(intersects[0].face.b,hoverColor.r)
                color.setY(intersects[0].face.b,hoverColor.b)
                color.setZ(intersects[0].face.b,hoverColor.c)
                
                // Vertice 3
                color.setX(intersects[0].face.c,hoverColor.r)
                color.setY(intersects[0].face.c,hoverColor.b)
                color.setZ(intersects[0].face.c,hoverColor.c)
                    
                color.needsUpdate = true
            }
        })
        //intersects[0].object.geometry.attributes.color.setX(0,0) //replacing the value of X(first) -> to X(second)


        // console.log(intersects[0].object.geometry.attributes.color)
        // console.log(intersects[0].object.geometry);
        // console.log(intersects[0].face);
    }
    // console.log(intersect)
}


// renderer.render(scene, camera)

animate()


addEventListener('mousemove', (event) => {
    mouse.x = (event.clientX / innerWidth) * 2 - 1
    mouse.y = -(event.clientY / innerHeight) * 2 + 1
    // console.log(mouse)
  })

