import os
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env.local'))

SUPABASE_URL = os.environ['NEXT_PUBLIC_SUPABASE_URL']
SUPABASE_SERVICE_KEY = os.environ['SUPABASE_SERVICE_ROLE_KEY']
ENCRYPTION_KEY = os.environ['ENCRYPTION_KEY']
POLL_INTERVAL = int(os.environ.get('POLL_INTERVAL', '2'))
