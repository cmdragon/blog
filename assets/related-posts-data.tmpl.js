// 相关文章推荐 - 全站文章数据
// 由 Hugo 构建时从 content 生成，独立于各页面 HTML。
// 新增/修改文章时只重传本文件，不会影响文章页 HTML 的缓存命中。
window.__ALL_POSTS__ = [
{{- $pages := where site.RegularPages "Type" "in" site.Params.mainSections }}
{{- range $i, $p := $pages }}
{{- if $i }},{{- end }}
  {
    "title": {{ $p.Title | jsonify }},
    "summary": {{ $p.Summary | plainify | jsonify }},
    "content": {{ $p.Plain | truncate 300 | jsonify }},
    "categories": {{ $p.Params.categories | jsonify }},
    "tags": {{ $p.Params.tags | jsonify }},
    "url": {{ $p.Permalink | jsonify }},
    "date": {{ $p.Date.Format "2006-01-02" | jsonify }},
    "cover": {{ $p.Params.cover | default "" | jsonify }}
  }
{{- end }}
];
