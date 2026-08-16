#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""临时脚本：对 public 目录做文件哈希快照，用于两次构建对比。"""
import os
import sys
import json
import hashlib

d = 'public'
snap = {}
for dp, dn, fn in os.walk(d):
    for f in fn:
        p = os.path.join(dp, f)
        rel = os.path.relpath(p, d)
        snap[rel] = hashlib.md5(open(p, 'rb').read()).hexdigest()

mode = sys.argv[1] if len(sys.argv) > 1 else 'save'
if mode == 'save':
    json.dump(snap, open('scripts/_snap1.json', 'w'), sort_keys=True)
    print(f'saved snapshot: {len(snap)} files')
elif mode == 'compare':
    before = json.load(open('scripts/_snap1.json'))
    changed = [k for k in snap if before.get(k) != snap[k]]
    added = [k for k in snap if k not in before]
    removed = [k for k in before if k not in snap]
    print(f'changed: {len(changed)}')
    print(f'added: {len(added)}')
    print(f'removed: {len(removed)}')
    for k in changed[:30]:
        print(f'  [changed] {k}')
    for k in added[:10]:
        print(f'  [added] {k}')
    for k in removed[:10]:
        print(f'  [removed] {k}')
