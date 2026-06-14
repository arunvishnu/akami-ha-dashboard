#!/bin/sh
python3 - << 'PYEOF'
import urllib.request, zipfile, shutil, os

url = 'https://github.com/arunvishnu/akami-ha-dashboard/archive/refs/heads/deploy.zip'
tmp_zip = '/tmp/ha_dashboard_deploy.zip'
tmp_dir = '/tmp/ha_dashboard_deploy'
dest = '/config/www/ha-dashboard'

print('Downloading...')
urllib.request.urlretrieve(url, tmp_zip)

print('Extracting...')
if os.path.exists(tmp_dir):
    shutil.rmtree(tmp_dir)
with zipfile.ZipFile(tmp_zip) as z:
    z.extractall(tmp_dir)

extracted = os.path.join(tmp_dir, os.listdir(tmp_dir)[0], 'www', 'ha-dashboard')
if os.path.exists(dest):
    shutil.rmtree(dest)
shutil.copytree(extracted, dest)

shutil.rmtree(tmp_dir)
os.remove(tmp_zip)
print('Done')
PYEOF
