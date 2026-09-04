#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
llms.txt 生成脚本
=================

在 Hugo 构建（及 sitemap 分割）完成之后运行，生成面向 AI 搜索引擎 / 智能助手的
站点索引文件：

    public/llms.txt        精简索引：站点介绍 + 入口页 + 内容分区 + 最近更新
    public/llms-full.txt   全量索引：全部文章（标题 / 链接 / 日期 / 分类 / 标签 / 摘要）

设计说明：
- URL 以 `public/sitemap-posts.xml` 为准（Hugo 已过滤草稿与未发布内容，保证链接真实存在），
  标题与摘要等信息再从 Markdown 的 front matter 补充；两者取长补短。
- 仅使用 Python 标准库（与本项目其他脚本风格一致）。
- 退出码恒为 0：本脚本挂在 `npm run build` 末尾，任何异常都不得中断构建流程。

用法：
    python scripts/generate_llms.py                 # 正常生成
    python scripts/generate_llms.py --recent 150    # 自定义 llms.txt 中"最近更新"条数
    python scripts/generate_llms.py --out-dir public  # 自定义输出目录
"""

import sys
import re
import argparse
from pathlib import Path
from datetime import datetime
from urllib.parse import unquote
from xml.etree import ElementTree as ET

# ----------------------------- 配置 -----------------------------
SCRIPT_DIR = Path(__file__).parent
ROOT_DIR = SCRIPT_DIR.parent

# 默认输出目录（Hugo 的发布目录）
DEFAULT_OUT_DIR = "public"

# 文章 sitemap（由 scripts/split_sitemap.py 生成，仅含 /posts/ 文章 URL）
POST_SITEMAP = "sitemap-posts.xml"
# 分类 sitemap（用于取真实可用的分类页 URL）
CATEGORY_SITEMAP = "sitemap-categories.xml"

# llms.txt 中"最近更新"的默认条数
DEFAULT_RECENT = 100

# 摘要在 llms-full.txt 中的最大长度
SUMMARY_MAX = 160

# sitemap 命名空间
NS = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}

# 站点兜底信息（hugo.toml 读取失败时使用）
FALLBACK_BASE_URL = "https://blog.cmdragon.cn/"
FALLBACK_TITLE = "cmdragon's Blog"
FALLBACK_DESC = (
    "cmdragon's Blog 是一个专注于编程与技术分享的中文博客，"
    "覆盖前端开发、后端开发（FastAPI / Django / PostgreSQL）、安全、"
    "数据库与在线工具测评等主题。"
)

# 内容目录（content/posts 下的子目录）的中文标签
SECTION_LABELS = {
    "front_end": "前端开发",
    "back_end": "后端开发",
    "security": "安全",
    "tweets": "热搜与工具短文",
    "document": "文档",
}

# 站点入口页（均已在 sitemap-pages.xml 中确认存在）
SITE_ENTRIES = [
    ("/", "首页：最新文章与站点导航"),
    ("/archives/", "归档：按时间浏览全部文章"),
    ("/categories/", "分类：按主题聚合文章"),
    ("/tags/", "标签：按知识点聚合文章"),
    ("/search/", "站内搜索"),
    ("/friends/", "友情链接"),
    ("/license/", "许可与转载说明"),
]


def log(msg):
    # Windows 控制台中文兼容：必要时重配置 stdout 编码
    try:
        if hasattr(sys.stdout, "reconfigure"):
            sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass
    print(msg, flush=True)


# ----------------------------- 通用工具 -----------------------------
def read_site_config():
    """从 hugo.toml 读取 baseURL / title / description（失败则用兜底值）。"""
    cfg = {
        "base_url": FALLBACK_BASE_URL,
        "title": FALLBACK_TITLE,
        "description": FALLBACK_DESC,
    }
    hugo_toml = ROOT_DIR / "hugo.toml"
    try:
        text = hugo_toml.read_text(encoding="utf-8", errors="replace")
    except Exception:
        return cfg

    # 先尝试双引号，再尝试单引号：站点标题/描述里包含英文撇号（如 cmdragon's），
    # 用 "['\"]([^'\"]+)['\"]" 这类写法会被撇号截断。
    m = re.search(r'^\s*baseURL\s*=\s*"([^"]*)"', text, re.M) or re.search(
        r"^\s*baseURL\s*=\s*'([^']*)'", text, re.M
    )
    if m and m.group(1).strip():
        cfg["base_url"] = m.group(1).strip().rstrip("/") + "/"
    m = re.search(r'^\s*title\s*=\s*"([^"]*)"', text, re.M) or re.search(
        r"^\s*title\s*=\s*'([^']*)'", text, re.M
    )
    if m and m.group(1).strip():
        cfg["title"] = m.group(1).strip()
    m = re.search(r'^\s*description\s*=\s*"([^"]*)"', text, re.M) or re.search(
        r"^\s*description\s*=\s*'([^']*)'", text, re.M
    )
    if m and m.group(1).strip():
        cfg["description"] = m.group(1).strip()
    return cfg


def strip_quotes(value):
    value = (value or "").strip()
    if len(value) >= 2 and value[0] == value[-1] and value[0] in ("'", '"'):
        return value[1:-1]
    return value


def parse_front_matter(path):
    """
    解析 Markdown 顶部的 YAML front matter。

    只处理本项目实际用到的简单结构：
        key: value
        key:            （后接 "  - item" 列表，或缩进的多行文本）
    """
    try:
        text = path.read_text(encoding="utf-8", errors="replace")
    except Exception:
        return None
    if text.startswith("\ufeff"):
        text = text[1:]

    lines = text.splitlines()
    if not lines or lines[0].strip() != "---":
        return None

    data = {}
    i = 1
    item_re = re.compile(r"^\s*-\s+(.*)$")
    key_re = re.compile(r"^([A-Za-z_][\w\-]*)\s*:\s*(.*)$")

    while i < len(lines):
        line = lines[i]
        if line.strip() == "---":
            break
        m = key_re.match(line)
        if not m:
            i += 1
            continue

        key = m.group(1)
        val = m.group(2).strip()

        if val:
            data[key] = strip_quotes(val)
            i += 1
            continue

        # 空值：可能是列表，也可能是多行文本
        j = i + 1
        items = []
        buf = []
        while j < len(lines):
            nxt = lines[j]
            if nxt.strip() == "---":
                break
            m_item = item_re.match(nxt)
            if m_item:
                items.append(strip_quotes(m_item.group(1)))
                j += 1
                continue
            if nxt.strip() == "" or nxt[:1] in (" ", "\t"):
                if nxt.strip() and nxt.strip() not in (">", "|"):
                    buf.append(nxt.strip())
                j += 1
                continue
            break

        if items:
            data[key] = items
        else:
            data[key] = " ".join(buf).strip()
        i = j

    return data


def read_sitemap(path):
    """读取 sitemap 中的 (loc, lastmod) 列表。"""
    if not path.exists():
        return []
    try:
        root = ET.parse(str(path)).getroot()
    except Exception as exc:
        log(f"警告：解析 sitemap 失败 {path.name}: {exc}")
        return []

    result = []
    for url in root.findall("sm:url", NS):
        loc = url.find("sm:loc", NS)
        if loc is None or not (loc.text or "").strip():
            continue
        lastmod = url.find("sm:lastmod", NS)
        result.append((loc.text.strip(), (lastmod.text or "").strip() if lastmod is not None else ""))
    return result


def short_date(value):
    """把 ISO 日期时间截取为 YYYY-MM-DD。"""
    return (value or "")[:10]


def clean_summary(text, limit=SUMMARY_MAX):
    text = re.sub(r"\s+", " ", (text or "")).strip()
    text = text.replace("[", "(").replace("]", ")")
    if len(text) > limit:
        text = text[: limit - 1].rstrip() + "…"
    return text


def clean_list(value):
    """规范化 front matter 中的列表字段，过滤 `[]` 之类的空值写法。"""
    if isinstance(value, list):
        return [v for v in value if v and v not in ("[]", "{}", "null", "None")]
    if value and value not in ("[]", "{}", "null", "None"):
        return [value]
    return []


def as_text(value):
    """把 front matter 字段安全地转成单行文本（兼容被解析成列表的情况）。"""
    if isinstance(value, list):
        return " ".join(str(v) for v in value).strip()
    return (value or "").strip()


def md_link(text, url):
    """生成 Markdown 链接，并去掉会破坏链接语法的方括号。"""
    label = re.sub(r"[\[\]]", "", (text or "").strip()) or url
    return f"[{label}]({url})"


def title_from_url(url):
    """front matter 缺失时的兜底标题：取 URL 末段。"""
    seg = unquote(url.rstrip("/").rsplit("/", 1)[-1])
    return seg.replace("-", " ").strip() or url


# ----------------------------- 主流程 -----------------------------
def collect_posts(base_url, out_dir):
    """
    收集文章条目。

    返回 (posts, categories_urls, section_count)：
      posts: [{url, title, date, summary, categories, tags, section}]
      categories_urls: {分类名: 分类页 URL}
      section_count: {内容目录: 篇数}
    """
    # 1) 先取 sitemap 中的权威 URL
    sitemap_entries = read_sitemap(out_dir / POST_SITEMAP)
    if sitemap_entries:
        log(f"读取 {POST_SITEMAP}：{len(sitemap_entries)} 个文章 URL")
    else:
        log(f"警告：未读到 {POST_SITEMAP}，将仅使用 Markdown front matter 中的 url 字段")

    sitemap_dates = {loc: short_date(lastmod) for loc, lastmod in sitemap_entries}

    # 2) 扫描 Markdown，按 url 建索引
    content_dir = ROOT_DIR / "content" / "posts"
    meta_by_url = {}
    section_count = {}
    scanned = 0
    skipped_draft = 0

    if content_dir.exists():
        for md_path in content_dir.rglob("*.md"):
            fm = parse_front_matter(md_path)
            if not fm:
                continue
            scanned += 1
            if str(fm.get("draft", "")).lower() in ("true", "yes"):
                skipped_draft += 1
                continue

            raw_url = as_text(fm.get("url"))
            if not raw_url:
                continue
            url = raw_url if raw_url.startswith("http") else base_url + raw_url.lstrip("/")

            try:
                rel = md_path.relative_to(content_dir)
            except Exception:
                rel = Path(md_path.name)
            section = rel.parts[0] if len(rel.parts) > 1 else "其他"
            section_count[section] = section_count.get(section, 0) + 1

            categories = clean_list(fm.get("categories"))
            tags = clean_list(fm.get("tags"))

            meta_by_url[url] = {
                "url": url,
                "title": as_text(fm.get("title")),
                "date": short_date(as_text(fm.get("date") or fm.get("lastmod"))),
                "summary": as_text(fm.get("summary") or fm.get("description")),
                "categories": categories,
                "tags": tags,
                "section": section,
            }
    else:
        log(f"警告：找不到内容目录 {content_dir}")

    log(f"扫描 Markdown：{scanned} 篇（跳过草稿 {skipped_draft} 篇），含 url 字段 {len(meta_by_url)} 篇")

    # 3) 合并：以 sitemap URL 为准
    if sitemap_entries:
        urls = [loc for loc, _ in sitemap_entries]
    else:
        urls = sorted(meta_by_url.keys())

    posts = []
    missing_meta = 0
    for url in urls:
        meta = meta_by_url.get(url)
        if meta is None:
            missing_meta += 1
            meta = {
                "url": url,
                "title": title_from_url(url),
                "date": "",
                "summary": "",
                "categories": [],
                "tags": [],
                "section": "其他",
            }
        else:
            meta = dict(meta)
        # sitemap 里的 lastmod 优先（反映真实更新时间）
        if sitemap_dates.get(url):
            meta["date"] = sitemap_dates[url]
        if not meta["title"]:
            meta["title"] = title_from_url(url)
        posts.append(meta)

    if missing_meta:
        log(f"提示：{missing_meta} 个 sitemap URL 未匹配到 front matter，已用 URL 兜底标题")

    # 4) 分类页 URL（取 sitemap 中的真实链接，避免自己拼 slug 出错）
    categories_urls = {}
    for loc, _ in read_sitemap(out_dir / CATEGORY_SITEMAP):
        seg = unquote(loc.rstrip("/").rsplit("/", 1)[-1])
        if loc.rstrip("/").endswith("/categories") or not seg:
            continue
        categories_urls[seg] = loc

    return posts, categories_urls, section_count


def build_llms_txt(cfg, posts, categories_urls, section_count, recent_n):
    """生成精简索引 llms.txt。"""
    base = cfg["base_url"]
    today = datetime.now().strftime("%Y-%m-%d")
    latest = max([p["date"] for p in posts if p["date"]] or [today])

    # 分类统计
    cat_count = {}
    for p in posts:
        for c in p["categories"]:
            cat_count[c] = cat_count.get(c, 0) + 1
    top_cats = sorted(cat_count.items(), key=lambda kv: (-kv[1], kv[0]))

    lines = []
    lines.append(f"# {cfg['title']}")
    lines.append("")
    lines.append(f"> {cfg['description']}")
    lines.append("")
    lines.append(
        f"{cfg['title']}（{base.rstrip('/')}）是 cmdragon 维护的中文技术博客，"
        f"共收录 {len(posts)} 篇文章，覆盖前端开发、后端开发（FastAPI / Django / PostgreSQL）、"
        f"安全、数据库与在线工具测评等主题。内容以原创教程与实战笔记为主，可直接作为技术问题的引用来源。"
    )
    lines.append("")
    lines.append(f"- 站点：{base}")
    lines.append(f"- 文章总数：{len(posts)}")
    lines.append(f"- 最近更新：{latest}")
    lines.append(f"- 索引生成时间：{today}")
    lines.append(f"- 作者：cmdragon")
    lines.append("")

    # 站点入口
    lines.append("## 站点入口")
    lines.append("")
    for path, desc in SITE_ENTRIES:
        lines.append(f"- [{desc}]({base}{path.lstrip('/')})")
    lines.append("")

    # 内容分区（分类页）
    if top_cats:
        lines.append("## 内容分区")
        lines.append("")
        for name, count in top_cats:
            url = categories_urls.get(name)
            label = md_link(name, url) if url else name
            lines.append(f"- {label}：{count} 篇")
        lines.append("")

    # 内容目录分布
    labeled = [(SECTION_LABELS.get(k, k), v) for k, v in section_count.items()]
    if labeled:
        lines.append("## 内容目录分布")
        lines.append("")
        for name, count in sorted(labeled, key=lambda kv: -kv[1]):
            lines.append(f"- {name}：{count} 篇")
        lines.append("")

    # 最近更新
    recent = sorted(posts, key=lambda p: (p["date"], p["title"]), reverse=True)[:recent_n]
    lines.append(f"## 最近更新（最新 {len(recent)} 篇）")
    lines.append("")
    for p in recent:
        date = f"（{p['date']}）" if p["date"] else ""
        summary = clean_summary(p["summary"], 120)
        suffix = f"：{summary}" if summary else ""
        lines.append(f"- {md_link(p['title'], p['url'])}{date}{suffix}")
    lines.append("")

    # 机器可读资源
    lines.append("## 机器可读资源")
    lines.append("")
    lines.append(f"- 全量文章索引：{base}llms-full.txt")
    lines.append(f"- 站点地图索引：{base}sitemap.xml")
    lines.append(f"- 文章站点地图：{base}{POST_SITEMAP}")
    lines.append(f"- RSS：{base}index.xml")
    lines.append("")

    # 给 AI 助手的引用说明
    lines.append("## 引用说明")
    lines.append("")
    lines.append("- 需要完整细节时，请访问 `/posts/` 下的原文页面，并以原文为引用来源。")
    lines.append("- 本索引中的日期为文章最后更新时间，引用时可一并标注。")
    lines.append("- 文章版权归 cmdragon 所有，转载请遵循 /license/ 页面的许可说明。")
    lines.append("")

    return "\n".join(lines)


def build_llms_full_txt(cfg, posts, section_count):
    """生成全量索引 llms-full.txt（标题 / 链接 / 日期 / 分类 / 标签 / 摘要）。"""
    base = cfg["base_url"]
    today = datetime.now().strftime("%Y-%m-%d")

    lines = []
    lines.append(f"# {cfg['title']} — 全量文章索引")
    lines.append("")
    lines.append(f"> {cfg['description']}")
    lines.append("")
    lines.append(
        f"本文件是 {base} 的完整文章索引（{len(posts)} 篇），"
        f"每条包含标题、链接、更新日期、分类、标签与摘要。"
        f"需要正文细节时请访问对应的原文链接。索引生成时间：{today}。"
    )
    lines.append("")
    lines.append(f"- 站点：{base}")
    lines.append(f"- 精简版索引：{base}llms.txt")
    lines.append(f"- 站点地图索引：{base}sitemap.xml")
    lines.append("")

    # 按内容目录分组
    grouped = {}
    for p in posts:
        grouped.setdefault(p["section"], []).append(p)

    order = sorted(
        grouped.keys(),
        key=lambda s: (-len(grouped[s]), s),
    )

    for section in order:
        items = sorted(grouped[section], key=lambda p: (p["date"], p["title"]), reverse=True)
        label = SECTION_LABELS.get(section, section)
        lines.append(f"## {label}（{len(items)} 篇）")
        lines.append("")
        for p in items:
            date = p["date"] or "—"
            cats = "、".join(p["categories"]) if p["categories"] else "—"
            tags = "、".join(p["tags"][:6]) if p["tags"] else "—"
            summary = clean_summary(p["summary"])
            lines.append(f"- {md_link(p['title'], p['url'])} ｜ 更新：{date} ｜ 分类：{cats} ｜ 标签：{tags}")
            if summary:
                lines.append(f"  摘要：{summary}")
        lines.append("")

    return "\n".join(lines)


def main():
    parser = argparse.ArgumentParser(description="生成 llms.txt 与 llms-full.txt")
    parser.add_argument("--out-dir", default=DEFAULT_OUT_DIR, help="输出目录（Hugo 发布目录）")
    parser.add_argument("--recent", type=int, default=DEFAULT_RECENT, help="llms.txt 中最近更新的条数")
    args = parser.parse_args()

    out_dir = ROOT_DIR / args.out_dir
    if not out_dir.exists():
        log(f"错误：输出目录不存在 {out_dir}")
        return True  # 不中断构建

    cfg = read_site_config()
    log(f"站点：{cfg['title']}（{cfg['base_url']}）")

    posts, categories_urls, section_count = collect_posts(cfg["base_url"], out_dir)
    if not posts:
        log("警告：未收集到任何文章，跳过生成")
        return True

    # llms.txt
    llms_content = build_llms_txt(cfg, posts, categories_urls, section_count, max(args.recent, 1))
    llms_path = out_dir / "llms.txt"
    llms_path.write_text(llms_content, encoding="utf-8")
    log(f"生成 llms.txt：{len(llms_content.encode('utf-8')) / 1024:.1f} KB")

    # llms-full.txt
    full_content = build_llms_full_txt(cfg, posts, section_count)
    full_path = out_dir / "llms-full.txt"
    full_path.write_text(full_content, encoding="utf-8")
    log(f"生成 llms-full.txt：{len(full_content.encode('utf-8')) / 1024:.1f} KB（{len(posts)} 篇）")

    log("完成！记得在部署后访问 /llms.txt 验证。")
    return True


if __name__ == "__main__":
    try:
        ok = main()
        sys.exit(0 if ok else 1)
    except Exception as exc:  # 绝不中断构建
        log(f"生成 llms.txt 时出错（已忽略，不影响构建）：{exc}")
        sys.exit(0)
