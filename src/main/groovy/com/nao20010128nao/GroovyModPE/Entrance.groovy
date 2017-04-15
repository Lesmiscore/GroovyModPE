package com.nao20010128nao.GroovyModPE

import android.app.AlertDialog
import android.content.ClipboardManager
import android.content.Context
import android.os.Environment
import com.google.common.collect.HashMultimap
import com.google.common.collect.Multimap
import com.nao20010128nao.RhinoToGroovy.GroovyObjectAdapter
import me.champeau.groovydroid.GrooidShell
import org.mozilla.javascript.Function
import org.mozilla.javascript.Scriptable

/**
 * Created by nao on 2017/04/16.
 */
class Entrance {
    Map<String,Scriptable> modPeValues=[:]
    Map<File,Multimap<String,Closure>> hooks=[:]
    final File modsDir=new File(Environment.externalStorageDirectory,'games/com.mojang/groovyMods/')

    void execLoadMods(Context context=tryContextWithMinecraftOne()){
        def compiler=new GrooidShell(context.filesDir,context.classLoader)
        modsDir.listFiles({File f->
            if(f.name.startsWith('.')){// give a way to disable it
                return false
            }
            if(f.name.endsWith('.groovy')){// this is what I want
                return true
            }
            return false// otherwise
        }).each {File f->
            def script=compiler.evaluate(f.text).script
            def hooks=HashMultimap.create()
            // make it possible to *add* hook by doing it: hooks.newLevel={->}
            hooks.metaClass.setProperty={String name,Object newVal->
                if(newVal instanceof Closure){
                    hooks.put(name,newVal)
                }
            }
            // Android's Context object: com.mojang....get() is too long to use
            script.binding.setVariable('context',context)
            // hooks receiver
            script.binding.setVariable('hooks',hooks)
            // copy ModPE constants into Groovy environment
            modPeValues.each {
                script.binding.setVariable(it.key,new GroovyObjectAdapter(it.value))
            }
            // define createScript() to allow creators compile Script
            // usage example: ConfigSlurper
            script.binding.setVariable('createScript'){inp->
                def content
                if(inp instanceof CharSequence){
                    content=inp.toString()
                }else if(inp instanceof File){
                    content=inp.text
                }else if(inp instanceof URL){
                    content=inp.text
                }else if(inp instanceof GroovyObjectAdapter){
                    content=inp()
                }else if(inp instanceof Function){
                    content=new GroovyObjectAdapter(inp).call()
                }
                compiler.evaluate(content).script
            }

            try{
                // run Script
                script.run()
            }catch(e){
                def dialog=new AlertDialog.Builder(context)
                dialog.title="An error occurred while executing the code"
                def sw=new StringWriter()
                sw.append("File: $f\n")
                e.printStackTrace(new PrintWriter(sw))
                dialog.message=sw.toString()
                dialog.setNegativeButton(android.R.string.ok){di,w->}
                dialog.setPositiveButton(android.R.string.copy){di,w->
                    def clip=(ClipboardManager)context.getSystemService(Context.CLIPBOARD_SERVICE)
                    clip.text=sw.toString()
                }
            }finally{
                // save hooks: even error occurs
                this.hooks[f]=hooks
            }
        }
    }

    void callHooks(String name,Object[] args){
        hooks.each {
            it.value.get(name).each {
                it.call(args)
            }
        }
    }

    Context tryContextWithMinecraftOne(){
        try {
            return com.mojang.minecraftpe.MainActivity.currentMainActivity.get()
        } catch (e) {
            return null
        }
    }
}
