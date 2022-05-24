# Mover objetos en JavaScript 3D Physics usando Ammo.js y Three.js

Este artículo es una continuación de Introducción a JavaScript 3D Physics usando Ammo.js y Three.js. Le sugiero enfáticamente que revise la primera parte antes de continuar.

Entonces, del artículo anterior, hemos visto cómo configurar el mundo de la física, agregarle objetos e incluso filtrar las colisiones usando máscaras. También tocamos las restricciones (por ejemplo, las articulaciones).

¿Qué pasaría si quisieras mover los objetos, cómo lo harías? Por ejemplo, en un juego, desea que su personaje se mueva mientras se reproduce la animación de caminar o necesita un bloque flotante que transportaría a un jugador a través de un peligroso mar de lava a una sección segura de la escena del juego.

Para poder lograr esto, tendríamos que revisar algunos fundamentos.

## Cuerpos Rígidos Dinámicos, Estáticos y Cinemáticos

Citando del manual de usuario de bala:


``Hay 3 tipos diferentes de objetos en Bullet``

``Cuerpos rígidos dinámicos (en movimiento): masa positiva, cada marco de simulación, la dinámica actualizará su transformación mundial.``

``Cuerpos rígidos estáticos: masa cero, no pueden moverse, solo chocan.``

``Cuerpos rígidos cinemáticos: masa cero, puede ser animado por el usuario, pero solo habrá interacción en un sentido: los objetos dinámicos serán empujados pero no hay influencia de los objetos dinámicos.``

Aviso: Habrá mucho que copiar y pegar si vas a seguir este tutorial.

## Cuerpos rígidos dinámicos

Los cuerpos rígidos dinámicos tienen una masa mayor que cero y se moverán afectados por las fuerzas y leyes que gobiernan el mundo de la física. Esto significa que se verán afectados por la gravedad, el impulso y responderán adecuadamente a las colisiones de otros cuerpos. Para mover un cuerpo rígido dinámico, utilice applyForce, applyImpulse o setLinearVelocity. Todos estos son métodos de cuerpo rígido.

applyForce y applyImpulse "darían como resultado una aceleración corporal, por lo que tus personajes tendrán impulso", pero para este tutorial usaremos setLinearVelocity.

Podríamos estar creando un ejemplo para demostrar esto. Nuestro ejemplo consistirá en una pelota que se moverá usando las teclas WASD.

Todavía mantendremos la configuración del espacio de trabajo utilizada para el tutorial anterior. Entonces, una vez más, si no ha seguido ese tutorial, hágalo

Continúe y cree un archivo html en el espacio de trabajo y asígnele un nombre razonable. Copie el siguiente código en él como una forma de arranque.


```html
<html>
    <head>
        <meta charset="utf-8">
        <title>Move JS 3D Physics</title>
        <style>
            body { margin: 0; }
        </style>
    </head>
    <body>
        <script src="js/three.js"></script>
        <script src="js/ammo.js"></script>
        <script>

            //variable declaration section
            let physicsWorld, scene, camera, renderer, rigidBodies = [], tmpTrans = null

            //Ammojs Initialization
            Ammo().then(start)

            function start (){

                tmpTrans = new Ammo.btTransform();

                setupPhysicsWorld();

                setupGraphics();
                createBlock();
                createBall();

                renderFrame();

            }

            function setupPhysicsWorld(){

                let collisionConfiguration  = new Ammo.btDefaultCollisionConfiguration(),
                    dispatcher              = new Ammo.btCollisionDispatcher(collisionConfiguration),
                    overlappingPairCache    = new Ammo.btDbvtBroadphase(),
                    solver                  = new Ammo.btSequentialImpulseConstraintSolver();

                physicsWorld           = new Ammo.btDiscreteDynamicsWorld(dispatcher, overlappingPairCache, solver, collisionConfiguration);
                physicsWorld.setGravity(new Ammo.btVector3(0, -10, 0));

            }


            function setupGraphics(){

                //create clock for timing
                clock = new THREE.Clock();

                //create the scene
                scene = new THREE.Scene();
                scene.background = new THREE.Color( 0xbfd1e5 );

                //create camera
                camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.2, 5000 );
                camera.position.set( 0, 30, 70 );
                camera.lookAt(new THREE.Vector3(0, 0, 0));

                //Add hemisphere light
                let hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.1 );
                hemiLight.color.setHSL( 0.6, 0.6, 0.6 );
                hemiLight.groundColor.setHSL( 0.1, 1, 0.4 );
                hemiLight.position.set( 0, 50, 0 );
                scene.add( hemiLight );

                //Add directional light
                let dirLight = new THREE.DirectionalLight( 0xffffff , 1);
                dirLight.color.setHSL( 0.1, 1, 0.95 );
                dirLight.position.set( -1, 1.75, 1 );
                dirLight.position.multiplyScalar( 100 );
                scene.add( dirLight );

                dirLight.castShadow = true;

                dirLight.shadow.mapSize.width = 2048;
                dirLight.shadow.mapSize.height = 2048;

                let d = 50;

                dirLight.shadow.camera.left = -d;
                dirLight.shadow.camera.right = d;
                dirLight.shadow.camera.top = d;
                dirLight.shadow.camera.bottom = -d;

                dirLight.shadow.camera.far = 13500;

                //Setup the renderer
                renderer = new THREE.WebGLRenderer( { antialias: true } );
                renderer.setClearColor( 0xbfd1e5 );
                renderer.setPixelRatio( window.devicePixelRatio );
                renderer.setSize( window.innerWidth, window.innerHeight );
                document.body.appendChild( renderer.domElement );

                renderer.gammaInput = true;
                renderer.gammaOutput = true;

                renderer.shadowMap.enabled = true;

            }

        
            function renderFrame(){

                let deltaTime = clock.getDelta();

                updatePhysics( deltaTime );

                renderer.render( scene, camera );

                requestAnimationFrame( renderFrame );

            }


            

            function createBlock(){
                
                let pos = {x: 0, y: 0, z: 0};
                let scale = {x: 100, y: 2, z: 100};
                let quat = {x: 0, y: 0, z: 0, w: 1};
                let mass = 0;

                //threeJS Section
                let blockPlane = new THREE.Mesh(new THREE.BoxBufferGeometry(), new THREE.MeshPhongMaterial({color: 0xa0afa4}));

                blockPlane.position.set(pos.x, pos.y, pos.z);
                blockPlane.scale.set(scale.x, scale.y, scale.z);

                blockPlane.castShadow = true;
                blockPlane.receiveShadow = true;

                scene.add(blockPlane);


                //Ammojs Section
                let transform = new Ammo.btTransform();
                transform.setIdentity();
                transform.setOrigin( new Ammo.btVector3( pos.x, pos.y, pos.z ) );
                transform.setRotation( new Ammo.btQuaternion( quat.x, quat.y, quat.z, quat.w ) );
                let motionState = new Ammo.btDefaultMotionState( transform );

                let colShape = new Ammo.btBoxShape( new Ammo.btVector3( scale.x * 0.5, scale.y * 0.5, scale.z * 0.5 ) );
                colShape.setMargin( 0.05 );

                let localInertia = new Ammo.btVector3( 0, 0, 0 );
                colShape.calculateLocalInertia( mass, localInertia );

                let rbInfo = new Ammo.btRigidBodyConstructionInfo( mass, motionState, colShape, localInertia );
                let body = new Ammo.btRigidBody( rbInfo );

                body.setFriction(4);
                body.setRollingFriction(10);

                physicsWorld.addRigidBody( body );
            }


            function createBall(){
                
                let pos = {x: 0, y: 4, z: 0};
                let radius = 2;
                let quat = {x: 0, y: 0, z: 0, w: 1};
                let mass = 1;

                //threeJS Section
                let ball = new THREE.Mesh(new THREE.SphereBufferGeometry(radius), new THREE.MeshPhongMaterial({color: 0xff0505}));

                ball.position.set(pos.x, pos.y, pos.z);
                
                ball.castShadow = true;
                ball.receiveShadow = true;

                scene.add(ball);


                //Ammojs Section
                let transform = new Ammo.btTransform();
                transform.setIdentity();
                transform.setOrigin( new Ammo.btVector3( pos.x, pos.y, pos.z ) );
                transform.setRotation( new Ammo.btQuaternion( quat.x, quat.y, quat.z, quat.w ) );
                let motionState = new Ammo.btDefaultMotionState( transform );

                let colShape = new Ammo.btSphereShape( radius );
                colShape.setMargin( 0.05 );

                let localInertia = new Ammo.btVector3( 0, 0, 0 );
                colShape.calculateLocalInertia( mass, localInertia );

                let rbInfo = new Ammo.btRigidBodyConstructionInfo( mass, motionState, colShape, localInertia );
                let body = new Ammo.btRigidBody( rbInfo );

                body.setFriction(4);
                body.setRollingFriction(10);


                physicsWorld.addRigidBody( body );
                
                ball.userData.physicsBody = body;
                rigidBodies.push(ball);
            }


            function updatePhysics( deltaTime ){

                // Step world
                physicsWorld.stepSimulation( deltaTime, 10 );

                // Update rigid bodies
                for ( let i = 0; i < rigidBodies.length; i++ ) {
                    let objThree = rigidBodies[ i ];
                    let objAmmo = objThree.userData.physicsBody;
                    let ms = objAmmo.getMotionState();
                    if ( ms ) {

                        ms.getWorldTransform( tmpTrans );
                        let p = tmpTrans.getOrigin();
                        let q = tmpTrans.getRotation();
                        objThree.position.set( p.x(), p.y(), p.z() );
                        objThree.quaternion.set( q.x(), q.y(), q.z(), q.w() );

                    }
                }

            }


        </script>
    </body>
</html>
```

Si ve esto en su navegador, verá un avión con una bola roja.

En la sección de declaración de variables del código, agregue:

```JavaScript
let ballObject = null, 
moveDirection = { left: 0, right: 0, forward: 0, back: 0 }
const STATE = { DISABLE_DEACTIVATION : 4 }
```

ballObject será nuestro identificador de la pelota y moveDirection se usará para mantener presionada la tecla direccional respectiva (WASD).

Constant STATE es una definición del compilador en el archivo fuente de viñetas (btCollissionObject.h). En el momento de escribir este artículo, aún no se ha incluido en ammo.idl, sin embargo, su valor da el resultado esperado en el motor.

Cuando un cuerpo rígido ya no participa en la interacción dinámica en el mundo de la física, ammojs lo desactiva. En este estado desactivado no podremos aplicarle fuerza. Para evitar que esto suceda, establezca el estado de activación del cuerpo rígido en STATE.DISABLE_DEACTIVATION.

Volver al código. Vaya a la definición del método createBall y cambie la línea que tiene:

```
let ball = new THREE.Mesh(new THREE.SphereBufferGeometry(radius), new THREE.MeshPhongMaterial({color: 0xff0505}));
```

to

```
let ball = ballObject = new THREE.Mesh(new THREE.SphereBufferGeometry(radius), new THREE.MeshPhongMaterial({color: 0xff0505}));
```

Esto establece ballObject como un identificador de la pelota que creamos.

Aún no hemos terminado. Después de la línea que dice body.setRollingFriction(10); agregar

```
body.setActivationState( STATE.DISABLE_DEACTIVATION );
```


Lo siguiente es manejar eventos keydown y keyup para las teclas del teclado WASD.

Copie y pegue el siguiente fragmento después de la definición del método renderFrame():

```Javascript
function setupEventHandlers(){

    window.addEventListener( 'keydown', handleKeyDown, false);
    window.addEventListener( 'keyup', handleKeyUp, false);

}


function handleKeyDown(event){

    let keyCode = event.keyCode;

    switch(keyCode){

        case 87: //W: FORWARD
            moveDirection.forward = 1
            break;

        case 83: //S: BACK
            moveDirection.back = 1
            break;

        case 65: //A: LEFT
            moveDirection.left = 1
            break;

        case 68: //D: RIGHT
            moveDirection.right = 1
            break;

    }
}


function handleKeyUp(event){
    let keyCode = event.keyCode;

    switch(keyCode){
        case 87: //FORWARD
            moveDirection.forward = 0
            break;

        case 83: //BACK
            moveDirection.back = 0
            break;

        case 65: //LEFT
            moveDirection.left = 0
            break;

        case 68: //RIGHT
            moveDirection.right = 0
            break;

    }

}
```

Lo anterior conecta los eventos keydown y keyup del teclado a los controladores de eventos apropiados que también se definen en el fragmento.

La forma en que funcionan los controladores de eventos es establecer el componente moveDirection de una tecla en 1 cuando se presiona la tecla (handleKeyDown()) y en 0 cuando se suelta (handleKeyUp()). Bastante sencillo, supongo.

Para que no lo olvidemos, llame a este método setupEventHandlers() recién agregado dentro del método start() en la parte superior, justo antes de la invocación de renderFrame(). Su método start () debería verse así:


```JavaScript
function start (){
  tmpTrans = new Ammo.btTransform();
  setupPhysicsWorld();
  setupGraphics();
  createBlock();
  createBall();
  setupEventHandlers();
  renderFrame();
}
```

Ahora, para mover realmente la pelota, tenemos que

- primero resuelve las direcciones establecidas en la variable moveDirection
- establecer un vector con las direcciones resueltas
- multiplicar el vector por un factor de escala
- luego aplique el vector como la velocidad lineal del cuerpo rígido de la bola

Todos estos están contenidos en el método moveBall() a continuación. Péguelo en su código después de la definición del método createBall()


```JavaScript
function moveBall(){

    let scalingFactor = 20;

    let moveX =  moveDirection.right - moveDirection.left;
    let moveZ =  moveDirection.back - moveDirection.forward;
    let moveY =  0; 

    if( moveX == 0 && moveY == 0 && moveZ == 0) return;

    let resultantImpulse = new Ammo.btVector3( moveX, moveY, moveZ )
    resultantImpulse.op_mul(scalingFactor);

    let physicsBody = ballObject.userData.physicsBody;
    physicsBody.setLinearVelocity( resultantImpulse );

}
```

Tenga en cuenta que el componente y es cero porque no manejamos el movimiento hacia arriba y hacia abajo.

Para el cuerpo del método renderFrame() agregue una llamada a moveBall() justo después de la línea que tiene


```
let deltaTime = clock.getDelta();
```

renderFrame() ahora debería verse así:

```JavaScript
function renderFrame(){
   let deltaTime = clock.getDelta();
   moveBall();
   updatePhysics( deltaTime );
   renderer.render( scene, camera );
   requestAnimationFrame( renderFrame );
}
```

Si siguió todas las instrucciones anteriores, su código final debería verse así y al presionar las teclas WASD notará que la bola roja se mueve. Aquí hay una demostración de trabajo.

Pausa para un poco de reflexión.

En esencia, lo que está sucediendo es que para cada bucle de renderizado verificamos si se presiona alguna tecla direccional. Si es así, aplicamos la velocidad lineal, en función de la resolución de las teclas direccionales, al cuerpo rígido físico. De esta manera nuestro objeto se mueve.


## Cuerpo rígido estático

Los cuerpos rígidos estáticos, que tienen masa cero, son justo lo que dice su nombre. Nunca deben ser movidos por el usuario

### Cuerpo rígido cinemático

Citando del manual de usuario de bala:

``Si planea animar o mover objetos estáticos, debe marcarlos como cinemáticos. También deshabilite el dormir/desactivar para ellos durante la animación. Esto significa que el mundo de la dinámica Bullet (ammojs) obtendrá el new worldtransform desde btMotionState cada cuadro de simulación.``

Los objetos cinemáticos son objetos estáticos que pueden ser movidos, pero por el usuario. No se ven afectados por ninguna fuerza del mundo de la física, ni siquiera la gravedad, simplemente están ahí. Un buen ejemplo de dónde sería útil un objeto cinemático, como se indicó anteriormente, es un bloque flotante que transportaría a un jugador a través de un peligroso mar de lava a una sección segura del juego.

Dado que los cuerpos cinemáticos no se ven afectados por las fuerzas en el mundo de la física, significa que no podemos usar applyForce para moverlos, ni podemos usar applyImpulse ni setLinearVelocity. Para mover un cuerpo rígido cinemático, debe configurar su transformación del mundo físico (posición y rotación) desde su mundo 3D. Entonces, mientras que en el caso de los cuerpos rígidos dinámicos obtenemos la posición y la rotación actuales del mundo de la física y actualizamos nuestros objetos 3D, en los cuerpos rígidos cinemáticos el caso es inverso: obtenemos la posición y la rotación actuales de nuestros objetos 3D y actualizamos los objetos físicos. .

Para demostrar esto, agregaremos un cuadro cinemático a nuestra escena para moverlo usando las teclas de flecha (←↑↓→).

Volvamos a nuestro código. En la sección de declaración de variables, agregue

```
let kObject = null, 
kMoveDirection = { left: 0, right: 0, forward: 0, back: 0 }, 
tmpPos = new THREE.Vector3(), tmpQuat = new THREE.Quaternion();
```

kObject será nuestro controlador para el objeto cinemático, mientras que kMoveDirection, al igual que moveDirection, mantendrá la dirección de pulsación de tecla para mover el objeto cinemático. tmpPos y tmpQuat son vectores temporales y cuaterniones respectivamente.

Todavía en esta sección agregue const FLAGS = { CF_KINEMATIC_OBJECT: 2 }

Al igual que en el caso de la constante STATE, FLAGS es un tipo de enumeración en el origen de viñetas, pero no se incluyó en ammo.idl, aunque su valor sigue dando el resultado esperado.

Cuando un cuerpo rígido se marca como cinemático utilizando FLAGS.CF_KINEMATIC_OBJECT, las municiones lo tratarán como tal.

El siguiente paso es crear nuestra caja cinemática.

```Javascript
function createKinematicBox(){

    let pos = {x: 40, y: 6, z: 5};
    let scale = {x: 10, y: 10, z: 10};
    let quat = {x: 0, y: 0, z: 0, w: 1};
    let mass = 0;

    //threeJS Section
    kObject = new THREE.Mesh(new THREE.BoxBufferGeometry(), new THREE.MeshPhongMaterial({color: 0x30ab78}));

    kObject.position.set(pos.x, pos.y, pos.z);
    kObject.scale.set(scale.x, scale.y, scale.z);

    kObject.castShadow = true;
    kObject.receiveShadow = true;

    scene.add(kObject);


    //Ammojs Section
    let transform = new Ammo.btTransform();
    transform.setIdentity();
    transform.setOrigin( new Ammo.btVector3( pos.x, pos.y, pos.z ) );
    transform.setRotation( new Ammo.btQuaternion( quat.x, quat.y, quat.z, quat.w ) );
    let motionState = new Ammo.btDefaultMotionState( transform );

    let colShape = new Ammo.btBoxShape( new Ammo.btVector3( scale.x * 0.5, scale.y * 0.5, scale.z * 0.5 ) );
    colShape.setMargin( 0.05 );

    let localInertia = new Ammo.btVector3( 0, 0, 0 );
    colShape.calculateLocalInertia( mass, localInertia );

    let rbInfo = new Ammo.btRigidBodyConstructionInfo( mass, motionState, colShape, localInertia );
    let body = new Ammo.btRigidBody( rbInfo );

    body.setFriction(4);
    body.setRollingFriction(10);

    body.setActivationState( STATE.DISABLE_DEACTIVATION );
    body.setCollisionFlags( FLAGS.CF_KINEMATIC_OBJECT );


    physicsWorld.addRigidBody( body );
    kObject.userData.physicsBody = body;

}
```


Agregue lo anterior al código después de la definición del método createBall(). No hay mucha diferencia entre este y otros que hemos estado usando para crear objetos físicos, excepto por la línea resaltada a continuación que lo marca como un objeto cinemático:

```
body.setActivationState( STATE.DISABLE_DEACTIVATION );
body.setCollisionFlags( FLAGS.CF_KINEMATIC_OBJECT );
```

Ahora llame a createKinematicBox() desde el método start() preferiblemente después de createBall() .

Su método start () debería verse actualmente como


```Javascript
function start (){
   tmpTrans = new Ammo.btTransform();
   setupPhysicsWorld();
   setupGraphics();
   createBlock();
   createBall();
   createKinematicBox();
   setupEventHandlers();
   renderFrame();
}
```


Si revisa su navegador en esta etapa, debería ver nuestro cuadro allí mismo en la escena. Intenta mover la pelota contra él y observa que no se ve afectado por la colisión.

Ahora a la parte importante. Moviendo la caja.

Manejemos el teclado hacia abajo y hacia arriba de las teclas de flecha del teclado. Agregue el siguiente código a la instrucción switch…case en handleKeyDown()


```JavaScript
case 38: //↑: FORWARD
   kMoveDirection.forward = 1
   break;
   
case 40: //↓: BACK
   kMoveDirection.back = 1
   break;
   
case 37: //←: LEFT
   kMoveDirection.left = 1
   break;
   
case 39: //→: RIGHT
   kMoveDirection.right = 1
   break;
```

Igualmente agregue lo siguiente al de handleKeyUp()


```JavaScript
case 38: //↑: FORWARD
   kMoveDirection.forward = 0
   break;
   
case 40: //↓: BACK
   kMoveDirection.back = 0
   break;
   
case 37: //←: LEFT
   kMoveDirection.left = 0
   break;
   
case 39: //→: RIGHT
   kMoveDirection.right = 0
   break;
```

Antes de agregar el método para mover nuestra caja cinemática, establezcamos algunas variables útiles.

A la sección de declaración de variables agregar


```
let ammoTmpPos = null, ammoTmpQuat = null;
```

Continúe con el método start(), después de la línea que tiene


```
tmpTrans = new Ammo.btTransform();
```

agregar

```
ammoTmpPos = new Ammo.btVector3();
ammoTmpQuat = new Ammo.btQuaternion();
```

Bien.

Es hora de mover finalmente nuestra caja cinemática.

Pegue la siguiente definición de método después de moveBall


```JavaScript
function moveKinematic(){

    let scalingFactor = 0.3;

    let moveX =  kMoveDirection.right - kMoveDirection.left;
    let moveZ =  kMoveDirection.back - kMoveDirection.forward;
    let moveY =  0;


    let translateFactor = tmpPos.set(moveX, moveY, moveZ);

    translateFactor.multiplyScalar(scalingFactor);

    kObject.translateX(translateFactor.x);
    kObject.translateY(translateFactor.y);
    kObject.translateZ(translateFactor.z);

    kObject.getWorldPosition(tmpPos);
    kObject.getWorldQuaternion(tmpQuat);

    let physicsBody = kObject.userData.physicsBody;

    let ms = physicsBody.getMotionState();
    if ( ms ) {

        ammoTmpPos.setValue(tmpPos.x, tmpPos.y, tmpPos.z);
        ammoTmpQuat.setValue( tmpQuat.x, tmpQuat.y, tmpQuat.z, tmpQuat.w);


        tmpTrans.setIdentity();
        tmpTrans.setOrigin( ammoTmpPos ); 
        tmpTrans.setRotation( ammoTmpQuat ); 

        ms.setWorldTransform(tmpTrans);

    }

}
```

Expliquemos lo que está sucediendo arriba:

- Primero, las direcciones en kMoveDirection se resuelven y se usan para traducir el cuadro en el mundo 3d.
- A continuación, se obtiene la transformación del mundo de la caja 3d (posición y cuaternión).
- Por último, adjuntamos el cuerpo rígido físico a la caja 3d, recuperamos su estado de movimiento y configuramos su transformación mundial con la obtenida de la caja 3d.

That it is.

Oh, one more, add a call to moveKinematic() in renderFrame() just after moveBall(). renderFrame() should now look more like


```JavaScript
function renderFrame(){
   let deltaTime = clock.getDelta();
  
   moveBall();
   moveKinematic();
   updatePhysics( deltaTime );
   renderer.render( scene, camera );
   requestAnimationFrame( renderFrame );
}
```

Después de haber hecho todo lo que se ha descrito en este tutorial, debería tener su código final con este aspecto. Presiona las flechas para mover el cuadro. Observe cómo la caja puede empujar la pelota pero no se ve afectada.

Aquí hay una demostración en línea de la misma.

Como beneficio adicional, he agregado este enlace que contiene la demostración anterior pero modificado para disparar bolas con un clic del mouse (código fuente)

¡¡Uf!!. Eso es todo una vez más.

Siéntete libre de modificar los códigos, explorar y experimentar todo lo que quieras. Si hay algún error háganmelo saber, estaré encantado de corregirlo.

disfruta

(Siguiente artículo: Detección de colisiones en Javascript 3D Physics usando Ammo.js y Three.js)