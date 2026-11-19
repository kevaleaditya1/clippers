from pathlib import Path
from dotenv import dotenv_values
import httpx
v = dotenv_values(Path(__file__).resolve().parents[1] / '.env')
model = v['LLM'].split(':',1)[-1]
try:
    r = httpx.post(f'https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent', headers={'x-goog-api-key':v['GOOGLE_API_KEY']}, json={'contents':[{'parts':[{'text':'Reply with OK.'}]}], 'generationConfig':{'maxOutputTokens':32}}, timeout=40)
    print(f'Gemini inference check: HTTP {r.status_code}')
    if not r.is_success:
        error=r.json().get('error',{})
        print('Provider error category:',error.get('status','unknown'))
        raise SystemExit(1)
except httpx.HTTPError as exc:
    print('Inference check connection error:',type(exc).__name__)
    raise SystemExit(2)
