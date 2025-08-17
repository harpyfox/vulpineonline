from js import console

async def on_fetch(request, env): 
    console.log("log from Python!")
    return env.ASSETS.fetch(request)
