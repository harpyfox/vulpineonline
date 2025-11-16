from js import Object
from workers import WorkerEntrypoint, Response
from pyodide.ffi import to_js as _to_js

 # stdlib
import logging
import datetime

from typing import TYPE_CHECKING
if TYPE_CHECKING:
    from js import Env


class Default(WorkerEntrypoint):
    env: "Env"

    def __init__(self, ctx, env: "Env"):
        self.ctx = ctx
        self.env = env

    async def fetch(self, request):
        logger = logging.getLogger(__name__)
        logging.basicConfig(level=logging.INFO)

        version_proxy = self.env.CF_VERSION_METADATA;

        headers = dict(request.headers)
        if headers.get("sec-fetch-mode", None) == "navigate":
            referer = headers.get("referer", "no-referrer")
            ua = headers.get("user-agent", "no-useragent")
            timestamp = datetime.datetime.now().isoformat()
            self.env.REFERERS.writeDataPoint(
                indexes=[version_proxy.id],
                doubles=[],
                blobs=[ ua, referer, timestamp ],
            )
        
        return await self.env.ASSETS.fetch(request)
