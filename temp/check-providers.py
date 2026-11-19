from dotenv import dotenv_values
from pathlib import Path
import httpx

values = dotenv_values(Path(__file__).resolve().parents[1] / '.env')
key = values.get('GOOGLE_API_KEY', '')
model = values.get('LLM', '').split(':', 1)[-1]
if not key:
    print('Google API: key missing')
else:
    try:
        response = httpx.get(
            f'https://generativelanguage.googleapis.com/v1beta/models/{model}',
            headers={'x-goog-api-key': key}, timeout=30,
        )
        print(f'Google configured model access: HTTP {response.status_code}')
        if response.is_success:
            print('Google model access verified')
    except Exception as exc:
        print(f'Google connection failed: {type(exc).__name__}')
