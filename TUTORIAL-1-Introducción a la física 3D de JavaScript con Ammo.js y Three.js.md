# Introducción a la física 3D de JavaScript con Ammo.js y Three.js

Este artículo es una adaptación de JavaScript de un artículo similar que escribí anteriormente para Bullet Physics y el motor de juego Urho3D (que se puede encontrar aquí). También sirve como la primera parte de mis tutoriales de física 3D de Javascript usando ammojs y threejs, la segunda parte es "Mover objetos en física 3D de JavaScript usando Ammo.js y Three.js" y la tercera "Detección de colisiones en física 3D de Javascript usando munición". .js y Tres.js”


Con la llegada de WebGL, la web se ha abierto a otra dimensión de posibilidades: gráficos 3D e interactividad. Esto es enorme con tantas oportunidades en el área de los juegos y la visualización inmersiva.

Equally, its good to know that some of the concepts that were available off the web in terms of interactivity are now right here with us, for example 3D physics.

Digamos que quieres hacer un juego de bolos. Tienes la bola y los bolos dispuestos. Pero el problema es que tendrías que codificar todos los pasos involucrados en hacer rodar la bola y que la bola derribe los bolos. Así que se dispuso a codificar la dinámica involucrada: cómo rodará la pelota en el piso, su colisión con los bolos, la fuerza de la colisión, cómo chocarán los bolos entre sí, etc. Antes de que termines, ya estás lamentando por qué no prestaste atención a la Física Mecánica en la escuela.

Bueno, antes de que empieces a arrepentirte, es probable que algunas personas también se hayan arrepentido y hayan encontrado una solución, Physics Engines. Un motor de física es un software, un grupo de códigos o una colección de objetos y algoritmos que proporciona funciones para la simulación de un mundo físico, ya sea en juegos u otra aplicación de realidad virtual. No tienes que estresarte codificando el movimiento de una bola de boliche o cómo choca con los bolos cuando puedes representarlos con objetos físicos y las acciones simuladas de una manera realista.

¿Qué desea hacer? ¿Es un juego de catapulta como AngryBirds o un juego de disparos o incluso quieres crear tu propio juego de fútbol? Physics Engines lo tiene bien cubierto.

Hay un puñado de motores de física de JavaScript disponibles, no tiene que creerme, búsquelo en Google. Tenemos Matter.js, Planck.js, Cannon.js, Box2Djs, Oimojs y Ammojs. Estas son algunas de las de código abierto que podemos obtener una vez y todavía hay otras que ni siquiera conocemos, algunas principalmente porque son herramientas internas. Algunas de las bibliotecas mencionadas anteriormente son para simulación física bidimensional, mientras que otras como Cannonjs, Oimojs y Ammojs son para simulación tridimensional.

Para este artículo/tutorial, trabajaremos con Ammojs (escrito como ammo.js de ahora en adelante). Ammo.js tiene un pedigrí interesante, en realidad es un puerto JavaScript directo de Bullet3D, un motor de física basado en C++. Habiendo trabajado con Bullet3D durante años, me ha impresionado su rendimiento y facilidad de uso. Lo suficientemente bueno, algunos de estos atributos se reflejan igualmente en ammo.js.

Aprovecharemos los poderes mágicos de three.js para nuestros gráficos 3D. Búscalo en threejs.org

DESCARGO DE RESPONSABILIDAD: Este no es un tutorial sobre three.js, sino una simple introducción a la física 3D de JavaScript con ammoj.s como caso de estudio. También tenga en cuenta que esto no es exclusivo de three.js, también se puede usar para otras bibliotecas 3D de JavaScript, por ejemplo, BabylonJS

## ES UN MUNDO FÍSICO


Para usar un motor de física como ammo.js, hay ciertas cosas que debe comprender:

- Mundo de la Física: Tiene que haber un mundo que obedezca las leyes de la física excepto que estás en un Universo paralelo que tiene su propio conjunto de Leyes Físicas. En ammo.js este mundo se llama Collision World y tiene entre sus derivados el Dynamic World. El mundo de la física tiene opciones para establecer la gravedad y expone funciones y objetos para que sea posible lo siguiente.

- Dinámica de cuerpos rígidos: la fuerza, la masa, la inercia, la velocidad y las limitaciones del mundo. En un juego de snooker, tomas un tiro, la bola blanca rueda y golpea contra la bola, que rueda gradualmente antes de detenerse. O le disparó a un poste de señal colgante y se balanceó.

- Filtrado y detección de colisiones: el filtrado de colisiones establece qué objetos deben colisionar y cuáles no. Como un 1Up que aparece y los enemigos pueden atravesarlo sin absorberlo, pero tu personaje pasa y lo recoge. Por otro lado, Collision Detection se trata de detectar cuando dos objetos chocan, por ejemplo, para que puedas deducir la salud de un monstruo cuando tu espada lo atraviesa.
- Restricciones: Di juntas

Repasaremos los conceptos presentados anteriormente con ejemplos.

## CONFIGURACIÓN DEL ESPACIO DE TRABAJO

Primero, obtenga las bibliotecas para threejs y ammojs. Threejs se puede obtener de https://threejs.org/build/three.js mientras que para ammojs, descargue el repositorio de https://github.com/kripken/ammo.js y vaya a la carpeta de compilación para el archivo ammo.js .

Cree su carpeta de proyecto y asígnele el nombre que desee. En él, cree un archivo index.html y una carpeta "js" que contenga los archivos three.js y ammo.js que obtuvo. Abra el archivo index.html en su IDE preferido y pegue el siguiente código en él.


```HTML
<html>
    <head>
        <meta charset="utf-8">
        <title>JS 3D Physics</title>
        <style>
            body { margin: 0; }
        </style>
    </head>
    <body>
        <script src="js/three.js"></script>
        <script src="js/ammo.js"></script>
        <script>

            //variable declaration

            //Ammojs Initialization
            Ammo().then( start )
            
            function start(){

                //code goes here

            }
        
        </script>
    </body>
</html>
```

Nada especial en el código, solo su html y JavaScript habituales, excepto por la parte donde ammo.js se inicializa a través de Ammo(), un método que devuelve una promesa. Esto asegura que todo lo necesario que necesita ammo.js se inicialice y esté listo para funcionar para siempre. También notará un comentario que especifica la sección de declaración de variables, lo usaremos muy pronto.

Al ejecutar el código en el navegador, probablemente no verá nada. Abra la consola de su navegador, si no se registra ningún error, entonces está listo para comenzar.

## MUNDO DE LA FÍSICA

Así que primero vamos a crear nuestro mundo físico (físico). Como se dijo anteriormente, aquí es donde ocurrirán nuestras simulaciones físicas.

En la sección de declaración de variables, agregue una declaración para el mundo de la física:

```
let physicsWorld;
```

A continuación, agregue una función para configurar el mundo de la física.


```JavaScript
function setupPhysicsWorld(){

    let collisionConfiguration  = new Ammo.btDefaultCollisionConfiguration(),
        dispatcher              = new Ammo.btCollisionDispatcher(collisionConfiguration),
        overlappingPairCache    = new Ammo.btDbvtBroadphase(),
        solver                  = new Ammo.btSequentialImpulseConstraintSolver();

    physicsWorld           = new Ammo.btDiscreteDynamicsWorld(dispatcher, overlappingPairCache, solver, collisionConfiguration);
    physicsWorld.setGravity(new Ammo.btVector3(0, -10, 0));

}
```

Expliquemos el código anterior (principalmente extraído de la wiki de física de balas ahora desaparecida).

- Ammo.btDbvtBroadphase: Algoritmo de fase amplia a utilizar. El algoritmo de fase ancha generalmente usa los cuadros delimitadores de objetos en el mundo para calcular rápidamente una lista aproximada conservadora de pares en colisión. La lista incluirá todos los pares de objetos que chocan, pero también puede incluir pares de objetos cuyos cuadros delimitadores se intersecan pero aún no están lo suficientemente cerca como para colisionar.

- Ammo.btDefaultCollisionConfiguration: la configuración de colisión le permite ajustar los algoritmos utilizados para la detección de colisión completa (no de fase ancha).

- Ammo.btCollisionDispatcher: puede usar el despachador de colisiones para registrar una devolución de llamada que filtre los proxies de fase amplia superpuestos para que el resto del sistema no procese las colisiones.

- Ammo.btSequentialImpulseConstraintSolver: esto es lo que hace que los objetos interactúen correctamente, teniendo en cuenta la gravedad, las fuerzas proporcionadas por la lógica del juego, las colisiones y las restricciones de las bisagras.

- Ammo.btDiscreteDynamicsWorld: Este es el mundo dinámico, nuestro mundo físico. Viene en otras variantes como Ammo.btSoftRigidDynamicsWorld para simulación de cuerpo blando.

``By now you should have noticed the conventional “bt” prefix in the class names, this was directly gotten from Bullet physics, the parent project.``


Para una introducción básica a la física 3D en JavaScript usando ammo.js, esta debería ser suficiente información que necesita para configurar un mundo físico decente para la simulación. Desde la última línea, podemos ver dónde establecemos la gravedad de nuestro mundo llamando al método setGravity() de physicsWorld y pasando un ammojs vector3 para la gravedad. Existen otros métodos útiles para physicsWorld, uno de esos métodos es stepSimulation() al que pasa el tiempo transcurrido desde que se llamó por última vez. Luego, el mundo ejecuta una simulación por el tiempo transcurrido, actualiza todos sus objetos (se verifican las colisiones, se aplica la dinámica a los cuerpos rígidos, etc.) y realiza otras funciones necesarias.

Ahora volvamos a nuestro código, en el start() vacío agregue una llamada a setupPhysicsWorld();

Su código actual debería tener este aspecto y, al actualizar el navegador, todo debería estar definitivamente bien, incluso en la consola web (aunque todavía no hay elementos visuales).

``CONSEJOS: dado que este tutorial tendrá muchos pasos iterativos con una necesidad directa de actualizar constantemente el navegador, puede tener un servidor de archivos estático, que tiene la capacidad de recargar en el cambio de archivo, manejar esto por usted. Uno de esos servidores es el servidor en vivo https://github.com/tapio/live-server.``

Ahora agreguemos rápidamente un entorno three.js para tener algunas imágenes. En la sección de declaración de variables de su código, agregue una declaración para la escena, la cámara y el renderizador.

```JavaScript
let physicsWorld, scene, camera, renderer;
```

Justo después de la declaración de la función setupPhysicsWorld, agregue los siguientes códigos

```JavaScript
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

    renderer.render( scene, camera );

    requestAnimationFrame( renderFrame );

}
```

Invoque también los métodos recién agregados en el método start()

```Javascript
function start (){
    setupPhysicsWorld();
    setupGraphics();
    renderFrame();
}
```

Lo que hacen estas dos funciones es crear una escena three.js, inicializar el renderizador e iniciar el bucle de renderizado (o bucle de juego).

Su código actual debería verse así ahora y al revisar el navegador deberíamos ver una escena azul pálido.

Todavía no hay mucho que ver, pero acabamos de preparar nuestro mundo para simulaciones de física.


## RIGID BODY AND COLLISION SHAPE

Para que ocurra cualquier forma de interacción física, tiene que haber un cuerpo. En ammo.js, este cuerpo se denomina objeto de colisión o cuerpo rígido (cuerpo rígido se deriva de objeto de colisión). Un cuerpo rígido es lo que se mueve, choca, tiene masa y se le puede aplicar un impulso. Pero por sí solo no tiene forma, más como un fantasma sin caparazón. Necesita una forma para interactuar en colisiones y también para ayudar a calcular su tensor de inercia (distribución de masa). Esto se logra mediante la adición de una forma de colisión. Citando de Bullet wiki

``Cada cuerpo rígido necesita hacer referencia a una forma de colisión. La forma de colisión es solo para colisiones y, por lo tanto, no tiene concepto de masa, inercia, restitución, etc. Si tiene muchos cuerpos que usan la misma forma de colisión [por ejemplo, cada nave espacial en su simulación es una esfera de 5 unidades de radio], es una buena práctica tener solo una forma de colisión Bullet (ammo.js) y compartirla entre todos esos cuerpos...``

``Bullet (ammo.js) admite una gran variedad de formas de colisión diferentes y es posible agregar las suyas propias. Para obtener el mejor rendimiento y calidad, es importante elegir la forma de colisión que se adapte a su propósito``


Algunas de las formas de colisión admitidas son formas primitivas (por ejemplo, caja, esfera, cilindro, cápsula, cono y multiesfera), formas compuestas, malla triangular, casco convexo, plano estático y otras.

Tenga en cuenta que cuando un cuerpo rígido tiene una masa de cero, significa que el cuerpo tiene una masa infinita, por lo tanto, es estático.

## La ilusión de la física

Es importante tener en cuenta que, en la mayoría de los casos, el mundo de la física y sus objetos no forman parte de la escena o del mundo del juego. El mundo de la física es un mundo propio en un reino diferente al de tu juego. Lo que realmente hace el mundo de la física es modelar los objetos físicos de tu escena y su posible interacción utilizando sus propios objetos. Entonces es tu deber actualizar la transformación (posición, rotación, etc.) de tu objeto, especialmente en el bucle principal (juego), en función del estado de su objeto físico correspondiente.

Un ejemplo lo aclarará. Supongamos que tiene un modelo de avión de caja en su escena y desea que una esfera caiga desde una altura sobre él. Tendría que crear un modelo de su escena en el mundo de la física utilizando objetos proporcionados por ammo.js.

El primer paso sería crear el mundo de la física y establecer su gravedad, tal como lo hemos hecho. A continuación, se creará un plano de bloque en three.js para el cual se crea un cuerpo rígido ammo.js correspondiente con una forma de colisión de caja con las mismas dimensiones que el plano de bloque. Como queremos que el plano del bloque sea estático, estableceremos la masa de su cuerpo físico asociado en cero. Para la esfera se aplica el mismo proceso: se creará una esfera en three.js con un cuerpo rígido correspondiente en ammo.js que tendrá una forma de colisión de esfera con las mismas dimensiones que el objeto de esfera de three.js. Como esta esfera es un objeto dinámico, le daremos una masa mayor que cero, digamos 1.

Una vez que hayamos configurado el mundo de la física y su objeto, llamaremos a su función stepSimulation en nuestro bucle de aplicación, que es el método renderFrame. Para cada una de las llamadas, obtenemos la nueva transformación del objeto esfera física (cuerpo rígido) y actualizamos la transformación del objeto esfera tres.js.


``Así es como sucede: mientras Physics World se está ejecutando, estás ocupado extrayendo información de él para actualizar tu escena. Esto también puede ir al revés.``

Prácticas. Vamos a recrear el escenario anterior en código.

A la sección de declaración de variables en la parte superior de su código, agregue

```
rigidBodies = [], tmpTrans;
```
la matriz rigidBodies servirá como una colección para la malla three.js que tiene un objeto físico asociado y que debe actualizarse en cada bucle de renderizado. tmpTrans es para el objeto de transformación temporal ammo.js que reutilizaremos.

El siguiente paso agrega la siguiente línea en la parte superior del método start ()

```
tmpTrans = nueva munición.btTransform();
```
Luego copie las definiciones de métodos a continuación y pegue su código justo después de la definición del método renderFrame:


```JavaScript
function createBlock(){
    
    let pos = {x: 0, y: 0, z: 0};
    let scale = {x: 50, y: 2, z: 50};
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


    physicsWorld.addRigidBody( body );
}


function createBall(){
    
    let pos = {x: 0, y: 20, z: 0};
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
```

en el código anterior tenemos createBlock, que es para crear un plano de bloque, createBall para crear la bola que caerá sobre el bloque y luego updatePhysics para ser llamado en el bucle del juego para ejecutar la simulación física y actualizar los objetos three.js necesarios .

En la sección three.js para createBlock y createBall, tenemos la creación de un plano de bloque y una esfera, respectivamente. Para la sección ammo.js hay bastantes cosas sucediendo allí, así que lo explicaré. Tenga en cuenta que la explicación se aplica a ambos métodos de creación a menos que se indique lo contrario.

Primero creamos y configuramos la transformación de nuestro cuerpo rígido a través del objeto Ammo.btTransform a partir del cual creamos el estado de movimiento. Citando de la wiki de física de Bullet:

``MotionStates es una forma en que Bullet hace todo el trabajo duro para que usted obtenga los objetos que se simulan en la parte de representación de su programa.``


Lo que esto dice en términos simples es que el estado de movimiento almacena el estado/estado del movimiento de sus cuerpos rígidos. Con esto te ayuda a obtener la transformada de un cuerpo físico ya igualarla.

En la siguiente sección del código, se crea una forma de colisión pasando las dimensiones respectivas de los objetos three.js. Forma de caja para el bloque mientras que esfera para la pelota.
Todos estos se pasan como parámetros al objeto de información de construcción de cuerpo rígido. La esencia de este objeto es poder crear múltiples cuerpos rígidos que tengan las mismas propiedades con solo una información de construcción.

Después de eso, tenemos la creación real de los respectivos cuerpos rígidos y luego los agregamos al mundo de la física.

Para el método createBall, después de agregar el cuerpo rígido al mundo de la física, también se agrega a la propiedad del objeto userData de la bola three.js que creamos. Esta bola three.js se agrega a su vez a la matriz rigidBodies para que pueda recuperarse cuando queremos actualizar objetos después de una simulación física, como se explicará en el método updatePhysics a continuación.

Ahora, en el método de física de actualización, el tiempo transcurrido se pasa como parámetro para enviarlo al método de simulación de pasos del mundo de la física. Este método ejecuta una simulación del tiempo transcurrido actualizando las diversas transformaciones de los respectivos cuerpos físicos. Como se señaló anteriormente, ahora es nuestro deber traducir estas actualizaciones de los cuerpos físicos a sus respectivos componentes visuales.

Tomando del código: recorremos la matriz rigidBodies para cada objeto threejs en él, obtenemos su cuerpo rígido ammo.js asociado, obtenemos la transformación mundial, aplicamos la transformación obtenida a la transformación del objeto threejs
, fin (sí, eso es todo).

El último paso que debemos tomar es llamar a los métodos createBlock y createBall en el método de inicio justo después de la llamada al método setupGraphics, y llamar a updatePhysics en el método renderFrame justo antes de la instrucción render.render(…) pasando la variable deltaTime lo.

```Javascript
let deltaTime = clock.getDelta();
//new line of code
updatePhysics( deltaTime );
renderer.render( scene, camera );
requestAnimationFrame( renderFrame );
```

Su código actual debería verse así ahora y, si es así, debería mostrarse un bloque en la pantalla con una bola cayendo hacia él.

## FILTRADO DE COLISIÓN

Una tarea importante en el uso de un motor de física es la capacidad de seleccionar qué conjuntos de objetos colisionan y cuáles no. Por ejemplo, en un juego de disparos, quieres que tu bala golpee a las tropas enemigas pero no a las tropas amigas o estás en un juego de fantasía/místico y puedes lanzar una pared ligeramente transparente para bloquear a un monstruo, pero aún puedes disparar bolas de fuego. a través de la pared.
El ammo.js tiene tres formas fáciles de garantizar que solo ciertos objetos colisionen entre sí: máscaras, devoluciones de llamada de filtro de fase ancha y devoluciones de llamada cercanas. Hablaremos de las máscaras en este artículo.

Cada cuerpo rígido en ammo.js tiene un grupo de colisión de máscaras bit a bit y una máscara de colisión. El grupo de colisión representa el grupo de identidad de colisión del cuerpo rígido, mientras que la máscara de colisión representa otros grupos de identidad de colisión con los que debe colisionar. Supongamos que tenemos dos cuerpos A y B, la colisión entre ellos solo puede ocurrir si una operación AND bit a bit entre la máscara de colisión de A y el grupo de colisión de B es cualquier cosa menos cero y viceversa.

Utilizando los datos proporcionados en la siguiente tabla

//TODO


Haciendo AND la máscara de A, 1 (que es 0001 en forma binaria), con el grupo de B, 3, nos dará 0001 AND 0011 = 0001, que es distinto de cero. Hacerlo al revés usando la máscara de B contra el grupo de A sería 0010 Y 0010 = 0010, que nuevamente es distinto de cero. Dado que la condición distinta de cero se cumplió en ambos sentidos, los cuerpos A y B chocarán. Con este método, también descubrirá que A y C colisionarán por igual, pero no B y C.

Prácticas. Vamos a agregar una bola verde a nuestra escena para demostrar el filtrado de colisiones usando la máscara de colisión.

En la parte superior de su código, justo después de la línea de declaración de variables, agregue

```
let colGroupPlane = 1, colGroupRedBall = 2, colGroupGreenBall = 4
```

esto define los grupos de colisión que usaremos.

A continuación, copie el siguiente método en su código, preferiblemente justo después de la definición del método createBall.

```JavaScript
function createMaskBall(){
    
    let pos = {x: 1, y: 30, z: 0};
    let radius = 2;
    let quat = {x: 0, y: 0, z: 0, w: 1};
    let mass = 1;

    //threeJS Section
    let ball = new THREE.Mesh(new THREE.SphereBufferGeometry(radius), new THREE.MeshPhongMaterial({color: 0x00ff08}));

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


    physicsWorld.addRigidBody( body, colGroupGreenBall, colGroupRedBall);
    
    ball.userData.physicsBody = body;
    rigidBodies.push(ball);
}
```

Al observar de cerca, notará que el código anterior es similar a la definición del método createBall, excepto que la posición del objeto three.js se ha trasladado 30 unidades a lo largo del eje y positivo y 1 unidad a lo largo del eje x positivo. También hay dos parámetros adicionales para la llamada al método physicsWorld.addRigidBody(…). El primero de estos dos parámetros es para el grupo de colisión del cuerpo rígido mientras que el segundo es para la máscara de colisión, es decir, otros grupos de colisión con los que debe colisionar. Para explicar mejor esto, la línea de código
physicsWorld.addRigidBody(cuerpo, colGroupGreenBall, colGroupRedBall);
en realidad está diciendo que al agregar el cuerpo rígido al mundo de la física, pertenezca al grupo de colisión colGroupGreenBall y debe colisionar con el grupo de colisión colGroupRedBall.

A continuación, modifique el método createBlock, reemplace la línea que tiene

```
physicsWorld.addRigidBody(cuerpo);
```

con

```
physicsWorld.addRigidBody( cuerpo, colGroupPlane, colGroupRedBall );
```

Modifique igualmente el método createBall y reemplace la línea que tiene

```
physicsWorld.addRigidBody(cuerpo);
```

con

```
physicsWorld.addRigidBody( body, colGroupRedBall, colGroupPlane | colGroupGreenBall );
```

Para terminar, llame al createMaskBall recién agregado en el método de inicio justo debajo de la llamada al método createBall.

A estas alturas, su código debería parecerse a esto y, al ejecutarlo, debería ver dos bolas, roja y verde, cayendo hacia el plano del bloque, con la bola verde más arriba. Sin embargo, la bola verde choca con la bola roja pero no choca con el bloque y en su lugar cae. Esto se debe a que configuramos el bloque plano y el bloque verde para que solo colisionen con el grupo de bolas rojas y no entre sí, sino que la bola roja colisione con ambos a través de

```
colGroupPlane | colGroupGreenBall
```


## RESTRICCIONES

Articulaciones, eso es en su explicación más simple, sólo articulaciones. Un componente de restricción conecta dos cuerpos rígidos entre sí o conecta un cuerpo rígido a un punto estático en el mundo. A continuación, se muestra una lista de algunas de las restricciones admitidas por ammo.js (imágenes obtenidas del manual Bullet Physics):

- Punto a punto (p2p): la restricción de punto a punto limita la traslación para que los puntos de pivote locales de dos cuerpos rígidos coincidan en el espacio mundial. Una cadena de cuerpos rígidos se puede conectar usando esta restricción.

- Restricción de bisagra: La restricción de bisagra, o articulación giratoria, restringe dos grados de libertad angulares adicionales, por lo que el cuerpo solo puede girar alrededor de un eje, el eje de bisagra. Esto puede ser útil para representar puertas o ruedas que giran alrededor de un eje. El usuario puede especificar límites y motor para la bisagra.

- Restricción del control deslizante: la restricción del control deslizante permite que el cuerpo gire alrededor de un eje y se traslade a lo largo de este eje.

- Restricción de torsión de cono: esta es una restricción especial de punto a punto que agrega límites de eje de cono y torsión. El eje x sirve como eje de giro. Para crear muñecos de trapo, la restricción de torsión del cono es muy útil para extremidades como la parte superior del brazo.

Estaremos demostrando una restricción punto a punto. Esto se logrará creando una esfera y un bloque y luego uniéndolos a través de una restricción p2p con el bloque debajo.

Copie el siguiente código y péguelo justo después de la definición del método createMaskBall.

```JavaScript
function createJointObjects(){
    
    let pos1 = {x: -1, y: 15, z: 0};
    let pos2 = {x: -1, y: 10, z: 0};

    let radius = 2;
    let scale = {x: 5, y: 2, z: 2};
    let quat = {x: 0, y: 0, z: 0, w: 1};
    let mass1 = 0;
    let mass2 = 1;

    let transform = new Ammo.btTransform();

    //Sphere Graphics
    let ball = new THREE.Mesh(new THREE.SphereBufferGeometry(radius), new THREE.MeshPhongMaterial({color: 0xb846db}));

    ball.position.set(pos1.x, pos1.y, pos1.z);

    ball.castShadow = true;
    ball.receiveShadow = true;

    scene.add(ball);


    //Sphere Physics
    transform.setIdentity();
    transform.setOrigin( new Ammo.btVector3( pos1.x, pos1.y, pos1.z ) );
    transform.setRotation( new Ammo.btQuaternion( quat.x, quat.y, quat.z, quat.w ) );
    let motionState = new Ammo.btDefaultMotionState( transform );

    let sphereColShape = new Ammo.btSphereShape( radius );
    sphereColShape.setMargin( 0.05 );

    let localInertia = new Ammo.btVector3( 0, 0, 0 );
    sphereColShape.calculateLocalInertia( mass1, localInertia );

    let rbInfo = new Ammo.btRigidBodyConstructionInfo( mass1, motionState, sphereColShape, localInertia );
    let sphereBody = new Ammo.btRigidBody( rbInfo );

    physicsWorld.addRigidBody( sphereBody, colGroupGreenBall, colGroupRedBall );

    ball.userData.physicsBody = sphereBody;
    rigidBodies.push(ball);
    

    //Block Graphics
    let block = new THREE.Mesh(new THREE.BoxBufferGeometry(), new THREE.MeshPhongMaterial({color: 0xf78a1d}));

    block.position.set(pos2.x, pos2.y, pos2.z);
    block.scale.set(scale.x, scale.y, scale.z);

    block.castShadow = true;
    block.receiveShadow = true;

    scene.add(block);


    //Block Physics
    transform.setIdentity();
    transform.setOrigin( new Ammo.btVector3( pos2.x, pos2.y, pos2.z ) );
    transform.setRotation( new Ammo.btQuaternion( quat.x, quat.y, quat.z, quat.w ) );
    motionState = new Ammo.btDefaultMotionState( transform );

    let blockColShape = new Ammo.btBoxShape( new Ammo.btVector3( scale.x * 0.5, scale.y * 0.5, scale.z * 0.5 ) );
    blockColShape.setMargin( 0.05 );

    localInertia = new Ammo.btVector3( 0, 0, 0 );
    blockColShape.calculateLocalInertia( mass2, localInertia );

    rbInfo = new Ammo.btRigidBodyConstructionInfo( mass2, motionState, blockColShape, localInertia );
    let blockBody = new Ammo.btRigidBody( rbInfo );

    physicsWorld.addRigidBody( blockBody, colGroupGreenBall, colGroupRedBall );
    
    block.userData.physicsBody = blockBody;
    rigidBodies.push(block);



    //Create Joints
    let spherePivot = new Ammo.btVector3( 0, - radius, 0 );
    let blockPivot = new Ammo.btVector3( - scale.x * 0.5, 1, 1 );

    let p2p = new Ammo.btPoint2PointConstraint( sphereBody, blockBody, spherePivot, blockPivot);
    physicsWorld.addConstraint( p2p, false );

}
```

Seguro que la mayor parte debería ser familiar sin mucha explicación. Ahora, en la sección "Crear uniones", básicamente lo que hicimos fue crear un punto de pivote para los objetos respectivos. Aquí es donde se establecería la unión y debería ser relativa al origen del objeto en cuestión. A continuación, se creó una restricción punto a punto pasando a su constructor los dos objetos que se unirían y sus respectivos puntos de pivote. Por último, se agrega al mundo de la física.

Como de costumbre, invoque el método recién agregado llamándolo en el método de inicio justo después de la llamada al método createMaskBall.

Su código final debería tener este aspecto y debería funcionar bien mostrando una esfera con un bloque girando debajo.

¡¡Uf!!. Eso es todo.

Siéntase libre de explorar y hackear los ejemplos incluidos en el repositorio ammo.js. Del mismo modo, puede consultar el archivo ammo.idl también en el repositorio para conocer las clases e interfaces de Bullet adicionales expuestas a JavaScript en ammo.js.

Cuando esté listo para comenzar, pase a la segunda parte de este tutorial Mover objetos en JavaScript 3D Physics usando Ammo.js y Three.js

Codificación feliz.