import os

from dotenv import load_dotenv
from supabase import Client, create_client

load_dotenv()

URL = os.getenv("SUPABASE_URL")
KEY = os.getenv("SUPABASE_KEY")

supabase : Client = create_client(URL, KEY)


