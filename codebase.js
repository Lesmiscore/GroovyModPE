/*
 * GroovyModPE: brings you Groovy into BlockLauncher
 */

var io = java.io;
var lang = java.lang;
var ctx = com.mojang.minecraftpe.MainActivity.currentMainActivity.get();
var strCls = lang.Class.forName("java.lang.String");
//CLASSLOADER AREA
/*Base 64 string of the DEX file*/
var dex = "<DEX BINARY HERE>";
var array = android.util.Base64.decode(dex, 0);
var fi = io.File(ctx.getFilesDir(), "groovy_mod_pe.dex");
var fos;
try {
    fos = io.FileOutputStream(fi);
    fos.write(array);
} finally {
    if (fos) fos.close();
}
var dcodedir;
if ((android.os.Build.VERSION.SDK_INT - 21) < 0) {
    dcodedir = ctx.getDir("optimizedDex", 0);/*Older Android(~4.4W)*/
} else {
    dcodedir = ctx.getCodeCacheDir();/*Newer Android(5.0~)*/
}
var constClasses = lang.reflect.Array.newInstance(lang.Class.forName("java.lang.Class"), 4);
constClasses[0] = constClasses[1] = constClasses[2] = strCls;
constClasses[3] = lang.Class.forName("java.lang.ClassLoader");
var argsObjects = lang.reflect.Array.newInstance(lang.Class.forName("java.lang.Object"), 4);
argsObjects[0] = fi.toString();
argsObjects[1] = dcodedir.toString();
argsObjects[2] = null;
argsObjects[3] = ctx.getClassLoader();
var dxc = lang.Class.forName("dalvik.system.DexClassLoader")
    .getConstructor(constClasses)
    .newInstance(argsObjects);
//The main object in the DEX file.
var constClasses = lang.reflect.Array.newInstance(lang.Class.forName("java.lang.Class"), 0);
var argsObjects = lang.reflect.Array.newInstance(lang.Class.forName("java.lang.Object"), 0);
var entrance = dxc.loadClass("com.nao20010128nao.GroovyModPE.Entrance").getConstructor(constClasses).newInstance(argsObjects);

// Capture some objects from BlockLauncher
for(var variable:["addItemInventory","bl_setMobSkin","bl_spawnMob","clientMessage","explode","getCarriedItem","getLevel","getPitch","getPlayerEnt","getPlayerX","getPlayerY","getPlayerZ","getTile","getYaw","preventDefault","print","rideAnimal","setNightMode","setPosition","setPositionRelative","setRot","setTile","setVelX","setVelY","setVelZ","spawnChicken","spawnCow","spawnPigZombie","ModPE","Level","Player","Entity","Item","Block","Server","ChatColor","ItemCategory","ParticleType","EntityType","EntityRenderType","ArmorType","MobEffect","DimensionId","BlockFace","UseAnimation","Enchantment","EnchantType","BlockRenderLayer"]){
    entrance.getModPeValues.put(variable,eval(variable));
}

// Capture hooks
var hooksScript="";
for(var hook:["attackHook","chatHook","continueDestroyBlock","destroyBlock","projectileHitEntityHook","eatHook","entityAddedHook","entityHurtHook","entityRemovedHook","explodeHook","serverMessageReceiveHook","deathHook","playerAddExpHook","playerExpLevelChangeHook","redstoneUpdateHook","screenChangeHook","newLevel","startDestroyBlock","projectileHitBlockHook","modTick","useItem"]){
    hooksScript+="function "+hook+"(){entrance.callHooks(\""+hook+"\",arguments);};";
}
eval(hooksScript);

// Load mods
entrance.execLoadMods(ctx);
