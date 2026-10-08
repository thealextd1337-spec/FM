(() => {
 'use strict';
 const ns=window.D6Flutlicht=window.D6Flutlicht||{},packages=new Map(),cleanups=new WeakMap();
 ns.registry=Object.freeze({register(pkg){if(!pkg?.id||typeof pkg.enhance!=='function'||packages.has(pkg.id))throw new Error('Invalid or duplicate Flutlicht package');packages.set(pkg.id,pkg);},enhance(root,projection,actions){let owned=cleanups.get(root);if(!owned){owned=new Map();cleanups.set(root,owned);}for(const pkg of packages.values()){const cleanup=pkg.enhance(root,projection,actions);if(typeof cleanup==='function')owned.set(pkg.id,cleanup);}},dispose(root){for(const cleanup of cleanups.get(root)?.values()||[])cleanup();cleanups.delete(root);},ids(){return [...packages.keys()];}});
})();
