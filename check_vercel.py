import urllib.request
url = 'https://navisrisk.com/components/scenarioTemplates.js'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    with urllib.request.urlopen(req) as response:
        content = response.read().decode('utf-8')
        if 'id: "scen-genai"' in content:
            idx = content.find('id: "scen-genai"')
            print(content[idx-40:idx+20])
except Exception as e:
    print('Failed:', e)
