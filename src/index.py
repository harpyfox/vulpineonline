from workers import Response

async def on_fetch(request, env): 
    return env.ASSETS.fetch(request)
