#!/usr/bin/env python3
"""
Script to split the search index into smaller chunks
"""

import json
import os
import shutil

# Configuration
SEARCH_INDEX_PATH = 'public/index.json'
SEARCH_INDEX_DIR = 'public/search-index'
TARGET_CHUNK_SIZE = 500 * 1024  # 500KB per chunk


def split_search_index():
    """
    Split the search index into smaller chunks based on file size
    After splitting, the original full index file is deleted
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
    
    # Calculate approximate size per item by serializing a few items
    if pages:
        sample_items = pages[:5]
        sample_size = len(json.dumps(sample_items, ensure_ascii=False, indent=2).encode('utf-8'))
        avg_item_size = sample_size / len(sample_items)
        print(f"Estimated average item size: {avg_item_size:.2f} bytes")
    else:
        avg_item_size = 1000
    
    # Build chunks
    chunks = []
    current_chunk = []
    current_size = 0
    chunk_index = 0
    
    for item in pages:
        # Estimate item size
        item_size = len(json.dumps(item, ensure_ascii=False, indent=2).encode('utf-8'))
        
        # Check if adding this item would exceed the target size
        if current_size + item_size > TARGET_CHUNK_SIZE:
            # Save current chunk
            if current_chunk:
                chunk_filename = f'index-{chunk_index}.json'
                chunk_path = os.path.join(SEARCH_INDEX_DIR, chunk_filename)
                
                with open(chunk_path, 'w', encoding='utf-8') as f:
                    json.dump(current_chunk, f, ensure_ascii=False, indent=2)
                
                chunks.append(chunk_filename)
                print(f"Created chunk {chunk_index}: {len(current_chunk)} pages, ~{current_size/1024:.1f}KB")
                
                # Start new chunk
                current_chunk = [item]
                current_size = item_size
                chunk_index += 1
            else:
                # Single item is larger than target size, add it anyway
                chunk_filename = f'index-{chunk_index}.json'
                chunk_path = os.path.join(SEARCH_INDEX_DIR, chunk_filename)
                
                with open(chunk_path, 'w', encoding='utf-8') as f:
                    json.dump([item], f, ensure_ascii=False, indent=2)
                
                chunks.append(chunk_filename)
                print(f"Created chunk {chunk_index}: 1 page, ~{item_size/1024:.1f}KB (single item exceeds target size)")
                chunk_index += 1
                current_chunk = []
                current_size = 0
        else:
            # Add item to current chunk
            current_chunk.append(item)
            current_size += item_size
    
    # Save the last chunk
    if current_chunk:
        chunk_filename = f'index-{chunk_index}.json'
        chunk_path = os.path.join(SEARCH_INDEX_DIR, chunk_filename)
        
        with open(chunk_path, 'w', encoding='utf-8') as f:
            json.dump(current_chunk, f, ensure_ascii=False, indent=2)
        
        chunks.append(chunk_filename)
        print(f"Created chunk {chunk_index}: {len(current_chunk)} pages, ~{current_size/1024:.1f}KB")
        chunk_index += 1
    
    total_chunks = chunk_index
    print(f"Split into {total_chunks} chunks")
    
    # Delete the original full index file
    try:
        os.remove(SEARCH_INDEX_PATH)
        print(f"Deleted original index file: {SEARCH_INDEX_PATH}")
    except OSError as e:
        print(f"Warning: Could not delete original file: {e}")
    
    # Create new index file that references the chunks
    new_index = {
        "totalChunks": total_chunks,
        "targetChunkSize": TARGET_CHUNK_SIZE,
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
