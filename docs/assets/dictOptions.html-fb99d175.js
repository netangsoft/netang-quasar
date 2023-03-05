import{_ as e,M as o,p as i,q as c,R as t,t as n,N as a,a1 as p}from"./framework-204010b2.js";const l={},r=t("h1",{id:"dictoptions-数据字典选项",tabindex:"-1"},[t("a",{class:"header-anchor",href:"#dictoptions-数据字典选项","aria-hidden":"true"},"#"),n(" dictOptions 数据字典选项")],-1),d={class:"custom-container tip"},u=t("p",{class:"custom-container-title"},"TIP",-1),h=t("code",null,"@netang/quasar/utils/dictOptions.js",-1),k={href:"https://github.com/netangsoft/netang-quasar/blob/main/utils/dictOptions.js",target:"_blank",rel:"noopener noreferrer"},_={href:"https://gitee.com/jinmarcus/netang-quasar/blob/main/utils/dictOptions.js",target:"_blank",rel:"noopener noreferrer"},m=p(`<ul><li>示例</li></ul><div class="language-javascript line-numbers-mode" data-ext="js"><pre class="language-javascript"><code><span class="token function">dictOptions</span><span class="token punctuation">(</span><span class="token string">&#39;DICT_STATUS&#39;</span><span class="token punctuation">)</span> <span class="token comment">// 返回：[ { label: &#39;正常&#39;, value: 1 }, { label: &#39;禁用&#39;, value: 0 } ]</span>

<span class="token function">dictOptions</span><span class="token punctuation">(</span><span class="token string">&#39;DICT_YESNO&#39;</span><span class="token punctuation">,</span> <span class="token string">&#39;title&#39;</span><span class="token punctuation">,</span> <span class="token string">&#39;id&#39;</span><span class="token punctuation">)</span> <span class="token comment">// 返回：[ { title: &#39;正常&#39;, id: 1 }, { title: &#39;禁用&#39;, id: 0 } ]</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><ul><li>类型</li></ul><div class="language-javascript line-numbers-mode" data-ext="js"><pre class="language-javascript"><code><span class="token function">dictOptions</span><span class="token punctuation">(</span>key<span class="token operator">:</span> String<span class="token punctuation">,</span> <span class="token literal-property property">textKey</span><span class="token operator">:</span> String<span class="token punctuation">,</span> <span class="token literal-property property">valueKey</span><span class="token operator">:</span> String<span class="token punctuation">)</span><span class="token operator">:</span> Array
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>返回数据字典选项数组</p><table><thead><tr><th>参数名</th><th>说明</th><th>类型</th><th>默认值</th></tr></thead><tbody><tr><td>key</td><td>字典键值</td><td><code>String</code></td><td>-</td></tr><tr><td>labelKey</td><td>标签键值</td><td><code>String</code></td><td>label</td></tr><tr><td>valueKey</td><td>值键值</td><td><code>String</code></td><td>value</td></tr></tbody></table>`,6);function v(g,b){const s=o("ExternalLinkIcon");return i(),c("div",null,[r,t("div",d,[u,t("p",null,[h,n(),t("a",k,[n("Github"),a(s)]),n(),t("a",_,[n("Gitee"),a(s)])])]),m])}const y=e(l,[["render",v],["__file","dictOptions.html.vue"]]);export{y as default};