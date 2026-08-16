#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
标签体系清理脚本（路线 B）

功能（按顺序执行）：
1. 合并大小写/空格不一致的 tag（归一到规范写法）
2. 删除全局只出现 1 次的长尾 tag（含标题式 tag）
3. 每篇文章最多保留 5 个 tag（按全局热度排序，保留最热的）

用法：
  python scripts/cleanup_tags.py --dry-run   # 只预览，不写文件
  python scripts/cleanup_tags.py             # 实际执行（先备份）

安全：执行前会备份整个 content/posts 到 scripts/.backup_posts/
"""
import os
import re
import sys
import shutil
import collections
from pathlib import Path

ROOT = Path(__file__).parent.parent
POSTS_DIR = ROOT / "content" / "posts"
BACKUP_DIR = ROOT / "scripts" / ".backup_posts"

# 大小写归并映射（小写键 -> 保留的规范写法）
NORMALIZE_MAP = {
    "fastapi": "fastapi",
    "nuxt": "nuxt",
    "cmdragon": "cmdragon",
    "pytest": "pytest",
    "django": "django",
    "reactive": "reactive",
    "watch": "watch",
    "computed": "computed",
    "props": "props",
    "vuejs": "vuejs",
    "nuxtjs": "nuxtjs",
    "devtools": "devtools",
    "mermaid live editor": "mermaid live editor",
    "b-tree": "b-tree",
    "tree-shaking": "tree-shaking",
    "data visualization": "data visualization",
    "graph td": "graph td",
    "quran explorer": "quran explorer",
    "cross-device file transfer": "cross-device file transfer",
    "text-to-image tool": "text-to-image tool",
    "web开发": "web开发",
    "vue3": "vue3",
    "composition api": "composition api",
    "saga模式": "saga模式",
    "b-tree索引": "b-tree索引",
}

# 每篇文章 tag 数量上限
MAX_TAGS_PER_POST = 5
# 删除全局出现次数低于此值的 tag
MIN_TAG_COUNT = 2


def parse_front_matter(text):
    m = re.match(r'^---\s*\n(.*?)\n---\s*\n', text, re.DOTALL)
    if not m:
        return None, None
    return m.group(1), text[m.end():]


def parse_tags(fm_text):
    """返回 (tags_list, 是否多行, 行范围 span)。"""
    m = re.search(r'(?m)^tags\s*:\s*\n((?:^[ \t]*-\s*.+\n?)+)', fm_text)
    if m:
        items = re.findall(r'^[ \t]*-\s*["\']?(.+?)["\']?\s*$', m.group(1), re.M)
        return [i.strip() for i in items if i.strip()], True, (m.start(), m.end())
    m2 = re.search(r'(?m)^tags\s*:\s*\[([^\]]*)\]', fm_text)
    if m2:
        items = re.findall(r'["\']?([^,"\']+)["\']?', m2.group(1))
        return [i.strip() for i in items if i.strip()], False, (m2.start(), m2.end())
    return [], None, None


def normalize_tag(tag):
    key = tag.lower()
    if key in NORMALIZE_MAP:
        return NORMALIZE_MAP[key]
    return tag


def load_all_posts():
    """加载所有文章的 front matter tags（合并大小写后）。返回 list of dict。"""
    posts = []
    for dp, dn, fn in os.walk(POSTS_DIR):
        for f in fn:
            if not f.endswith('.md'):
                continue
            p = Path(dp) / f
            text = p.read_text(encoding='utf-8')
            fm_text, _ = parse_front_matter(text)
            if fm_text is None:
                continue
            tags, is_multiline, span = parse_tags(fm_text)
            normalized = [normalize_tag(t) for t in tags]
            posts.append({
                'path': p,
                'tags': normalized,
                'is_multiline': is_multiline,
                'span': span,
            })
    return posts


def main():
    dry_run = '--dry-run' in sys.argv
    print(f"模式: {'DRY-RUN（不写文件）' if dry_run else '实际执行'}")
    print(f"删除全局出现 < {MIN_TAG_COUNT} 次的 tag")
    print(f"每篇最多保留 {MAX_TAGS_PER_POST} 个 tag")

    posts = load_all_posts()
    print(f"共加载 {len(posts)} 篇文章")

    # 全局统计（合并大小写后）
    freq = collections.Counter()
    for p in posts:
        freq.update(p['tags'])

    print(f"合并大小写后唯一 tag 数: {len(freq)}")

    # 需要删除的 tag：全局出现次数 < MIN_TAG_COUNT
    drop_set = {t for t, c in freq.items() if c < MIN_TAG_COUNT}
    print(f"将删除的长尾 tag 数（出现<{MIN_TAG_COUNT}次）: {len(drop_set)}")

    if not dry_run:
        if BACKUP_DIR.exists():
            shutil.rmtree(BACKUP_DIR)
        shutil.copytree(POSTS_DIR, BACKUP_DIR)
        print(f"已备份到: {BACKUP_DIR}")

    stats = collections.Counter()
    changed_posts = []

    for p in posts:
        # 1. 删除长尾 tag
        kept = [t for t in p['tags'] if t not in drop_set]
        # 2. 去重（保持原顺序）
        seen = set()
        deduped = []
        for t in kept:
            if t not in seen:
                seen.add(t)
                deduped.append(t)
        # 3. 保持原顺序截断到上限（不排序，避免无意义的顺序重排）
        final = deduped[:MAX_TAGS_PER_POST]

        if final == p['tags']:
            continue

        changed_posts.append((p, final))

    print(f"将修改的文章数: {len(changed_posts)}")

    if dry_run:
        for p, final in changed_posts[:8]:
            rel = p['path'].relative_to(POSTS_DIR)
            print(f"  [dry-run] {rel}: {len(p['tags'])} -> {len(final)} 个 tag")
        print(f"  ... 等共 {len(changed_posts)} 篇")
        # 预览最终 tag 总数
        final_freq = collections.Counter()
        for p in posts:
            kept = [t for t in p['tags'] if t not in drop_set]
            seen = set()
            dd = []
            for t in kept:
                if t not in seen:
                    seen.add(t)
                    dd.append(t)
            final_freq.update(dd[:MAX_TAGS_PER_POST])
        print(f"\n优化后唯一 tag 数: {len(final_freq)} (从 {len(freq)} 降到 {len(final_freq)})")
        return

    # 实际写入
    for p, final in changed_posts:
        # 重建 tags 字段
        if final:
            if p['is_multiline']:
                new_block = "tags:\n" + "".join(f"  - {t}\n" for t in final)
            else:
                new_block = "tags: [" + ", ".join(final) + "]\n"
        else:
            new_block = ""

        text = p['path'].read_text(encoding='utf-8')
        fm_text, body = parse_front_matter(text)
        span = p['span']
        new_fm = fm_text[:span[0]] + new_block + fm_text[span[1]:]
        new_text = "---\n" + new_fm + "\n---\n" + body
        p['path'].write_text(new_text, encoding='utf-8')
        stats['changed'] += 1

    print(f"\n=== 完成 ===")
    print(f"已修改文章数: {stats['changed']}")
    print(f"备份目录: {BACKUP_DIR}")
    print(f"如需回滚: 手动将 {BACKUP_DIR} 内容复制回 {POSTS_DIR}")


if __name__ == "__main__":
    main()
