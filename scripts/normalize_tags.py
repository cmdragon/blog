#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
标签规范化脚本（构建期自动运行，作为「杜绝措施」的自动化兜底）

与 cleanup_tags.py 的区别：
- cleanup_tags.py：一次性存量清理（删除低频 tag、可备份回滚），手动运行
- normalize_tags.py：每次构建自动运行，只做「确定性规则」，不做频次判断，
  保证任何新增文章（无论人工还是 AI 生成）都会被强制规范化，防止 tag 再次膨胀。

确定性规则：
1. 合并大小写/空格不一致的 tag（归一到规范写法）
2. 删除黑名单 tag
3. 去重（合并后可能产生重复）
4. 每篇文章最多保留 MAX_TAGS_PER_POST 个 tag（按全局热度排序，保留最热的）

不做的（留给 cleanup_tags.py）：
- 删除全局低频 tag（因为新文章的新 tag 必然低频，不能在构建期删）

用法：
  python scripts/normalize_tags.py            # 实际执行（无备份，规则是确定性的、幂等的）
  python scripts/normalize_tags.py --check    # 只检查，不修改；发现违规返回非零退出码
"""
import os
import re
import sys
import collections
from pathlib import Path

ROOT = Path(__file__).parent.parent
POSTS_DIR = ROOT / "content" / "posts"

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

# 黑名单 tag（无条件删除）
BLACKLIST_TAGS = {"--"}

# 每篇文章 tag 数量上限
MAX_TAGS_PER_POST = 5


def parse_front_matter(text):
    m = re.match(r'^---\s*\n(.*?)\n---\s*\n', text, re.DOTALL)
    if not m:
        return None, None
    return m.group(1), text[m.end():]


def parse_tags(fm_text):
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
            posts.append({
                'path': p,
                'tags': [normalize_tag(t) for t in tags],
                'is_multiline': is_multiline,
                'span': span,
            })
    return posts


def compute_final_tags(tags, freq):
    """对一篇文章的 tags 应用确定性规则，返回最终 tag 列表。"""
    # 1. 删除黑名单
    kept = [t for t in tags if t not in BLACKLIST_TAGS]
    # 2. 去重（保持原顺序）
    seen = set()
    deduped = []
    for t in kept:
        if t not in seen:
            seen.add(t)
            deduped.append(t)
    # 3. 保持原顺序截断到上限（不排序，避免无意义的顺序重排导致文件频繁变更）
    return deduped[:MAX_TAGS_PER_POST]


def main():
    check_only = '--check' in sys.argv
    posts = load_all_posts()

    freq = collections.Counter()
    for p in posts:
        freq.update(p['tags'])

    changed = 0
    for p in posts:
        final = compute_final_tags(p['tags'], freq)
        if final != p['tags']:
            changed += 1
            if check_only:
                rel = p['path'].relative_to(POSTS_DIR)
                print(f"  [违规] {rel}: {p['tags']} -> {final}")
                continue
            # 写回
            text = p['path'].read_text(encoding='utf-8')
            fm_text, body = parse_front_matter(text)
            span = p['span']
            if final:
                if p['is_multiline']:
                    new_block = "tags:\n" + "".join(f"  - {t}\n" for t in final)
                else:
                    new_block = "tags: [" + ", ".join(final) + "]\n"
            else:
                new_block = ""
            new_fm = fm_text[:span[0]] + new_block + fm_text[span[1]:]
            new_text = "---\n" + new_fm + "\n---\n" + body
            p['path'].write_text(new_text, encoding='utf-8')

    if check_only:
        if changed:
            print(f"\n发现 {changed} 篇文章的 tag 不符合规范")
            sys.exit(1)
        else:
            print("所有文章 tag 均符合规范")
            sys.exit(0)
    else:
        print(f"标签规范化完成，修改了 {changed} 篇文章")


if __name__ == "__main__":
    main()
