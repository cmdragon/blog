#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
构建产物确定性校验脚本（只读，不修改任何文件）

用途：
  排查「每次构建出的文件都不一致，导致 Cloudflare Pages 增量上传失效（全量重传）」问题。

原理：
  第一次运行会为 public/ 下所有文件生成 SHA256 快照（public.sha256sum）。
  第二次（及之后）运行会对比当前产物的哈希与快照，输出：
    1) 内容发生变化的文件清单（这些文件每次构建都变 → 导致 CF 无法命中）
    2) 对变化文件抽样打印差异行，帮助定位「是哪个变量在变」（如构建时间、随机 hash 等）

用法：
  python scripts/build_determinism_check.py          # 建立/更新基线快照
  python scripts/build_determinism_check.py --diff    # 与基线对比，报告变化文件

注意：本脚本只读取 public/ 并计算哈希，不写入、不删除、不执行 git。
"""
import hashlib
import os
import sys

PUBLIC_DIR = "public"
SNAPSHOT = "public.sha256sum"


def sha256_of(path):
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(65536), b""):
            h.update(chunk)
    return h.hexdigest()


def walk_files():
    files = []
    for root, _, names in os.walk(PUBLIC_DIR):
        for n in names:
            files.append(os.path.relpath(os.path.join(root, n), PUBLIC_DIR))
    return sorted(files)


def build_snapshot():
    snap = {}
    for rel in walk_files():
        snap[rel] = sha256_of(os.path.join(PUBLIC_DIR, rel))
    return snap


def write_snapshot(snap):
    with open(SNAPSHOT, "w", encoding="utf-8") as f:
        for rel in sorted(snap):
            f.write(f"{snap[rel]}\t{rel}\n")
    print(f"基线快照已写入 {SNAPSHOT}（{len(snap)} 个文件）")


def load_snapshot():
    snap = {}
    if not os.path.exists(SNAPSHOT):
        return None
    with open(SNAPSHOT, "r", encoding="utf-8") as f:
        for line in f:
            line = line.rstrip("\n")
            if not line:
                continue
            digest, rel = line.split("\t", 1)
            snap[rel] = digest
    return snap


def main():
    diff_mode = "--diff" in sys.argv
    current = build_snapshot()

    if not diff_mode:
        write_snapshot(current)
        print("完成。下次构建后再次运行本脚本（加 --diff）即可对比变化。")
        return

    base = load_snapshot()
    if base is None:
        write_snapshot(current)
        print("未找到基线，已新建。请在下一次构建后再次 --diff。")
        return

    changed = [rel for rel in current if base.get(rel) != current[rel]]
    removed = [rel for rel in base if rel not in current]
    added = [rel for rel in current if rel not in base]

    print(f"基线文件数: {len(base)}  当前文件数: {len(current)}")
    print(f"内容变化文件: {len(changed)}")
    print(f"新增文件: {len(added)}")
    print(f"消失文件: {len(removed)}")

    if changed:
        print("\n=== 变化的文件（按扩展名归类）===")
        by_ext = {}
        for rel in changed:
            ext = os.path.splitext(rel)[1] or "(无扩展名)"
            by_ext.setdefault(ext, []).append(rel)
        for ext in sorted(by_ext):
            print(f"\n[{ext}] 共 {len(by_ext[ext])} 个")
            for rel in by_ext[ext][:10]:
                print(f"  - {rel}")
            if len(by_ext[ext]) > 10:
                print(f"  ... 其余 {len(by_ext[ext]) - 10} 个省略")

        # 对文本类变化文件抽样打印差异行，定位变量
        print("\n=== 抽样差异（定位是哪个变量在变）===")
        sampled = 0
        for rel in changed:
            if sampled >= 8:
                break
            if rel.lower().endswith((".html", ".xml", ".json", ".css", ".js")):
                try:
                    print(f"\n--- {rel} ---")
                    with open(os.path.join(PUBLIC_DIR, rel), "r", encoding="utf-8", errors="replace") as f:
                        lines = f.readlines()
                    # 打印含时间/now/日期特征的可疑行
                    import re
                    pat = re.compile(r"\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}|20\d{2}-\d{2}-\d{2}|now\(|lastBuildDate|buildDate", re.I)
                    hits = [ln.strip() for ln in lines if pat.search(ln)]
                    for ln in hits[:5]:
                        print(f"  > {ln[:200]}")
                    if not hits:
                        print("  （未检出明显时间/日期特征，可能是 hash 或随机串变化）")
                    sampled += 1
                except Exception as e:
                    print(f"  读取失败: {e}")


if __name__ == "__main__":
    main()
