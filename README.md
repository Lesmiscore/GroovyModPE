# GroovyModPE
brings you Groovy into BlockLauncher

## Compilation
Please install [Gradle](https://gradle.org) for compilation.    
Change the current directory where this repo cloned, and type this on command line: `gradle mergeJavascript`     
You'll see `GroovyModPE.js` at `Repo Directory/build/` (Please just ignore other files.)    

## Usage
Just import `GroovyModPE.js` into [BlockLauncher](https://play.google.com/store/apps/details?id=net.zhuoweizhang.mcpelauncher).    
Place your groovy file at `SD card or internal storage/games/com.mojang/groovyMods/`.    
Files starting with `.`(dot) will be ignored.

## Basic coding

For Groovy language grammar, please search yourself.

### Defining hooks

```groovy
hooks.newLevel={->

}
```
In this case, `newLevel` is the name of hook. This is a hook name from BlockLauncher.    
`{...->` is argument list.    


### Calling methods from BlockLauncher

```groovy
clientMessage('This is a message from Groovy mod.')
```

Just do the same thing as Javascript do.    
You can call functions in objects. (e.g. ModPE, Block)

```groovy
Entity.getAll()
```

### Getting `Activity`(Context) object

`com.mojang.minecraftpe.MainActivity.currentMainActivity.get()` is too long to use, so there's alternative way.
Use `context` to get Context object instead.

```groovy
import android.app.AlertDialog

def dialog=new AlertDialog.Builder(context)
dialog.message='I give you a pen from Groovy script'
dialog.show()
```

### Using `ConfigSlurper`
Android uses `Dalvik` to execute Android application, so using `ConfigSlurper` directly would give you an error.    
To compile your groovy script dynamically, use `createScript` method.

```groovy
def cs=new ConfigSlurper()
def obj=cs.parse(createScript('value="A script inside script"'))
print(obj)
```

## Attention
All the code is not tested yet: I can't trust that it works well.    
Please be careful.    
Compiled code will be released when it finishes.
