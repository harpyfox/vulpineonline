from workers import WorkerEntrypoint, Response
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

    async def fetch(self, request):
        logger = logging.getLogger(__name__)
        logging.basicConfig(level=logging.INFO)

        url = urlparse(request.url)

        if str.startswith(url.path, 'api'):
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
        
        return await self.env.ASSETS.fetch(request)
    
    async def api(self, request):
        return Response("API call yipee", status=418)
