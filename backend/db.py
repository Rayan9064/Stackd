import logging

from prisma import Prisma
from prisma.engine.errors import NotConnectedError

db = Prisma()

logger = logging.getLogger("db")


async def ensure_db_connected():
    if not db.is_connected():
        await db.connect()
        return

    try:
        await db.query_raw("SELECT 1")
    except NotConnectedError:
        logger.warning("Prisma query engine is stale; reconnecting database client.")
        try:
            await db.disconnect()
        except Exception:
            pass
        await db.connect()


async def db_status():
    try:
        await ensure_db_connected()
        await db.query_raw("SELECT 1")
        return {"connected": True}
    except Exception as exc:
        return {
            "connected": False,
            "error": str(exc),
            "errorType": type(exc).__name__,
        }
