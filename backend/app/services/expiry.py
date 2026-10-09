import asyncio
import logging
from datetime import datetime, timedelta, timezone

import requests

from app.database import SessionLocal
from app.models.order import Order
from app.routes.payments import CASHFREE_BASE_URL, _cf_headers
from app.services.order_state import mark_paid, cancel_and_restock

logger = logging.getLogger(__name__)
GRACE_MINUTES = 35  # a bit longer than the 30-minute Cashfree expiry


def expire_stale_orders() -> None:
    db = SessionLocal()
    try:
        cutoff = datetime.now(timezone.utc) - timedelta(minutes=GRACE_MINUTES)
        stale = (
            db.query(Order)
            .filter(Order.status == "pending", Order.created_at < cutoff)
            .all()
        )

        for order in stale:
            try:
                if not order.cf_order_id:
                    cancel_and_restock(db, order)  # payment never started
                    continue

                r = requests.get(
                    f"{CASHFREE_BASE_URL}/orders/{order.cf_order_id}",
                    headers=_cf_headers(),
                    timeout=15,
                )
                if r.status_code != 200:
                    continue

                status = r.json().get("order_status")
                if status == "PAID":
                    mark_paid(db, order)
                elif status in ("EXPIRED", "TERMINATED", "TERMINATION_REQUESTED"):
                    cancel_and_restock(db, order)
                # still ACTIVE: leave it, try again next run
            except Exception:
                db.rollback()
                logger.exception("Expiry failed for order #%s", order.id)
    except Exception:
        logger.exception("Expiry run failed")
    finally:
        db.close()


async def expiry_loop() -> None:
    while True:
        await asyncio.to_thread(expire_stale_orders)
        await asyncio.sleep(300)  # every 5 minutes