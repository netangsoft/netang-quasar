import{_ as n,M as s,p as c,q as o,R as t,t as e,N as d,a1 as r}from"./framework-204010b2.js";const i={},p=t("h1",{id:"tree-树",tabindex:"-1"},[t("a",{class:"header-anchor",href:"#tree-树","aria-hidden":"true"},"#"),e(" $tree 树")],-1),l={class:"custom-container tip"},u=t("p",{class:"custom-container-title"},"TIP",-1),h=t("code",null,"@netang/quasar/utils/$tree.js",-1),v={href:"https://github.com/netangsoft/netang-quasar/blob/main/utils/%24tree.js",target:"_blank",rel:"noopener noreferrer"},b={href:"https://gitee.com/jinmarcus/netang-quasar/blob/main/utils/%24tree.js",target:"_blank",rel:"noopener noreferrer"},m=t("p",null,"树工具",-1),k=r(`<h2 id="tree-create" tabindex="-1"><a class="header-anchor" href="#tree-create" aria-hidden="true">#</a> $tree.create</h2><p>创建树实例</p><ul><li>类型</li></ul><div class="language-javascript line-numbers-mode" data-ext="js"><pre class="language-javascript"><code>$tree<span class="token punctuation">.</span><span class="token function">create</span><span class="token punctuation">(</span>options<span class="token operator">:</span> Object<span class="token punctuation">)</span><span class="token operator">:</span> Object
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><h3 id="options-参数" tabindex="-1"><a class="header-anchor" href="#options-参数" aria-hidden="true">#</a> options 参数</h3><table><thead><tr><th>参数名</th><th>说明</th><th>类型</th><th>默认值</th><th>示例</th></tr></thead><tbody><tr><td>$power</td><td>权限实例</td><td><code>Object</code></td><td>-</td><td>-</td></tr><tr><td>path</td><td>路由路径</td><td><code>String</code></td><td>-</td><td>-</td></tr><tr><td>path</td><td>路由路径</td><td><code>String</code></td><td>-</td><td>-</td></tr><tr><td>query</td><td>路由参数</td><td><code>Object</code></td><td>-</td><td>-</td></tr><tr><td>nodes</td><td>树节点列表</td><td><code>ref(Array)</code></td><td>-</td><td>-</td></tr><tr><td>expanded</td><td>树展开节点</td><td><code>ref(Array)</code></td><td>-</td><td>-</td></tr><tr><td>rawFormData</td><td>原始表单数据</td><td><code>Object</code></td><td>-</td><td>-</td></tr><tr><td>formData</td><td>表单数据</td><td><code>ref(Object)</code></td><td>-</td><td>-</td></tr><tr><td>reload</td><td>重新加载</td><td><code>Function</code></td><td>-</td><td>-</td></tr><tr><td>cache</td><td>是否开启展开节点缓存</td><td><code>Boolean</code></td><td>false</td><td>-</td></tr></tbody></table><h3 id="返回数据" tabindex="-1"><a class="header-anchor" href="#返回数据" aria-hidden="true">#</a> 返回数据</h3><table><thead><tr><th>参数名</th><th>说明</th><th>类型</th><th>示例</th></tr></thead><tbody><tr><td>routeFullPath</td><td>当前路由全路径</td><td><code>String</code></td><td>-</td></tr><tr><td>routePath</td><td>当前路由路径</td><td><code>String</code></td><td>-</td></tr><tr><td>routeQuery</td><td>当前路由参数</td><td><code>Object</code></td><td>-</td></tr><tr><td>getRoute</td><td>获取当前路由</td><td><code>Function</code></td><td>-</td></tr><tr><td><a href="#getnode">getNode</a></td><td>获取节点</td><td><code>Function</code></td><td>-</td></tr><tr><td><a href="#updatenode">updateNode</a></td><td>更新节点</td><td><code>Function</code></td><td>-</td></tr><tr><td><a href="#deletenode">deleteNode</a></td><td>删除节点</td><td><code>Function</code></td><td>-</td></tr><tr><td><a href="#getmenustatus">getMenuStatus</a></td><td>获取菜单状态</td><td><code>Function</code></td><td>-</td></tr><tr><td><a href="#menuclick">menuClick</a></td><td>菜单点击</td><td><code>Function</code></td><td>-</td></tr><tr><td><a href="#getexpandedcache">getExpandedCache</a></td><td>获取展开节点缓存</td><td><code>Function</code></td><td>-</td></tr><tr><td><a href="#setexpandedcache">setExpandedCache</a></td><td>设置展开节点缓存</td><td><code>Function</code></td><td>-</td></tr><tr><td><a href="#expandall">expandAll</a></td><td>展开全部</td><td><code>Function</code></td><td>-</td></tr><tr><td><a href="#collapseall">collapseAll</a></td><td>收起全部</td><td><code>Function</code></td><td>-</td></tr></tbody></table><h4 id="getnode" tabindex="-1"><a class="header-anchor" href="#getnode" aria-hidden="true">#</a> getNode</h4><p>获取节点</p><div class="language-javascript line-numbers-mode" data-ext="js"><pre class="language-javascript"><code>$tree<span class="token punctuation">.</span><span class="token function">getNode</span><span class="token punctuation">(</span>nodeId<span class="token punctuation">)</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><table><thead><tr><th>参数名</th><th>说明</th><th>类型</th></tr></thead><tbody><tr><td>nodeId</td><td>树节点 ID</td><td><code>Number</code></td></tr></tbody></table><h4 id="updatenode" tabindex="-1"><a class="header-anchor" href="#updatenode" aria-hidden="true">#</a> updateNode</h4><p>更新节点</p><div class="language-javascript line-numbers-mode" data-ext="js"><pre class="language-javascript"><code>$tree<span class="token punctuation">.</span><span class="token function">updateNode</span><span class="token punctuation">(</span>data<span class="token punctuation">)</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><table><thead><tr><th>参数名</th><th>说明</th><th>类型</th></tr></thead><tbody><tr><td>data</td><td>新的表单数据</td><td><code>Object</code></td></tr></tbody></table><h4 id="deletenode" tabindex="-1"><a class="header-anchor" href="#deletenode" aria-hidden="true">#</a> deleteNode</h4><p>删除节点</p><div class="language-javascript line-numbers-mode" data-ext="js"><pre class="language-javascript"><code>$tree<span class="token punctuation">.</span><span class="token function">deleteNode</span><span class="token punctuation">(</span>nodeItem<span class="token punctuation">)</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><table><thead><tr><th>参数名</th><th>说明</th><th>类型</th></tr></thead><tbody><tr><td>nodeItem</td><td>树节点数据</td><td><code>Object</code></td></tr></tbody></table><h4 id="getmenustatus" tabindex="-1"><a class="header-anchor" href="#getmenustatus" aria-hidden="true">#</a> getMenuStatus</h4><p>获取菜单状态</p><div class="language-javascript line-numbers-mode" data-ext="js"><pre class="language-javascript"><code>$tree<span class="token punctuation">.</span><span class="token function">getMenuStatus</span><span class="token punctuation">(</span>options<span class="token punctuation">)</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><table><thead><tr><th>参数名</th><th>说明</th><th>类型</th><th>默认值</th></tr></thead><tbody><tr><td>updateName</td><td>更新标识</td><td><code>String</code></td><td>update</td></tr><tr><td>moveName</td><td>移动标识</td><td><code>String</code></td><td>move</td></tr><tr><td>copyName</td><td>复制标识</td><td><code>String</code></td><td>copy</td></tr><tr><td>deleteName</td><td>删除标识</td><td><code>String</code></td><td>realdel</td></tr><tr><td>statusName</td><td>状态标识</td><td><code>String</code></td><td>status</td></tr></tbody></table><h4 id="menuclick" tabindex="-1"><a class="header-anchor" href="#menuclick" aria-hidden="true">#</a> menuClick</h4><p>菜单点击</p><div class="language-javascript line-numbers-mode" data-ext="js"><pre class="language-javascript"><code><span class="token comment">// 获取菜单状态</span>
<span class="token keyword">const</span> menuStatus <span class="token operator">=</span> <span class="token function">computed</span><span class="token punctuation">(</span><span class="token keyword">function</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">return</span> $tree<span class="token punctuation">.</span><span class="token function">getMenuStatus</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
<span class="token punctuation">}</span><span class="token punctuation">)</span>

$tree<span class="token punctuation">.</span><span class="token function">menuClick</span><span class="token punctuation">(</span><span class="token punctuation">{</span>
    <span class="token comment">// 菜单类型</span>
    <span class="token literal-property property">type</span><span class="token operator">:</span> <span class="token string">&#39;update&#39;</span><span class="token punctuation">,</span>
    <span class="token comment">// 节点</span>
    node<span class="token punctuation">,</span>
    <span class="token comment">// 菜单状态</span>
    menuStatus<span class="token punctuation">,</span>
<span class="token punctuation">}</span><span class="token punctuation">)</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><table><thead><tr><th>参数名</th><th>说明</th><th>类型</th><th>可选值</th></tr></thead><tbody><tr><td>type</td><td>菜单类型</td><td><code>String</code></td><td><code>update</code> / <code>moveUp</code> / <code>moveIn</code> / <code>moveDown</code> / <code>copy</code> / <code>delete</code> / <code>statusDisable</code> / <code>statusNormal</code></td></tr><tr><td>node</td><td>节点</td><td><code>Object</code></td><td>-</td></tr><tr><td>menuStatus</td><td>菜单状态, 可从 $tree.getMenuStatus() 获取</td><td><code>computed</code></td><td>-</td></tr></tbody></table><h4 id="getexpandedcache" tabindex="-1"><a class="header-anchor" href="#getexpandedcache" aria-hidden="true">#</a> getExpandedCache</h4><p>获取展开节点缓存</p><div class="language-javascript line-numbers-mode" data-ext="js"><pre class="language-javascript"><code>$tree<span class="token punctuation">.</span><span class="token function">getExpandedCache</span><span class="token punctuation">(</span>defaultValue<span class="token punctuation">)</span><span class="token operator">:</span> Array
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><table><thead><tr><th>参数名</th><th>说明</th><th>类型</th></tr></thead><tbody><tr><td>defaultValue</td><td>默认值</td><td><code>Array</code></td></tr></tbody></table><h4 id="setexpandedcache" tabindex="-1"><a class="header-anchor" href="#setexpandedcache" aria-hidden="true">#</a> setExpandedCache</h4><p>设置展开节点缓存</p><div class="language-javascript line-numbers-mode" data-ext="js"><pre class="language-javascript"><code>$tree<span class="token punctuation">.</span><span class="token function">setExpandedCache</span><span class="token punctuation">(</span>expanded<span class="token punctuation">)</span><span class="token operator">:</span> Array
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><table><thead><tr><th>参数名</th><th>说明</th><th>类型</th></tr></thead><tbody><tr><td>expanded</td><td>展开节点数组</td><td><code>Array</code></td></tr></tbody></table><h4 id="expandall" tabindex="-1"><a class="header-anchor" href="#expandall" aria-hidden="true">#</a> expandAll</h4><p>展开全部</p><div class="language-javascript line-numbers-mode" data-ext="js"><pre class="language-javascript"><code>$tree<span class="token punctuation">.</span><span class="token function">expandAll</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token operator">:</span> <span class="token keyword">void</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><h4 id="collapseall" tabindex="-1"><a class="header-anchor" href="#collapseall" aria-hidden="true">#</a> collapseAll</h4><p>收起全部</p><div class="language-javascript line-numbers-mode" data-ext="js"><pre class="language-javascript"><code>$tree<span class="token punctuation">.</span><span class="token function">collapseAll</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token operator">:</span> <span class="token keyword">void</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div>`,42);function g(f,x){const a=s("ExternalLinkIcon");return c(),o("div",null,[p,t("div",l,[u,t("p",null,[h,e(),t("a",v,[e("Github"),d(a)]),e(),t("a",b,[e("Gitee"),d(a)])]),m]),k])}const y=n(i,[["render",g],["__file","tree.html.vue"]]);export{y as default};