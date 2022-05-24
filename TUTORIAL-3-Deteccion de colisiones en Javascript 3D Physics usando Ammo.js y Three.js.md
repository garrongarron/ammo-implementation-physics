# Detección de colisiones en Javascript 3D Physics usando Ammo.js y Three.js

Este es el tercer artículo en mis tutoriales de Física 3D de Javascript. Antes de continuar, se supone que ha leído los dos primeros artículos. Si no lo has hecho, te sugiero encarecidamente que lo hagas. El primer artículo es "Introducción a la física 3D de JavaScript usando Ammo.js y three.js" y el segundo "Mover objetos en la física 3D de Javascript usando Ammo.js y three.js"

## Introducción

Hacer que los objetos choquen e interactúen en el mundo de la física es muy divertido; filtrando quién choca y quién no usando máscaras y todo eso. Sin embargo, hay situaciones en las que es posible que desee detectar cuándo hay una colisión entre objetos o simplemente entre un objeto clave y cualquier otro objeto. También es posible que desee obtener información adicional de la colisión, como los objetos involucrados, su velocidad e incluso la posición de los contactos realizados. Por ejemplo, en un juego en el que el personaje corre por el escenario recogiendo monedas, querrás detectar cuándo los personajes hacen contacto con la moneda para acreditar el inventario de monedas o los puntos del personaje.

Afortunadamente, ammo.js proporciona conceptos para ayudar en la detección de colisiones. Tenemos

- Comprobación del colector de contacto
- Prueba de contacto
- ContactoPairPrueba
- Objeto fantasma


Para simplificar, solo estaríamos tratando Contact Manifold Check, ContactTest y ContactPairTest.

Antes de comenzar, no olvide configurar su espacio de trabajo. Esto se indica claramente en el primer tutorial y se cita a continuación:

Primero, obtenga las bibliotecas para three.js y ammo.js. Three.js se puede obtener desde https://threejs.org/build/three.js mientras que para ammo.js, descargue el repositorio desde https://github.com/kripken/ammo.js, luego vaya a la carpeta de compilación para el archivo ammo.js.

Cree su carpeta de proyecto y asígnele el nombre que desee. En él, cree un archivo index.html y una carpeta "js" que contenga los archivos three.js y ammo.js.

Tenga en cuenta que este tutorial, al igual que los anteriores, extrae mucha información del manual de usuario de balas y de la wiki de física de balas ahora desaparecida. Este tutorial, en particular, contiene algunos fragmentos de código obtenidos del ejemplo de rotura convexa de física de three.js.

Aviso: Habrá mucho que copiar y pegar si vas a seguir este tutorial. Y no se asuste, este artículo no es tan voluminoso como parece.


## Comprobación del colector de contacto
Para ayudarnos a comprender mejor la comprobación de colectores de contacto, explicaremos algunos conceptos.

### Punto de contacto
Tal como su nombre lo dice, este es el punto de contacto entre dos objetos de colisión. El punto de contacto se representa como btManifoldPoint en ammo.js y proporciona información útil sobre el contacto, como el impulso y la posición. También proporciona la distancia entre los dos objetos. La suposición sería que para que haya contacto la distancia entre los objetos siempre será cero, sin embargo puede ser mayor o menor.

### colector de contacto
“Una variedad de contacto es un caché que contiene todos los puntos de contacto entre pares de objetos de colisión”. Para dos objetos en colisión, el colector de contacto contiene todos los puntos de contacto entre ellos. Está representado en ammo.js por btPersistentManifold y expone algunos métodos útiles, por ejemplo, para recuperar dos objetos en colisión, la cantidad de puntos de contacto entre ellos y también un punto de contacto específico por índice.

### de fase ancha
Broadphase definitivamente no es nuevo para nosotros, lo encontramos por primera vez en el primer tutorial y ha sido parte de las estructuras que usamos para inicializar nuestro mundo de física:


```
overlappingPairCache = new Ammo.btDbvtBroadphase()
```

Sin embargo, llegaremos a entenderlo un poco más. Broadphase proporciona una forma rápida y optimizada de eliminar los pares de objetos de colisión en función de la superposición de su cuadro delimitador alineado con el eje (AABB). Básicamente, para cada par de objetos de colisión en el mundo, el algoritmo de fase ancha verifica si sus AABB se superponen. El par se retiene si hay una superposición o se rechaza de lo contrario, generando así una lista aproximada de pares en colisión. Sin embargo, hay pares que tienen AABB superpuestos pero aún no están lo suficientemente cerca como para colisionar. Estos son manejados más tarde por algoritmos de actuación más específicos.

Hay dos estructuras principales de aceleración de fase ancha disponibles en ammo.js btDbvtBroadphase (Dynamic AABB Tree) y btAxisSweep3 (Sweep and Prune o SAP).

btDbvtBroadphase “se adapta dinámicamente a las dimensiones del mundo y sus contenidos. Está muy bien optimizado y es un muy buen broadphase de propósito general. Maneja mundos dinámicos donde muchos objetos están en movimiento, y la adición y eliminación de objetos es más rápida que SAP”.

"Dbvt" en el nombre significa árbol de volumen delimitador dinámico

btAxisSweep3, por otro lado, “también es una buena fase ancha de propósito general, con la limitación de que requiere un tamaño mundial fijo, conocido de antemano. Esta fase ancha tiene el mejor rendimiento para los mundos dinámicos típicos, donde la mayoría de los objetos tienen poco o ningún movimiento”.

## Despachador

También hemos estado usando un objeto despachador todo el tiempo:

```
dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration)
```

Una vez que se realiza la fase ancha eliminando AABB que no se superponen, el despachador "itera sobre cada par, busca un algoritmo de colisión coincidente en función de los tipos de objetos involucrados y ejecuta el algoritmo de colisión calculando los puntos de contacto".

Para reunir todo esto, aquí hay un resumen simplificado de cómo encajan todos.
En cada paso de la simulación, la fase ancha (btDbvtBroadphase o btAxisSweep3) verifica cada par de objetos de colisión en el mundo y los filtra sin superponer AABB. El despachador (btCollisionDispatcher) sigue a continuación aplicando un algoritmo de colisión detallado en cada par, lo que nos proporciona los múltiples de contactos (btPersistentManifold) que contienen uno o más puntos de contacto (btManifoldPoint).

Por lo tanto, el enfoque de verificación de colector de contacto de la detección de colisiones implica iterar sobre todos los colectores de contacto y extraer información de ellos y sus puntos de contacto. Esto debe hacerse después de cada paso de simulación.

Un ejemplo lo explicaría mejor.

Cree un nuevo archivo en su espacio de trabajo y asígnele el nombre contact_manifold_check.html. Copie el siguiente código en él para el arranque

```html

<html>
    <head>
        <meta charset="utf-8">
        <title>Collision JS 3D Physics</title>
        <style>
            body { margin: 0; }
        </style>
    </head>
    <body>
        <script src="js/three.js"></script>
        <script src="js/ammo.js"></script>
        <script>

            //variable declaration section
            let physicsWorld, scene, camera, renderer, rigidBodies = [], pos = new THREE.Vector3(), tmpTrans = null;
            let mouseCoords = new THREE.Vector2(), raycaster = new THREE.Raycaster();
            let wall, ball;
            let ttl = 3, ttlCounter = 0, ballInWorld = false;

            const STATE = { DISABLE_DEACTIVATION : 4 };

            //Ammojs Initialization
            Ammo().then(start)

            function start (){

                tmpTrans = new Ammo.btTransform();

                setupPhysicsWorld();

                setupGraphics();

                createWall();

                setupEventHandlers();
                
                renderFrame();

            }

            function setupPhysicsWorld(){

                let collisionConfiguration  = new Ammo.btDefaultCollisionConfiguration(),
                    dispatcher              = new Ammo.btCollisionDispatcher(collisionConfiguration),
                    overlappingPairCache    = new Ammo.btDbvtBroadphase(),
                    solver                  = new Ammo.btSequentialImpulseConstraintSolver();

                physicsWorld           = new Ammo.btDiscreteDynamicsWorld(dispatcher, overlappingPairCache, solver, collisionConfiguration);
                physicsWorld.setGravity(new Ammo.btVector3(0, 0, 0));

            }


            function setupGraphics(){

                //create clock for timing
                clock = new THREE.Clock();

                //create the scene
                scene = new THREE.Scene();
                scene.background = new THREE.Color( 0xabfeff );

                //create camera
                camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.2, 5000 );
                camera.position.set( 0, 20, 50 );
                camera.lookAt(new THREE.Vector3(0, 20, 0));

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

                //update ball time to live if ball in world
                if( ballInWorld ) ttlCounter += deltaTime;

                //if time to live has been exceeded then delete the ball
                if( ttlCounter > ttl ){

                    physicsWorld.removeRigidBody( ball.userData.physicsBody );
                    scene.remove(ball);

                    ttlCounter = 0;
                    ballInWorld = false;

                }

                updatePhysics( deltaTime );

                renderer.render( scene, camera );

                requestAnimationFrame( renderFrame );

            }


            function setupEventHandlers(){

                window.addEventListener( 'resize', onWindowResize, false );
                window.addEventListener( 'mousedown', onMouseDown, false );

            }


            function onWindowResize() {

                camera.aspect = window.innerWidth / window.innerHeight;
                camera.updateProjectionMatrix();

                renderer.setSize( window.innerWidth, window.innerHeight );

            }


            function onMouseDown ( event ) {

                if( ballInWorld ) return;

                mouseCoords.set(  ( event.clientX / window.innerWidth ) * 2 - 1, - ( event.clientY / window.innerHeight ) * 2 + 1 );

                raycaster.setFromCamera( mouseCoords, camera );

                // Create a ball 
                pos.copy( raycaster.ray.direction );
                pos.add( raycaster.ray.origin );

                ball = createBall(pos);
                
                //shoot out the ball
                let ballBody = ball.userData.physicsBody;

                pos.copy( raycaster.ray.direction );
                pos.multiplyScalar( 70 );
                ballBody.setLinearVelocity( new Ammo.btVector3( pos.x, pos.y, pos.z ) );

                ballInWorld = true;

            }


            function createWall(){
                
                let pos = {x: 0, y: 25, z: -15};
                let scale = {x: 50, y: 50, z: 2};
                let quat = {x: 0, y: 0, z: 0, w: 1};
                let mass = 0;

                //threeJS Section
                wall = new THREE.Mesh(new THREE.BoxBufferGeometry(), new THREE.MeshPhongMaterial({color: 0x42f5bf}));

                wall.position.set(pos.x, pos.y, pos.z);
                wall.scale.set(scale.x, scale.y, scale.z);

                wall.castShadow = true;
                wall.receiveShadow = true;

                scene.add(wall);


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

                //Let's overlay the wall with a grid for visual calibration
                const gridHelper = new THREE.GridHelper( 50, 50, 0x1111aa, 0xaa1111 );

                scene.add( gridHelper );

                gridHelper.rotateX( THREE.Math.degToRad(90));
                gridHelper.position.y = 25;
                gridHelper.position.z = -14;

                wall.userData.tag = "wall";
            }


            function createBall(pos){
                
                let radius = 0.8;
                let quat = {x: 0, y: 0, z: 0, w: 1};
                let mass = 35;

                //threeJS Section
                let ball = ballObject = new THREE.Mesh(new THREE.SphereBufferGeometry(radius), new THREE.MeshPhongMaterial({color: 0x05ff1e}));

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

                body.setActivationState( STATE.DISABLE_DEACTIVATION )


                physicsWorld.addRigidBody( body );
                rigidBodies.push(ball);
                
                ball.userData.physicsBody = body;
                ball.userData.tag = "ball";
                
                return ball;
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

Obtenga una vista previa del archivo en su navegador y debería tener algo similar a la imagen de abajo.


Lo que tienes aquí es una pared de rejilla. El mouse se puede mover y al presionar el botón izquierdo del mouse se dispara una bola desde la posición del cursor. Solo se puede disparar una bola a la vez con una vida útil de tres (3) segundos y no hay gravedad. Igualmente, hemos agregado etiquetas a los objetos de malla three.js a través de su propiedad userData: wall.userData.tag = "wall"; y pelota.userData.tag = "pelota"; . Esto es para ayudarnos a identificarlos a lo largo del proceso.

Siéntase libre de explorar el código, lo desarrollaremos para el recordatorio de esta sección.

Nuestra implementación de la verificación del colector de contactos se realizará en dos pasos. Primero detectaremos que ha ocurrido una colisión. A continuación, identificaremos los objetos físicos participantes junto con sus respectivos objetos three.js e igualmente obtendremos información vital sobre la colisión, como la velocidad de los objetos y sus puntos de impacto.

Para detectar si se ha producido una colisión haremos después de cada simulación:

- Obtener el despachador.
- Del despachador obtenga el número de colectores de contacto generados.
- Iterar para obtener cada colector de contacto.
- Para cada colector de contacto, obtenga el número de puntos de contacto que contiene.
- Iterar para obtener cada punto de contacto.
- Para cada punto de contacto obtenga la distancia.
- Por último, registre esta información en la consola.
Volvamos al código para hacer algunas modificaciones.

Después de la definición de updatePhysics (), pegue lo siguiente


```JavaScript
function detectCollision(){

	let dispatcher = physicsWorld.getDispatcher();
	let numManifolds = dispatcher.getNumManifolds();

	for ( let i = 0; i < numManifolds; i ++ ) {

		let contactManifold = dispatcher.getManifoldByIndexInternal( i );
		let numContacts = contactManifold.getNumContacts();

		for ( let j = 0; j < numContacts; j++ ) {

			let contactPoint = contactManifold.getContactPoint( j );
			let distance = contactPoint.getDistance();

			console.log({manifoldIndex: i, contactIndex: j, distance: distance});

		}


	}

}
```

El método anterior, detectCollision(), es casi una implementación línea por línea de los pasos enumerados anteriormente. Agregue una llamada a este método como la última línea de updatePhysics(), con updatePhysics() ahora luciendo así:

```JavaScript
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

	detectCollision();

}
```

Continúe y obtenga una vista previa del trabajo en el navegador. Abra la consola del navegador para ver lo que se imprime cuando la pelota golpea la pared.

Una observación clara de la salida registrada muestra que algunas de las distancias mostradas son mayores que cero. Sí, eso se debe a que los dos objetos pueden estar muy cerca de ser tomados y hay contacto, pero todavía hay una distancia muy pequeña entre ellos. Filtraremos todos esos casos, es decir, todos los puntos de contacto cuya distancia sea mayor que cero.

Dentro de detectCollision(), justo encima de la línea que se registra en la consola, agregue

```
if( distance > 0.0 ) continue;
```

Obtenga una vista previa una vez más en el navegador y observe que ahora solo vemos registros con una distancia menor o igual a cero.

Tu código debería verse así.

Nuestro siguiente paso es identificar los objetos participantes y recuperar información de sus puntos de contacto. Antes de hacerlo, permítanme hacer algunas explicaciones.

En este artículo y los dos anteriores, hemos estado haciendo uso de la propiedad userData de los objetos three.js. Esto hace posible que un usuario agregue propiedades adicionales a un objeto three.js para recuperarlo o usarlo más tarde. Hemos estado usando esto para almacenar una referencia a los objetos ammo.js en sus respectivos objetos three.js;

```
ball.userData.physicsBody = ballPhysicsBody;
```

Con esto podemos recuperar el objeto físico más tarde como se hace en updatePhysics() .

Ammo.js, por otro lado, derivado de su viñeta de proyecto principal, también tiene una forma de agregar la referencia de un objeto de usuario a un objeto físico. Eso significa que también podemos hacer que nuestros objetos físicos hagan referencia a su correspondiente objeto three.js. Esto se logra utilizando los métodos setUserPointer() y getUserPointer() de btCollisionObject (clase principal de btRigidBody). Con esto, podemos recuperar nuestros objetos three.js si tenemos los objetos físicos a mano.

Así es como se supone que debe ser. Sin embargo, aprovecharemos la naturaleza de javascript agregando nuestro objeto three.js directamente como una propiedad de los objetos físicos sin setUserPointer() y recuperándolos con la misma facilidad. Si no entiendes nada de esto, continúa con el tutorial, no te perderás nada.

Volver al trabajo.

Recuerda que ahora nos toca identificar los objetos participantes y recuperar información de sus puntos de contacto. lo que haremos es

Establezca los objetos three.js como propiedad de sus objetos físicos correspondientes.
En detectCollision(), para cada variedad de contactos, recupere los dos objetos físicos participantes y su objeto three.js asociado.
Para cada punto de contacto de la variedad de contacto, obtenga la velocidad de los objetos participantes, así como su posición de contacto.
Finalmente registre esta información en la consola.
Pasando al código. Continúe con createWall() y agregue la siguiente línea de código como su última línea.


```
body.threeObject = wall;
```

También en createBall() agregue el siguiente código antes de la declaración de devolución

```
body.threeObject = ball;
```

Esto establece la referencia de nuestros objetos three.js como propiedades de sus objetos físicos correspondientes.

Ahora muévase a detectCollision(), inmediatamente después de la línea que tiene

```
let contactManifold = dispatcher.getManifoldByIndexInternal( i );
```

agregar

```JavaScript
let rb0 = Ammo.castObject( contactManifold.getBody0(), Ammo.btRigidBody );
let rb1 = Ammo.castObject( contactManifold.getBody1(), Ammo.btRigidBody );
let threeObject0 = rb0.threeObject;
let threeObject1 = rb1.threeObject;
if ( ! threeObject0 && ! threeObject1 ) continue;
let userData0 = threeObject0 ? threeObject0.userData : null;
let userData1 = threeObject1 ? threeObject1.userData : null;
let tag0 = userData0 ? userData0.tag : "none";
let tag1 = userData1 ? userData1.tag : "none";
```

En el fragmento de código anterior, los objetos físicos se recuperan mediante getBody0() y getBody1(), después de lo cual se obtienen sus correspondientes objetos three.js. Para estos objetos three.js recuperamos su valor de etiqueta. Me gustaría señalar que tanto getBody0() como getBody1() devuelven un btCollisionObject, por lo que los lanzamos a btRigidBody.

Todavía en detectCollision(), después de la línea de código que tiene

```
if( distance > 0.0 ) continue;
```

agregar

```Javascript
let velocity0 = rb0.getLinearVelocity();
let velocity1 = rb1.getLinearVelocity();
let worldPos0 = contactPoint.get_m_positionWorldOnA();
let worldPos1 = contactPoint.get_m_positionWorldOnB();
let localPos0 = contactPoint.get_m_localPointA();
let localPos1 = contactPoint.get_m_localPointB();
```

Finalmente, reemplace la línea de registro de la consola que es

```
console.log({manifoldIndex: i, contactIndex: j, distance: distance});
```

con

```Javascript
console.log({
 manifoldIndex: i, 
 contactIndex: j, 
 distance: distance, 
 object0:{
  tag: tag0,
  velocity: {x: velocity0.x(), y: velocity0.y(), z: velocity0.z()},
  worldPos: {x: worldPos0.x(), y: worldPos0.y(), z: worldPos0.z()},
  localPos: {x: localPos0.x(), y: localPos0.y(), z: localPos0.z()}
 },
 object1:{
  tag: tag1,
  velocity: {x: velocity1.x(), y: velocity1.y(), z: velocity1.z()},
  worldPos: {x: worldPos1.x(), y: worldPos1.y(), z: worldPos1.z()},
  localPos: {x: localPos1.x(), y: localPos1.y(), z: localPos1.z()}
 }
});
```

Tu trabajo debería verse así

Pausa para un poco de reflexión. El código se explica bastante bien.

Vea lo que ha hecho hasta ahora en el navegador, dispare una pelota contra la pared y observe la información registrada. Ahora debería poder ver más detalles de la colisión, como los dos objetos involucrados, sus puntos de colisión y sus velocidades.

Eso es todo para la verificación del múltiple de contacto. Ahora depende de usted agregar más implementaciones para satisfacer sus necesidades.

## Prueba de contacto

Ammo.js le permite “realizar una consulta instantánea en el mundo (btCollisionWorld o btDiscreteDynamicsWorld) utilizando la consulta contactTest. La consulta contactTest realizará una prueba de colisión contra todos los objetos superpuestos en el mundo y producirá los resultados mediante una devolución de llamada. El objeto de consulta no necesita ser parte del mundo”.

Básicamente, con contactTest puede verificar si un objeto físico en particular (objeto de consulta u objeto de destino) está colisionando o haciendo contacto con cualquier otro objeto en el mundo. Al ser un método del mundo de la física, contactTest toma como parámetros el objeto de consulta y un objeto de devolución de llamada para manejar los resultados del contacto.

“Una ventaja de este método es que puede realizar pruebas de colisión con una resolución temporal reducida si no necesita pruebas de colisión en cada tic de la física”. Por ejemplo, es posible que desee verificar la colisión solo al hacer clic con el mouse o al presionar la tecla. Tal vez en tu juego no quieras que el personaje salte cuando esté en el aire, por lo que cada vez que se presiona la tecla de salto, se invoca la prueba de contacto para verificar si el personaje está en contacto con algún objeto físico.

“Sin embargo, una desventaja es que la detección de colisiones se duplica para el objeto de destino (si ya existe en el mundo), por lo que las pruebas de colisión frecuentes o generalizadas pueden volverse menos eficientes que iterar sobre pares de colisiones generados previamente”. Nada le impide llamar a contactTest después de cada paso de simulación o incluso varias veces en un segundo. Pero si el objeto de consulta es parte del mundo y desea verificar el contacto o la colisión en cada paso de la simulación, entonces es mejor que use la verificación múltiple de contacto.

## ConcreteContactResultCallback

Como se mencionó anteriormente, contactTest toma un objeto de devolución de llamada como parte de sus parámetros para manejar los resultados de los contactos. Este objeto de devolución de llamada en ammo.js es ConcreteContactResultCallback. Para usarlo, tendría que agregar una implementación para su método addSingleResult(), que es lo que se llama cuando hay contacto.

Entrenemos un ejemplo.

Cree un nuevo archivo llamado contact_test.html, luego copie y pegue el siguiente código:

```html

<html>
    <head>
        <meta charset="utf-8">
        <title>Collision JS 3D Physics</title>
        <style>
            body { margin: 0; }
        </style>
    </head>
    <body>
        <script src="js/three.js"></script>
        <script src="js/ammo.js"></script>
        <script>

            //variable declaration section
            let physicsWorld, scene, camera, renderer, rigidBodies = [], pos = new THREE.Vector3(), tmpTrans = null;
            let ball, moveDirection = { left: 0, right: 0, forward: 0, back: 0, up: 0, down: 0 };

            const STATE = { DISABLE_DEACTIVATION : 4 };

            //Ammojs Initialization
            Ammo().then(start)

            function start (){

                tmpTrans = new Ammo.btTransform();

                setupPhysicsWorld();

                setupGraphics();

                createFloorTiles();

                createBall();

                setupEventHandlers();
                
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
                scene.background = new THREE.Color( 0xabfeff );

                //create camera
                camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.2, 5000 );
                camera.position.set( 0, 80, 40 );
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

                moveBall();

                updatePhysics( deltaTime );

                renderer.render( scene, camera );

                requestAnimationFrame( renderFrame );

            }


            function setupEventHandlers(){

                window.addEventListener( 'resize', onWindowResize, false );
                window.addEventListener( 'keydown', handleKeyDown, false);
                window.addEventListener( 'keyup', handleKeyUp, false);

            }


            function onWindowResize() {

                camera.aspect = window.innerWidth / window.innerHeight;
                camera.updateProjectionMatrix();

                renderer.setSize( window.innerWidth, window.innerHeight );

            }

            
            function handleKeyDown(event){

                let keyCode = event.keyCode;

                switch(keyCode){

                    case 87: //W: FORWARD
                        moveDirection.forward = 1;
                        break;
                        
                    case 83: //S: BACK
                        moveDirection.back = 1;
                        break;
                        
                    case 65: //A: LEFT
                        moveDirection.left = 1;
                        break;
                        
                    case 68: //D: RIGHT
                        moveDirection.right = 1;
                        break;

                    case 84://T
                        checkContact();
                        break;
                        
                }
            }


            function handleKeyUp(event){
                let keyCode = event.keyCode;

                switch(keyCode){
                    case 87: //W: FORWARD
                        moveDirection.forward = 0;
                        break;
                        
                    case 83: //S: BACK
                        moveDirection.back = 0;
                        break;
                        
                    case 65: //A: LEFT
                        moveDirection.left = 0;
                        break;
                        
                    case 68: //D: RIGHT
                        moveDirection.right = 0;
                        break;
                }

            }


            function createFloorTiles(){
                let tiles = [
                    { name: "yellow", color: 0xFFFF00, pos: {x: -20, y: 0, z: 20} },
                    { name: "red", color: 0xFF0000, pos: {x: 20, y: 0, z: 20} },
                    { name: "green", color: 0x008000, pos: {x: 20, y: 0, z: -20} },
                    { name: "blue", color: 0x0000FF, pos: {x: -20, y: 0, z: -20} }
                ]
                
                let scale = {x: 40, y: 6, z: 40};
                let quat = {x: 0, y: 0, z: 0, w: 1};
                let mass = 0;

                for (const tile of tiles) {
                        
                    //threeJS Section
                    let pos = tile.pos;
                    let mesh = new THREE.Mesh(new THREE.BoxBufferGeometry(), new THREE.MeshPhongMaterial({color: tile.color}));

                    mesh.position.set(pos.x, pos.y, pos.z);
                    mesh.scale.set(scale.x, scale.y, scale.z);

                    mesh.castShadow = true;
                    mesh.receiveShadow = true;

                    mesh.userData.tag = tile.name;

                    scene.add(mesh);


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

                    body.threeObject = mesh;

                }

            }


            function createBall(){
                
                let pos = {x: 0, y: 10, z: 0};
                let radius = 1.5;
                let quat = {x: 0, y: 0, z: 0, w: 1};
                let mass = 1;

                //threeJS Section
                ball = ballObject = new THREE.Mesh(new THREE.SphereBufferGeometry(radius), new THREE.MeshPhongMaterial({color: 0x800080}));

                ball.position.set(pos.x, pos.y, pos.z);
                
                ball.castShadow = true;
                ball.receiveShadow = true;
                
                ball.userData.tag = "ball";

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

                body.setActivationState( STATE.DISABLE_DEACTIVATION )


                physicsWorld.addRigidBody( body );
                rigidBodies.push(ball);
                
                ball.userData.physicsBody = body;
                
                body.threeObject = ball;
                
            }


            function moveBall(){

                let scalingFactor = 20;

                let moveX =  moveDirection.right - moveDirection.left;
                let moveZ =  moveDirection.back - moveDirection.forward;

                if( moveX == 0 && moveZ == 0) return;

                let resultantImpulse = new Ammo.btVector3( moveX, 0, moveZ )
                resultantImpulse.op_mul(scalingFactor);

                let physicsBody = ball.userData.physicsBody;
                physicsBody.setLinearVelocity( resultantImpulse );

            }


            function checkContact(){

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

La vista previa del archivo en el navegador mostraría algo como


Lo que tenemos aquí es un suelo formado por cuatro fichas de colores y una bola que se puede mover con las teclas WASD. Tenga cuidado de no caerse del borde.

Al revisar el código, notará que los objetos físicos ya tienen una referencia a sus contrapartes three.js agregada como propiedad threeObject. También notará que agregamos un controlador de tecla abajo para T-key que llama al checkContact() que por ahora no hace nada.

Nuestro objetivo es identificar el mosaico que se encuentra debajo de la pelota junto con sus posiciones locales y mundiales. Esto puede parecer muy simple, pero es suficiente para demostrar los conceptos básicos de contactTest. No olvide abrir la consola de su navegador, mostraremos información allí.

Primero, creemos nuestro objeto ConcreteContactResultCallback y agreguemos una implementación para su método addSingleResult(). Dirígete a la sección de declaración de variables en la parte superior del código y agrega

```
let cbContactResult;
```

Este será el identificador de nuestro objeto ConcreteContactResultCallback.

Próximo. Antes de agregar la definición moveBall()

```javascript
unction setupContactResultCallback(){

	cbContactResult = new Ammo.ConcreteContactResultCallback();

	cbContactResult.addSingleResult = function(cp, colObj0Wrap, partId0, index0, colObj1Wrap, partId1, index1){

		let contactPoint = Ammo.wrapPointer( cp, Ammo.btManifoldPoint );

		const distance = contactPoint.getDistance();

		if( distance > 0 ) return;

		let colWrapper0 = Ammo.wrapPointer( colObj0Wrap, Ammo.btCollisionObjectWrapper );
		let rb0 = Ammo.castObject( colWrapper0.getCollisionObject(), Ammo.btRigidBody );

		let colWrapper1 = Ammo.wrapPointer( colObj1Wrap, Ammo.btCollisionObjectWrapper );
		let rb1 = Ammo.castObject( colWrapper1.getCollisionObject(), Ammo.btRigidBody );

		let threeObject0 = rb0.threeObject;
		let threeObject1 = rb1.threeObject;

		let tag, localPos, worldPos

		if( threeObject0.userData.tag != "ball" ){

			tag = threeObject0.userData.tag;
			localPos = contactPoint.get_m_localPointA();
			worldPos = contactPoint.get_m_positionWorldOnA();

		}
		else{

			tag = threeObject1.userData.tag;
			localPos = contactPoint.get_m_localPointB();
			worldPos = contactPoint.get_m_positionWorldOnB();

		}

		let localPosDisplay = {x: localPos.x(), y: localPos.y(), z: localPos.z()};
		let worldPosDisplay = {x: worldPos.x(), y: worldPos.y(), z: worldPos.z()};

		console.log( { tag, localPosDisplay, worldPosDisplay } );

	}

}
```

Pausa. Hagamos algunas explicaciones. Tenga en cuenta nuestra implementación de addSingleResult() arriba. La firma del método requerido es


```JavaScript
float addSingleResult( 
      [Ref] btManifoldPoint cp, 
      [Const] btCollisionObjectWrapper colObj0Wrap, 
      long partId0, 
      long index0, 
      [Const] btCollisionObjectWrapper colObj1Wrap, 
      long partId1, 
      long index1 )
```

Para cada contacto realizado, el mundo de la física llamará a addSingleResult() con valores para los parámetros (el valor de retorno es insignificante). cp es un identificador del punto de contacto, mientras que colObj0Wrap y colObj1Wrap son identificadores de envoltorios de objetos de colisión desde los que podemos recuperar los objetos participantes. Debido a que ammo.js se transfirió desde bullet con la ayuda de emscripten, estos valores, que se supone que son objetos ammo.js, en realidad se pasan como lo que podemos llamar punteros. Para obtener los valores reales, tendríamos que emplear el método wrapPointer() que viene con ammo.js (puede leer más sobre esto aquí).

Los parámetros restantes partId0, index0, partId1 e index1 no tienen ningún uso real para nosotros. Para ser honesto, lo más cercano que conozco de su uso es algo así como "combinador de material por triángulo / material personalizado" y estoy muy seguro de que no necesitaríamos eso.

Nuestra implementación de addSingleResult() es sencilla y comprensible:

- Obtenga la distancia desde el punto de contacto y salga si la distancia es mayor que cero.
- Obtén los objetos físicos participantes.
- De ellos obtienen sus respectivos objetos three.js.
- Teniendo en cuenta que estamos justo después de las fichas, buscamos el objeto three.js que no es la pelota y asignamos las variables apropiadamente.
- Finalmente, con algo de formato, registramos la información en la consola.

Todavía no es el momento de la vista previa. Vaya al método start(), después de la llamada a createBall() agregue:

```
setupContactResultCallback();
```

Muévete a checkContact() y agrega


```
physicsWorld.contactTest( ball.userData.physicsBody , cbContactResult );
```

Esto llama a contactTest() del mundo de la física para realizar la detección de colisión contra el objeto físico de la pelota. Cualquier resultado se pasará a addSingleResult() de cbContactResult.

Con todo dicho y hecho, deberías tener un código similar a este.

Obtenga una vista previa en el navegador, mueva la pelota, presione la tecla T y observe la información que se muestra en la consola.

Eso es todo lo que necesita saber sobre contactTest, tómese su tiempo para revisar lo que hemos hecho. Como siempre, te queda a ti implementar lo que quieras, lo que hemos hecho es mostrarte cómo.

Recuerde que su objeto de consulta (en nuestro caso, la pelota) no tiene que ser parte del mundo de la física para que contactTest funcione. Sin embargo, tendría que actualizar la transformación usted mismo para obtener resultados precisos.

## ContactoPairPrueba

Esto es similar a contactTest, excepto que deberá proporcionar dos objetos físicos para verificar el contacto entre ellos. Los parámetros de contactPairTest son los dos objetos de colisión y un objeto de devolución de llamada para manejar los resultados de contacto.

Al igual que con contactTest, los dos objetos físicos no necesitan ser parte del mundo físico.

Para demostrar la prueba de pares de contactos, continuaremos con nuestro código de contactTest.

Nuestro objetivo es que la bola salte cuando se presiona la tecla J, pero solo en el mosaico rojo. Para lograr esto, en la función de salto, primero consultamos el mundo de la física en busca de contacto específicamente entre la pelota y la ficha roja. Si existe, haremos que la bola salte, sino no pasa nada.

Regresa a nuestro código. Justo en la sección de declaración de variables debajo de la línea que ha dejado cbContactResult; agregar

```
let redTile, cbContactPairResult;
```

redTile será el identificador del mosaico rojo, mientras que cbContactPairResult, al igual que cbContactResult, será nuestro objeto de devolución de llamada para contactPairTest.

Para fijar el tirador de la teja roja, haríamos unas modificaciones no tan limpias pero perdonables. Vaya al método createFloorTiles(), en la última línea del bucle for..of add

```
if( tile.name == "red"){
  mesh.userData.physicsBody = body;
  redTile = mesh;
}
```

A continuación, creemos nuestra devolución de llamada. Después de copiar y pegar la definición setupContactResultCallback()


```Javascript
function setupContactPairResultCallback(){

	cbContactPairResult = new Ammo.ConcreteContactResultCallback();

	cbContactPairResult.hasContact = false;

	cbContactPairResult.addSingleResult = function(cp, colObj0Wrap, partId0, index0, colObj1Wrap, partId1, index1){

		let contactPoint = Ammo.wrapPointer( cp, Ammo.btManifoldPoint );

		const distance = contactPoint.getDistance();

		if( distance > 0 ) return;

		this.hasContact = true;

	}

}
```

Todo lo que queremos es que addSingleResult() establezca el valor de hasContact siempre que haya contacto. Tenga en cuenta que hasContact no existe en ConcreteContactResultCallback, solo lo agregamos nosotros mismos como una propiedad.

Antes de pasar a la siguiente modificación, agregue una llamada a setupContactPairResultCallback() dentro de start() justo después de setupContactResultCallback().

Ahora a la función de salto. Pegue el siguiente código antes de la definición de updatePhysics()

```Javascript
function jump(){

  cbContactPairResult.hasContact = false;

  physicsWorld.contactPairTest(ball.userData.physicsBody, redTile.userData.physicsBody, cbContactPairResult);

  if( !cbContactPairResult.hasContact ) return;

  let jumpImpulse = new Ammo.btVector3( 0, 15, 0 );

  let physicsBody = ball.userData.physicsBody;
  physicsBody.setLinearVelocity( jumpImpulse );

}
```

En el método anterior, primero restablecemos la propiedad hasContact de cbContactPairResult a falso y luego llamamos contactPairTest() del mundo de la física. El resto del código habla por sí solo.

Por último, debemos modificar el controlador de pulsación de tecla para llamar a jump() cuando se presiona la tecla J. Agregue lo siguiente como una nueva entrada de caso a la estructura switch..case de handleKeyDown(), preferiblemente que sea la última

```
case 74://J
  jump();
  break;
```

handleKeyDown() ahora debería verse como

```JavaScript
function handleKeyDown(event){

	let keyCode = event.keyCode;

	switch(keyCode){

		case 87: //W: FORWARD
			moveDirection.forward = 1;
			break;
			
		case 83: //S: BACK
			moveDirection.back = 1;
			break;
			
		case 65: //A: LEFT
			moveDirection.left = 1;
			break;
			
		case 68: //D: RIGHT
			moveDirection.right = 1;
			break;

		case 84://T
			checkContact();
			break;
			
		case 74://J
			jump();
			break;
      
	}
}
```

Se supone que su código final se verá así.

Obtenga una vista previa del trabajo en un navegador, mueva la bola y presione la tecla J para saltar. Observe que la pelota solo salta cuando está en el mosaico rojo.

Ahí tienes; una implementación de contactPairTest.

Conclusión
¡¡Guau!! Qué viaje.

Siéntete libre de modificar los códigos, explorar y experimentar como quieras. No olvides consultar ammo.idl, incluido en el repositorio ammo.js, para saber más sobre las clases e interfaces que proporciona ammo.js.

Si hay algún error háganmelo saber, estaré encantado de corregirlo. Eso es todo por ahora y espero haberte ayudado.

Salud.
