"""
Pipify Worker - Polls for pending signals and executes them on MT5.

Usage:
    python main.py

Requires:
    - MT5 terminal installed and running on the same Windows machine
    - .env.local in parent directory with Supabase + encryption credentials
"""
import time
import logging
from config import POLL_INTERVAL
from db import fetch_pending_signals
from signal_processor import process_signal

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(name)s: %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S',
)
logger = logging.getLogger('pipify.worker')


def main():
    logger.info(f"Pipify worker started (polling every {POLL_INTERVAL}s)")

    while True:
        try:
            signals = fetch_pending_signals(limit=10)

            if signals:
                logger.info(f"Found {len(signals)} pending signal(s)")
                for signal in signals:
                    process_signal(signal)
            else:
                pass  # Silent when no signals

        except KeyboardInterrupt:
            logger.info("Worker stopped by user")
            break
        except Exception as e:
            logger.error(f"Poll loop error: {e}")

        time.sleep(POLL_INTERVAL)


if __name__ == '__main__':
    main()
