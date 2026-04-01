#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Hugo Sitemap 分割脚本
将大的 sitemap.xml 分割成多个小文件并创建 sitemapindex
"""

import os
import xml.etree.ElementTree as ET
from datetime import datetime
from pathlib import Path

def main():
    # 配置路径
    script_dir = Path(__file__).parent
    root_dir = script_dir.parent
    public_path = root_dir / "public"
    sitemap_path = public_path / "sitemap.xml"
    base_url = "https://blog.cmdragon.cn"
    
    if not sitemap_path.exists():
        print(f"错误：找不到 sitemap.xml 文件：{sitemap_path}")
        return False
    
    # 读取 sitemap.xml
    print(f"读取 sitemap.xml...")
    tree = ET.parse(sitemap_path)
    root = tree.getroot()
    
    # 定义命名空间
    ns = {'sitemap': 'http://www.sitemaps.org/schemas/sitemap/0.9',
          'xhtml': 'http://www.w3.org/1999/xhtml'}
    
    urls = root.findall('sitemap:url', ns)
    print(f"总 URL 数：{len(urls)}")
    
    # 分类 URLs（自动去重）
    seen_locs = set()
    posts = []
    tags = []
    categories = []
    pages = []
    
    for url in urls:
        loc = url.find('sitemap:loc', ns)
        if loc is not None:
            loc_text = loc.text
            # 检查是否已经处理过该 URL
            if loc_text in seen_locs:
                continue
            seen_locs.add(loc_text)
            
            if '/posts/' in loc_text:
                posts.append(url)
            elif '/tags/' in loc_text:
                tags.append(url)
            elif '/categories/' in loc_text:
                categories.append(url)
            else:
                pages.append(url)
    
    print(f"Posts: {len(posts)}")
    print(f"Tags: {len(tags)}")
    print(f"Categories: {len(categories)}")
    print(f"Pages: {len(pages)}")
    print(f"已去重 URL: {len(urls) - len(seen_locs)} 个")
    
    # 获取当前日期（用于缺失的 lastmod）
    current_date = datetime.now().astimezone().strftime('%Y-%m-%dT%H:%M:%S%z')
    # 格式化时区（添加冒号）
    current_date = current_date[:-2] + ':' + current_date[-2:]
    
    # 创建新的 sitemap XML
    def create_sitemap(urls_list):
        """创建 sitemap XML 结构，为缺失的 lastmod 添加默认值"""
        new_root = ET.Element('urlset')
        new_root.set('xmlns', 'http://www.sitemaps.org/schemas/sitemap/0.9')
        new_root.set('xmlns:xhtml', 'http://www.w3.org/1999/xhtml')
        
        for url in urls_list:
            new_url = ET.SubElement(new_root, 'url')
            
            # 复制所有子元素
            has_lastmod = False
            for child in url:
                tag_name = child.tag.split('}')[-1]
                new_child = ET.SubElement(new_url, tag_name)
                new_child.text = child.text
                # 复制属性
                for key, value in child.attrib.items():
                    new_child.set(key, value)
                # 检查是否有 lastmod
                if tag_name == 'lastmod':
                    has_lastmod = True
            
            # 如果没有 lastmod，添加当前日期
            if not has_lastmod:
                lastmod_elem = ET.SubElement(new_url, 'lastmod')
                lastmod_elem.text = current_date
        
        return new_root
    
    # 保存各个 sitemap 文件
    def save_sitemap(urls_list, filename):
        """保存 sitemap 到文件"""
        if not urls_list:
            print(f"跳过 {filename}（无数据）")
            return
        
        new_root = create_sitemap(urls_list)
        new_tree = ET.ElementTree(new_root)
        
        # 添加 XML 声明并保存
        output_path = public_path / filename
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write('<?xml version="1.0" encoding="utf-8" standalone="yes"?>\n')
            new_tree.write(f, encoding='unicode', xml_declaration=False)
        
        print(f"保存 {filename} - {len(urls_list)} 个 URL")
    
    # 保存各个 sitemap 文件
    save_sitemap(posts, "sitemap-posts.xml")
    save_sitemap(tags, "sitemap-tags.xml")
    save_sitemap(categories, "sitemap-categories.xml")
    save_sitemap(pages, "sitemap-pages.xml")
    
    # 创建 sitemapindex
    print(f"\n创建 sitemapindex.xml...")
    now = datetime.now().astimezone().strftime('%Y-%m-%dT%H:%M:%S%z')
    # 格式化时区（添加冒号）
    now = now[:-2] + ':' + now[-2:]
    
    sitemap_index = ET.Element('sitemapindex')
    sitemap_index.set('xmlns', 'http://www.sitemaps.org/schemas/sitemap/0.9')
    
    sitemaps = [
        "sitemap-posts.xml",
        "sitemap-tags.xml",
        "sitemap-categories.xml",
        "sitemap-pages.xml"
    ]
    
    for sitemap_file in sitemaps:
        sitemap_elem = ET.SubElement(sitemap_index, 'sitemap')
        loc = ET.SubElement(sitemap_elem, 'loc')
        loc.text = f"{base_url}/{sitemap_file}"
        lastmod = ET.SubElement(sitemap_elem, 'lastmod')
        lastmod.text = now
    
    # 保存 sitemapindex
    index_tree = ET.ElementTree(sitemap_index)
    index_path = public_path / "sitemapindex.xml"
    with open(index_path, 'w', encoding='utf-8') as f:
        f.write('<?xml version="1.0" encoding="utf-8" standalone="yes"?>\n')
        index_tree.write(f, encoding='unicode', xml_declaration=False)
    
    print(f"保存 sitemapindex.xml")
    
    # 显示生成的文件
    print(f"\n生成的文件:")
    sitemap_files = list(public_path.glob("sitemap*.xml"))
    for sitemap_file in sorted(sitemap_files):
        size_kb = sitemap_file.stat().st_size / 1024
        print(f"  {sitemap_file.name}: {size_kb:.2f} KB")
    
    # 删除原始的 sitemap.xml
    print(f"\n删除原始 sitemap.xml...")
    if sitemap_path.exists():
        sitemap_path.unlink()
        print(f"已删除：{sitemap_path}")
    
    # 重命名 sitemapindex.xml 为 sitemap.xml
    index_path = public_path / "sitemapindex.xml"
    new_sitemap_path = public_path / "sitemap.xml"
    if index_path.exists():
        import shutil
        shutil.move(str(index_path), str(new_sitemap_path))
        print(f"已重命名：sitemapindex.xml -> sitemap.xml")
    
    print(f"\n完成！")
    print(f"请在 Google Search Console 中提交：{base_url}/sitemap.xml")
    
    return True

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
