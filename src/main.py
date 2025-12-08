from workers import WorkerEntrypoint, Response, Request
from pyodide.ffi import to_js

 # stdlib
import logging
import datetime
from urllib.parse import urlparse

from typing import TYPE_CHECKING, MutableSequence
if TYPE_CHECKING:
    from js import Env, Object


class Default(WorkerEntrypoint):
    env: "Env"

    def __init__(self, ctx, env: "Env"):
        self.ctx = ctx
        self.env = env

    async def fetch(self, request: Request):
        logger = logging.getLogger(__name__)
        logging.basicConfig(level=logging.INFO)

        url = urlparse(request.url)

        if str.startswith(url.path, '/api'):
            return self.api(request)

        sec_fetch_mode = request.headers["Sec-Fetch-Mode"] or ""
        if sec_fetch_mode == "navigate":
            referer = request.headers["Referer"] or "NOREFERER"
            ua = request.headers["User-Agent"] or "NOUSERAGENT"
            timestamp = datetime.datetime.now().isoformat()

            self.env.REFERERS.writeDataPoint(
                indexes=to_js([ referer ]),
                doubles=to_js([]),
                blobs=to_js([ ua, timestamp ]),
            )
        
        return await self.env.ASSETS.fetch(request) # type: ignore
    
    async def api(self, request):
        return Response("API call yipee", status=418)

# https://blog.cloudflare.com/introducing-socket-workers/
# proposed structure of an incoming TCP request in JavaScript:
# addEventListener('connect', (event) => {
#   const enc = new TextEncoder();
#   const writer = event.socket.writable.getWriter(); # WritableStream
#   writer.write(enc.encode('Hello World'));
#   writer.close();
# });
# https://developers.cloudflare.com/workers/runtime-apis/tcp-sockets/
# WritableStream: https://developers.cloudflare.com/workers/runtime-apis/streams/writablestream/
    async def connect(self, socket):
        data: str = "hello world!"
        encoded: bytes = data.encode(encoding="utf-8", errors="strict")
        writer = socket.writable.getWriter()
        writer.write(encoded)
        writer.close()