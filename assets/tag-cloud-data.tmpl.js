// 全站热门标签数据（footer 标签云用）
// 由 Hugo 构建时从 taxonomy 生成，独立于各页面 HTML。
// 新增文章导致标签计数变化时，只有本文件内容更新，
// 全站页面 HTML 保持不变，保障 Cloudflare Pages 部署的缓存命中。
window.__TAG_CLOUD__ = [
{{- range $i, $t := first 10 site.Taxonomies.tags.ByCount }}
{{- if $i }},{{- end }}
  { "name": {{ $t.Page.Title | jsonify }}, "count": {{ $t.Count }}, "url": {{ $t.Page.Permalink | jsonify }} }
{{- end }}
];
