#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
IndexNow 自动提交脚本
===================

在 Hugo 构建完成后运行，将 sitemap 中"新增"或"更新"的文章 URL 提交给 IndexNow，
让支持该协议的搜索引擎（Bing、Yandex、Seznam、Naver 等）更快收录。

依赖：仅使用 Python 标准库（与本项目其他脚本风格一致）。

用法：
    python scripts/indexnow_submit.py                 # 正常提交（新增+更新）
    python scripts/indexnow_submit.py --dry-run       # 只预览待提交 URL，不实际请求
    python scripts/indexnow_submit.py --all           # 提交 sitemap 中全部 URL（慎用）
    python scripts/indexnow_submit.py --since-days 3  # 首次运行只取最近 3 天
    python scripts/indexnow_submit.py --no-include-updated   # 仅提交新增，不提交更新

环境变量：
    INDEXNOW_KEY       覆盖默认密钥（推荐在 CI 中通过环境变量注入，勿硬编码）
    INDEXNOW_ENABLED   设为 false / 0 / no 可临时关闭提交
    INDEXNOW_HOST      覆盖站点 host（默认从 hugo.toml 解析 baseURL）

退出码：恒为 0。本脚本挂在 `npm run build` 末尾，任何异常都不得中断构建流程。
"""

import sys
import os
import json
import argparse
import urllib.request
import urllib.error
from pathlib import Path
from datetime import datetime, timezone, timedelta
from xml.etree import ElementTree as ET

# ----------------------------- 配置 -----------------------------
# 默认 IndexNow 密钥（同时需存在于 static/<key>.txt 供搜索引擎校验）。
# 已通过 static/7d3f9a2c6b8e4105af27c9d1e4b6308f.txt 部署。
DEFAULT_KEY = "7d3f9a2c6b8e4105af27c9d1e4b6308f"

# IndexNow 官方端点
INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow"

# 密钥验证文件路径（相对站点根）
KEY_FILE_NAME = f"{DEFAULT_KEY}.txt"

# sitemap 文件（由 scripts/split_sitemap.py 生成，仅含 /posts/ 文章 URL）
POST_SITEMAP = "sitemap-posts.xml"

# 本地提交缓存（记录已成功提交的 URL 及其 lastmod）
CACHE_DIR = Path(".cache")
CACHE_FILE = CACHE_DIR / "indexnow_submitted.json"

# 单次提交的 URL 批大小（IndexNow 允许上限 10000，200 较稳妥）
BATCH_SIZE = 200

# 首次运行（无缓存）时，仅提交最近多少天内的 URL，避免一次性提交上千条
DEFAULT_SINCE_DAYS = 7

# HTTP 请求超时（秒）
HTTP_TIMEOUT = 30

# sitemap 命名空间
NS = {
    "sm": "http://www.sitemaps.org/schemas/sitemap/0.9",
}


def log(msg):
    # Windows 控制台中文兼容：必要时重配置 stdout 编码
    try:
        if hasattr(sys.stdout, "reconfigure"):
            sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass
    print(msg, flush=True)


def parse_lastmod(value):
    """解析 sitemap lastmod 为带时区的 datetime；失败返回 None。"""
    if not value:
        return None
    text = value.strip()
    if not text:
        return None
    # 兼容以 Z 结尾的 UTC 表示
    if text.endswith("Z"):
        text = text[:-1] + "+00:00"
    try:
        dt = datetime.fromisoformat(text)
    except Exception:
        return None
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt


def resolve_base_url(repo_root):
    """从 hugo.toml 解析 baseURL，返回 (host, base_without_slash)。"""
    hugo_toml = repo_root / "hugo.toml"
    base = None
    try:
        text = hugo_toml.read_text(encoding="utf-8")
        for line in text.splitlines():
            s = line.strip()
            if s.startswith("baseURL"):
                # baseURL = 'https://blog.cmdragon.cn/'
                if "=" in s:
                    val = s.split("=", 1)[1].strip()
                    val = val.strip("\"'")
                    base = val
                    break
    except Exception:
        base = None
    if not base:
        base = "https://blog.cmdragon.cn/"
    # 去掉尾斜杠
    base_no_slash = base.rstrip("/")
    # 提取 host
    host = base_no_slash.split("://", 1)[-1]
    return host, base_no_slash


def load_urls_from_sitemap(path):
    """读取 sitemap 文件，返回 [(url, lastmod_str), ...]，文件不存在返回 None。"""
    if not path.exists():
        return None
    try:
        tree = ET.parse(path)
        root = tree.getroot()
    except Exception as e:
        log(f"[indexnow] 解析 {path} 失败：{e}")
        return []
    urls = []
    for url_el in root.findall("sm:url", NS):
        loc_el = url_el.find("sm:loc", NS)
        lastmod_el = url_el.find("sm:lastmod", NS)
        if loc_el is None or not loc_el.text:
            continue
        loc = loc_el.text.strip()
        lastmod = lastmod_el.text.strip() if (lastmod_el is not None and lastmod_el.text) else ""
        urls.append((loc, lastmod))
    return urls


def load_cache():
    if not CACHE_FILE.exists():
        return {}
    try:
        return json.loads(CACHE_FILE.read_text(encoding="utf-8"))
    except Exception:
        return {}


def save_cache(cache):
    try:
        CACHE_DIR.mkdir(parents=True, exist_ok=True)
        CACHE_FILE.write_text(json.dumps(cache, ensure_ascii=False, indent=2), encoding="utf-8")
    except Exception as e:
        log(f"[indexnow] 写入缓存失败（不影响提交）：{e}")


def compute_pending(entries, cache, include_updated, since_days, submit_all):
    """计算待提交 URL 列表 [(url, lastmod_str), ...] 及原因描述。"""
    submitted = cache.get("submitted", {})
    if submit_all:
        return entries, "全部提交（--all）"

    has_cache = bool(submitted)
    pending = []
    for url, lastmod in entries:
        if url not in submitted:
            pending.append((url, lastmod))
        elif include_updated and lastmod and submitted.get(url) != lastmod:
            pending.append((url, lastmod))

    if not has_cache:
        # 首次运行：仅取最近 N 天，避免一次性提交上千条
        cutoff = datetime.now(timezone.utc) - timedelta(days=since_days)
        filtered = []
        skipped_no_lastmod = 0
        for url, lastmod in pending:
            dt = parse_lastmod(lastmod)
            if dt is None:
                skipped_no_lastmod += 1
                continue
            if dt >= cutoff:
                filtered.append((url, lastmod))
        reason = (f"首次运行：仅提交最近 {since_days} 天"
                  f"（{len(filtered)} 条，跳过无 lastmod 的 {skipped_no_lastmod} 条）")
        return filtered, reason

    return pending, f"与缓存对比得到新增/更新（{len(pending)} 条）"


def submit_batch(host, key, key_location, url_list):
    """提交一批 URL，返回 (success: bool, status_or_error: str)。"""
    payload = {
        "host": host,
        "key": key,
        "keyLocation": key_location,
        "urlList": url_list,
    }
    data = json.dumps(payload, ensure_ascii=False).encode("utf-8")
    req = urllib.request.Request(
        INDEXNOW_ENDPOINT,
        data=data,
        headers={"Content-Type": "application/json; charset=utf-8"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=HTTP_TIMEOUT) as resp:
            return True, str(resp.status)
    except urllib.error.HTTPError as e:
        return False, f"HTTP {e.code}: {e.read().decode('utf-8', 'replace')[:200]}"
    except Exception as e:
        return False, str(e)[:200]


def main():
    repo_root = Path(__file__).resolve().parent.parent
    public_dir = repo_root / "public"

    parser = argparse.ArgumentParser(description="IndexNow 自动提交")
    parser.add_argument("--dry-run", action="store_true", help="只预览，不实际请求")
    parser.add_argument("--all", action="store_true", help="提交 sitemap 中全部 URL")
    parser.add_argument("--since-days", type=int, default=DEFAULT_SINCE_DAYS)
    parser.add_argument("--batch-size", type=int, default=BATCH_SIZE)
    parser.add_argument("--no-include-updated", action="store_true", help="仅新增，不提交更新")
    parser.add_argument("--sitemap", default=None, help="自定义 sitemap 路径")
    parser.add_argument("--cache-file", default=None, help="自定义缓存路径")
    args = parser.parse_args()

    global CACHE_FILE
    if args.cache_file:
        CACHE_FILE = Path(args.cache_file)

    # 环境变量开关
    if os.environ.get("INDEXNOW_ENABLED", "").lower() in ("false", "0", "no", "off"):
        log("[indexnow] INDEXNOW_ENABLED=false，已跳过提交。")
        return
    key = os.environ.get("INDEXNOW_KEY", DEFAULT_KEY).strip()
    if not key:
        log("[indexnow] 未配置 IndexNow 密钥，跳过。")
        return

    host, base = resolve_base_url(repo_root)
    key_location = f"{base}/{KEY_FILE_NAME}"

    # 读取 sitemap
    if args.sitemap:
        sm_path = Path(args.sitemap)
        entries = load_urls_from_sitemap(sm_path)
    else:
        entries = load_urls_from_sitemap(public_dir / POST_SITEMAP)

    if entries is None:
        log(f"[indexnow] 找不到 {POST_SITEMAP}（可能 hugo 构建未产出），跳过。")
        return
    if not entries:
        log("[indexnow] sitemap 中无文章 URL，跳过。")
        return

    log(f"[indexnow] 从 sitemap 读取到 {len(entries)} 条文章 URL。")

    cache = load_cache()
    pending, reason = compute_pending(
        entries, cache, not args.no_include_updated, args.since_days, args.all
    )
    log(f"[indexnow] 待提交：{reason}。")

    if not pending:
        log("[indexnow] 无待提交 URL。")
        return

    if args.dry_run:
        log("[indexnow] [dry-run] 以下 URL 将被提交：")
        for u, _ in pending:
            log(f"  - {u}")
        return

    # 分批提交
    success_urls = []
    batch_size = max(1, args.batch_size)
    batches = [pending[i:i + batch_size] for i in range(0, len(pending), batch_size)]
    for idx, batch in enumerate(batches, 1):
        url_list = [u for u, _ in batch]
        ok, info = submit_batch(host, key, key_location, url_list)
        if ok:
            log(f"[indexnow] 第 {idx}/{len(batches)} 批提交成功（{len(url_list)} 条）。")
            success_urls.extend(batch)
        else:
            log(f"[indexnow] 第 {idx}/{len(batches)} 批提交失败：{info}（继续后续批次）")

    if success_urls:
        submitted = cache.get("submitted", {})
        for u, lastmod in success_urls:
            submitted[u] = lastmod
        cache["submitted"] = submitted
        cache["host"] = host
        cache["updated_at"] = datetime.now(timezone.utc).isoformat()
        save_cache(cache)
        log(f"[indexnow] 已更新缓存，累计记录 {len(submitted)} 条。")
    else:
        log("[indexnow] 本批次无成功提交，缓存保持不变。")


if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        log(f"[indexnow] 发生异常（已忽略，不中断构建）：{e}")
    sys.exit(0)
