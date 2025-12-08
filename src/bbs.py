import logging
import socket
import asyncio
import datetime

NAME = "vbbs"
HOST = "127.0.0.1"
PORT = 23

SERVER_ENCODING = "utf-8"

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

def formatAddress(addr) -> str:
    return f"{addr[0]}:{addr[1]}"

async def recv(client: socket.socket, encodoing="utf-8") -> str:
    loop = asyncio.get_event_loop()
    request_raw = await loop.sock_recv(client, 255) # todo)) handle control bytes
    request = request_raw.decode(encodoing)
    logger.info(f"{formatAddress(client.getpeername())}->{HOST}: {request.strip()}")
    return request

async def send(client: socket.socket, msg: str, encoding: str="utf-8"):
    loop = asyncio.get_event_loop()
    logger.info(f"{HOST}->{formatAddress(client.getpeername())}: {msg.strip()}")
    raw = msg.encode(encoding=encoding) if encoding else b"%v" % msg
    await loop.sock_sendall(client, raw)

async def handle_client(client: socket.socket, addr):
    logger.info(f"{formatAddress(client.getpeername())}: CONNECTED")
    await send(client, "================================================================================\n")
    await send(client, "                        welcome to MAROONS AWESOME BBS                          \n")
    await send(client, "================================================================================\n")
    await send(client, "\n")
    await send(client, "CLIENT CONN: %s\n" % "Telnet")
    await send(client, "       ADDR: %s\n" % client.getpeername()[0])
    await send(client, "       TERM: %s\n" % "<unknown>")
    await send(client, "SERVER NAME: %s\n" % NAME)
    await send(client, "       ADDR: %s\n" % client.getsockname()[0])
    await send(client, "       NODE: %s\n" % "<unknown>")
    await send(client, "       TIME: %s\n" % datetime.datetime.now().astimezone().isoformat())
    await send(client, "       ADMN: %s\n" % "vulpinedreams")
    await send(client, "\n")
    # await send(client, "Login: ")

    request = None
    while request not in ("quit", "q"):
        await send(client, "Command: ")
        request = await recv(client)
        request = request.strip()
        await send(client, f"you said \"{request}\"!!!!!\n")
    
    await send(client, "goodbye...\n")
    logger.info(f"{formatAddress(client.getpeername())}: DISCONNECTING")
    client.close()

async def start_server():
    logger.debug(f"starting server at HOST={HOST} PORT={PORT}")
    server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    address: socket._Address = (HOST, PORT)
    server.bind(address)
    server.listen()
    server.setblocking(False)
    logger.info(f"listening on {HOST}:{PORT}")
    
    loop = asyncio.get_event_loop()
    
    quit = False
    try:
        while not quit:
            client, addr = await loop.sock_accept(server)
            task = loop.create_task(handle_client(client, addr))
    except asyncio.exceptions.CancelledError:
            quit = True
    logger.info("closing server")
    loop.stop()
        
            
if __name__ == "__main__":
    asyncio.run(start_server())
