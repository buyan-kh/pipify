import logging
from datetime import datetime, timezone
from db import (
    claim_signal,
    complete_signal,
    get_mt5_account,
    get_user_active_account,
    insert_trade,
)
from mt5_executor import connect, disconnect, execute_order

logger = logging.getLogger(__name__)


def process_signal(signal: dict):
    """Process a single signal: claim it, connect to MT5, execute, record trade."""
    signal_id = signal['id']
    user_id = signal['user_id']

    # Atomic claim
    if not claim_signal(signal_id):
        logger.info(f"Signal {signal_id} already claimed, skipping")
        return

    logger.info(f"Processing signal {signal_id}: {signal['action']} {signal['volume']} {signal['symbol']}")

    try:
        # Get MT5 account
        account = None
        if signal.get('mt5_account_id'):
            account = get_mt5_account(signal['mt5_account_id'])
        if not account:
            account = get_user_active_account(user_id)

        if not account:
            raise Exception("No active MT5 account found for user")

        if not account.get('is_active'):
            raise Exception("MT5 account is disabled")

        # Connect to MT5
        if not connect(account):
            raise Exception("Failed to connect to MT5")

        try:
            # Execute the order
            result = execute_order(
                symbol=signal['symbol'],
                action=signal['action'],
                volume=float(signal['volume']),
                sl=float(signal['sl']) if signal.get('sl') else None,
                tp=float(signal['tp']) if signal.get('tp') else None,
            )

            # Record the trade
            action = signal['action']
            is_close = action.startswith('close')

            trade_data = {
                'user_id': user_id,
                'signal_id': signal_id,
                'mt5_account_id': account['id'],
                'ticket': result['ticket'],
                'symbol': signal['symbol'],
                'action': action,
                'volume': float(result.get('volume', signal['volume'])),
                'open_price': float(result['price']),
                'status': 'closed' if is_close else 'open',
                'opened_at': datetime.now(timezone.utc).isoformat(),
            }

            if is_close and 'closed_positions' in result:
                trade_data['close_price'] = float(result['price'])
                trade_data['profit'] = sum(
                    p.get('profit', 0) for p in result['closed_positions']
                )
                trade_data['closed_at'] = datetime.now(timezone.utc).isoformat()

            insert_trade(trade_data)

            complete_signal(signal_id, 'executed')
            logger.info(f"Signal {signal_id} executed successfully: ticket={result['ticket']}")

        finally:
            disconnect()

    except Exception as e:
        logger.error(f"Signal {signal_id} failed: {e}")
        complete_signal(signal_id, 'failed', str(e))
