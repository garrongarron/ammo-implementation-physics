import init, { animate } from "./Init";

Ammo().then(function (AmmoLib) {

    Ammo = AmmoLib;

    init();
    animate();

});