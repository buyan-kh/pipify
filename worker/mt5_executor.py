import MetaTrader5 as mt5
from encryption import decrypt
import logging

logger = logging.getLogger(__name__)


def connect(account: dict) -> bool:
    """Connect to MT5 with the given account credentials."""
    password = decrypt(account['encrypted_password'])

    if not mt5.initialize():
        logger.error(f"MT5 initialize failed: {mt5.last_error()}")
        return False

    authorized = mt5.login(
        login=int(account['login']),
        password=password,
        server=account['server']
    )

    if not authorized:
        logger.error(f"MT5 login failed for {account['login']}@{account['server']}: {mt5.last_error()}")
        return False

    logger.info(f"Connected to MT5: {account['login']}@{account['server']}")
    return True


def disconnect():
    """Shutdown MT5 connection."""
    mt5.shutdown()


def execute_order(symbol: str, action: str, volume: float,
                  sl: float = None, tp: float = None) -> dict:
    """Execute a market order on MT5.

    Returns dict with ticket, price, etc. on success, or raises Exception on failure.
    """
    # Ensure symbol is available
    symbol_info = mt5.symbol_info(symbol)
    if symbol_info is None:
        raise Exception(f"Symbol {symbol} not found")

    if not symbol_info.visible:
        if not mt5.symbol_select(symbol, True):
            raise Exception(f"Failed to select symbol {symbol}")

    if action == 'buy':
        return _market_order(symbol, mt5.ORDER_TYPE_BUY, volume, sl, tp)
    elif action == 'sell':
        return _market_order(symbol, mt5.ORDER_TYPE_SELL, volume, sl, tp)
    elif action == 'close_buy':
        return _close_positions(symbol, mt5.POSITION_TYPE_BUY)
    elif action == 'close_sell':
        return _close_positions(symbol, mt5.POSITION_TYPE_SELL)
    elif action == 'close_all':
        return _close_positions(symbol)
    else:
        raise Exception(f"Unknown action: {action}")


def _market_order(symbol: str, order_type: int, volume: float,
                  sl: float = None, tp: float = None) -> dict:
    """Place a market order."""
    tick = mt5.symbol_info_tick(symbol)
    if tick is None:
        raise Exception(f"Failed to get tick for {symbol}")

    price = tick.ask if order_type == mt5.ORDER_TYPE_BUY else tick.bid

    request = {
        'action': mt5.TRADE_ACTION_DEAL,
        'symbol': symbol,
        'volume': float(volume),
        'type': order_type,
        'price': price,
        'deviation': 20,
        'magic': 123456,
        'comment': 'pipify',
        'type_time': mt5.ORDER_TIME_GTC,
        'type_filling': mt5.ORDER_FILLING_IOC,
    }

    if sl and sl > 0:
        request['sl'] = float(sl)
    if tp and tp > 0:
        request['tp'] = float(tp)

    result = mt5.order_send(request)

    if result is None:
        raise Exception(f"order_send returned None: {mt5.last_error()}")

    if result.retcode != mt5.TRADE_RETCODE_DONE:
        raise Exception(f"Order failed: {result.retcode} - {result.comment}")

    return {
        'ticket': result.order,
        'price': result.price,
        'volume': result.volume,
    }


def _close_positions(symbol: str, position_type: int = None) -> dict:
    """Close open positions for a symbol."""
    positions = mt5.positions_get(symbol=symbol)
    if positions is None or len(positions) == 0:
        raise Exception(f"No open positions for {symbol}")

    closed = []
    for pos in positions:
        if position_type is not None and pos.type != position_type:
            continue

        close_type = mt5.ORDER_TYPE_SELL if pos.type == mt5.POSITION_TYPE_BUY else mt5.ORDER_TYPE_BUY
        tick = mt5.symbol_info_tick(symbol)
        price = tick.bid if pos.type == mt5.POSITION_TYPE_BUY else tick.ask

        request = {
            'action': mt5.TRADE_ACTION_DEAL,
            'symbol': symbol,
            'volume': float(pos.volume),
            'type': close_type,
            'position': pos.ticket,
            'price': price,
            'deviation': 20,
            'magic': 123456,
            'comment': 'pipify close',
            'type_time': mt5.ORDER_TIME_GTC,
            'type_filling': mt5.ORDER_FILLING_IOC,
        }

        result = mt5.order_send(request)
        if result and result.retcode == mt5.TRADE_RETCODE_DONE:
            closed.append({
                'ticket': pos.ticket,
                'close_price': result.price,
                'profit': pos.profit,
            })
        else:
            logger.warning(f"Failed to close position {pos.ticket}: {result}")

    if not closed:
        raise Exception(f"Failed to close any positions for {symbol}")

    return {
        'ticket': closed[0]['ticket'],
        'price': closed[0]['close_price'],
        'volume': sum(pos.volume for pos in positions if position_type is None or pos.type == position_type),
        'closed_positions': closed,
    }
