#!/usr/bin/env python3
"""
Script to split the search index into smaller chunks

分片策略说明（2026-08-16 优化）：
- 之前按"顺序 + 字节大小"切分，新增一篇文章会改变所有后续分片的边界，
  导致每次部署几乎全部分片内容变化、Wrangler 哈希去重失效、全量重传。
- 现在改为按文章 URL 的稳定哈希分桶：每篇文章固定落在某个分片，
  新增/修改一篇文章只影响它所在的那一个分片，其余分片内容保持不变。
"""

import json
import os

# Configuration
SEARCH_INDEX_PATH = 'public/index.json'
SEARCH_INDEX_DIR = 'public/search-index'
# 固定分片数量。分片数固定后，文章落在哪个分片只由其 URL 哈希决定，
# 与文章总数无关，从而保证增量稳定。
NUM_CHUNKS = 32


def split_search_index():
    """
    Split the search index into smaller chunks based on stable URL hashing.
    After splitting, the original full index file is deleted.
    """
    # Read the original search index
    if not os.path.exists(SEARCH_INDEX_PATH):
        print(f"Error: {SEARCH_INDEX_PATH} does not exist")
        return False
    
    # Get the size of the original file
    original_size = os.path.getsize(SEARCH_INDEX_PATH)
    print(f"Original index size: {original_size / 1024:.1f}KB")
    
    with open(SEARCH_INDEX_PATH, 'r', encoding='utf-8') as f:
        try:
            index_data = json.load(f)
        except json.JSONDecodeError as e:
            print(f"Error parsing JSON: {e}")
            return False
    
    # Check if it's already a chunked index
    if isinstance(index_data, dict) and 'chunks' in index_data:
        print("Search index is already chunked")
        return True
    
    # It's the old-style full index
    if isinstance(index_data, list):
        pages = index_data
    else:
        print("Error: Unexpected index format")
        return False
    
    total_pages = len(pages)
    print(f"Found {total_pages} pages")
    
    # Create search-index directory if it doesn't exist
    os.makedirs(SEARCH_INDEX_DIR, exist_ok=True)
    print(f"Created/verified directory: {SEARCH_INDEX_DIR}")
    
    # 按 URL 稳定哈希分桶：每篇文章固定落在 NUM_CHUNKS 个分片之一。
    # 使用 URL（或 permalink）作为稳定键，保证新增/删除文章只影响对应分片。
    buckets = [[] for _ in range(NUM_CHUNKS)]
    for item in pages:
        key = item.get('url') or item.get('permalink') or item.get('title') or ''
        # 稳定哈希（Python 内置 hash 对字符串跨进程可能因随机化而不同，改用确定性哈希）
        h = 0
        for ch in key:
            h = (h * 31 + ord(ch)) & 0xFFFFFFFF
        idx = h % NUM_CHUNKS
        buckets[idx].append(item)
    
    # 写出各分片（仅写非空分片，文件名固定为 index-<i>.json）
    chunks = []
    for i in range(NUM_CHUNKS):
        if not buckets[i]:
            continue
        chunk_filename = f'index-{i}.json'
        chunk_path = os.path.join(SEARCH_INDEX_DIR, chunk_filename)
        with open(chunk_path, 'w', encoding='utf-8') as f:
            json.dump(buckets[i], f, ensure_ascii=False, indent=2)
        chunks.append(chunk_filename)
        size = os.path.getsize(chunk_path)
        print(f"Created chunk {i}: {len(buckets[i])} pages, ~{size/1024:.1f}KB")
    
    total_chunks = len(chunks)
    print(f"Split into {total_chunks} chunks")
    # 清理可能残留的旧分片文件（数量从 37 变为 32 后，多余文件需删除）
    for old_name in os.listdir(SEARCH_INDEX_DIR):
        if old_name.startswith('index-') and old_name.endswith('.json'):
            if old_name not in chunks:
                old_path = os.path.join(SEARCH_INDEX_DIR, old_name)
                os.remove(old_path)
                print(f"Removed stale chunk: {old_name}")
    
    # Delete the original full index file
    try:
        os.remove(SEARCH_INDEX_PATH)
        print(f"Deleted original index file: {SEARCH_INDEX_PATH}")
    except OSError as e:
        print(f"Warning: Could not delete original file: {e}")
    
    # Create new index file that references the chunks
    new_index = {
        "totalChunks": total_chunks,
        "numChunks": NUM_CHUNKS,
        "totalPages": total_pages,
        "chunks": chunks
    }
    
    # Write the index file to the search-index directory
    index_file_path = os.path.join(SEARCH_INDEX_DIR, 'index.json')
    with open(index_file_path, 'w', encoding='utf-8') as f:
        json.dump(new_index, f, ensure_ascii=False, indent=2)
    
    new_size = os.path.getsize(index_file_path)
    print(f"Created new index file: {index_file_path} ({new_size / 1024:.1f}KB)")
    print(f"Space saved: {(original_size - new_size) / 1024:.1f}KB")
    
    return True


if __name__ == "__main__":
    success = split_search_index()
    if success:
        print("Search index split successfully")
    else:
        print("Failed to split search index")
