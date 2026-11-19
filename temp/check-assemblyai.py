from dotenv import dotenv_values
from pathlib import Path
import httpx

values = dotenv_values(Path(__file__).resolve().parents[1] / '.env')
key = (values.get('ASSEMBLY_AI_API_KEY') or '').strip()
if not key:
    print('AssemblyAI key: missing')
    raise SystemExit(2)
try:
    response = httpx.get('https://api.assemblyai.com/v2/transcript', headers={'authorization': key}, params={'limit': 1}, timeout=30)
    print(f'AssemblyAI authentication: HTTP {response.status_code}')
    if not response.is_success:
        raise SystemExit(3)
    print('AssemblyAI key verified; no transcript data displayed')
except httpx.HTTPError as exc:
    print(f'AssemblyAI connection failed: {type(exc).__name__}')
    raise SystemExit(4)
