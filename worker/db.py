from supabase import create_client
from config import SUPABASE_URL, SUPABASE_SERVICE_KEY

supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)


def fetch_pending_signals(limit=10):
    """Fetch pending signals ordered by creation time."""
    result = supabase.table('signals') \
        .select('*') \
        .eq('status', 'pending') \
        .order('created_at') \
        .limit(limit) \
        .execute()
    return result.data


def claim_signal(signal_id: str) -> bool:
    """Atomically claim a signal by setting status to processing.
    Returns True if we successfully claimed it (status was still pending)."""
    result = supabase.table('signals') \
        .update({'status': 'processing'}) \
        .eq('id', signal_id) \
        .eq('status', 'pending') \
        .execute()
    return len(result.data) > 0


def complete_signal(signal_id: str, status: str, error_message: str = None):
    """Mark a signal as executed or failed."""
    update = {
        'status': status,
        'processed_at': 'now()',
    }
    if error_message:
        update['error_message'] = error_message
    supabase.table('signals').update(update).eq('id', signal_id).execute()


def get_mt5_account(account_id: str):
    """Get MT5 account details."""
    result = supabase.table('mt5_accounts') \
        .select('*') \
        .eq('id', account_id) \
        .single() \
        .execute()
    return result.data


def get_user_active_account(user_id: str):
    """Get user's first active MT5 account."""
    result = supabase.table('mt5_accounts') \
        .select('*') \
        .eq('user_id', user_id) \
        .eq('is_active', True) \
        .limit(1) \
        .execute()
    return result.data[0] if result.data else None


def insert_trade(trade_data: dict):
    """Insert a trade record."""
    result = supabase.table('trades').insert(trade_data).execute()
    return result.data[0] if result.data else None
