import{_ as e,M as o,p,q as d,R as t,t as n,N as a,a1 as r}from"./framework-204010b2.js";const c={},i=t("h1",{id:"area-提示框",tabindex:"-1"},[t("a",{class:"header-anchor",href:"#area-提示框","aria-hidden":"true"},"#"),n(" area 提示框")],-1),l={class:"custom-container tip"},u=t("p",{class:"custom-container-title"},"TIP",-1),k=t("code",null,"@netang/quasar/utils/area.js",-1),v={href:"https://github.com/netangsoft/netang-quasar/blob/main/utils/area.js",target:"_blank",rel:"noopener noreferrer"},b={href:"https://gitee.com/jinmarcus/netang-quasar/blob/main/utils/area.js",target:"_blank",rel:"noopener noreferrer"},m=t("code",null,"Dialog.create()",-1),h={href:"http://www.quasarchs.com/quasar-plugins/dialog",target:"_blank",rel:"noopener noreferrer"},g={href:"https://quasar.dev/quasar-plugins/dialog",target:"_blank",rel:"noopener noreferrer"},q=r(`<h2 id="getdata-获取地区数据" tabindex="-1"><a class="header-anchor" href="#getdata-获取地区数据" aria-hidden="true">#</a> getData 获取地区数据</h2><ul><li>示例</li></ul><div class="language-javascript line-numbers-mode" data-ext="js"><pre class="language-javascript"><code><span class="token comment">// 获取地区数据数据</span>
<span class="token keyword">await</span> area<span class="token punctuation">.</span><span class="token function">getData</span><span class="token punctuation">(</span><span class="token number">3</span><span class="token punctuation">)</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><ul><li>类型</li></ul><div class="language-javascript line-numbers-mode" data-ext="js"><pre class="language-javascript"><code><span class="token keyword">await</span> <span class="token function">getData</span><span class="token punctuation">(</span>level<span class="token punctuation">,</span> options<span class="token punctuation">)</span><span class="token operator">:</span> Array
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><table><thead><tr><th>参数名</th><th>说明</th><th>类型</th><th>可选值</th><th>默认值</th></tr></thead><tbody><tr><td>level</td><td>地区级别(1：省，2：市，3：区)</td><td><code>Number</code></td><td><code>1</code> / <code>2</code> / <code>3</code></td><td>3</td></tr><tr><td>options</td><td>参数</td><td><code>Object</code></td><td>-</td><td>-</td></tr></tbody></table><p>options 参数</p><table><thead><tr><th>参数名</th><th>说明</th><th>类型</th><th>可选值</th><th>默认值</th></tr></thead><tbody><tr><td>ignore</td><td>忽略地区 id</td><td><code>Array</code></td><td>-</td><td>[ ]</td></tr></tbody></table><h2 id="getinfo-获取地区详情" tabindex="-1"><a class="header-anchor" href="#getinfo-获取地区详情" aria-hidden="true">#</a> getInfo 获取地区详情</h2><ul><li>示例</li></ul><div class="language-javascript line-numbers-mode" data-ext="js"><pre class="language-javascript"><code><span class="token comment">// 获取地区数据数据</span>
<span class="token keyword">await</span> area<span class="token punctuation">.</span><span class="token function">getInfo</span><span class="token punctuation">(</span><span class="token punctuation">{</span>
    <span class="token comment">// 第 3 级区编码</span>
    <span class="token literal-property property">code</span><span class="token operator">:</span> <span class="token number">340202</span><span class="token punctuation">,</span>
<span class="token punctuation">}</span><span class="token punctuation">)</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><ul><li>类型</li></ul><div class="language-javascript line-numbers-mode" data-ext="js"><pre class="language-javascript"><code><span class="token keyword">await</span> <span class="token function">getInfo</span><span class="token punctuation">(</span>options<span class="token punctuation">)</span><span class="token operator">:</span> Object
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><table><thead><tr><th>参数名</th><th>说明</th><th>类型</th><th>可选值</th><th>默认值</th></tr></thead><tbody><tr><td>areaData</td><td>地址数据（由 <code>area.getData()</code> 创建的数据）（如果为空，则重新获取）</td><td><code>Object</code></td><td>-</td><td>null</td></tr><tr><td>level</td><td>地区级别</td><td><code>Number</code></td><td><code>1</code> / <code>2</code> / <code>3</code></td><td>3</td></tr><tr><td>code</td><td>第 3 级区编码</td><td><code>Number</code></td><td>-</td><td>0</td></tr><tr><td>provinceText</td><td>省文字</td><td><code>String</code></td><td>-</td><td>&quot;&quot;</td></tr><tr><td>cityText</td><td>市文字</td><td><code>String</code></td><td>-</td><td>&quot;&quot;</td></tr><tr><td>areaText</td><td>区文字</td><td><code>String</code></td><td>-</td><td>&quot;&quot;</td></tr><tr><td>regionText</td><td>详细区域文字</td><td><code>String</code></td><td>-</td><td>&quot;&quot;</td></tr></tbody></table><ul><li>返回数据</li></ul><p>返回数据示例</p><div class="language-javascript line-numbers-mode" data-ext="js"><pre class="language-javascript"><code><span class="token punctuation">{</span>
    <span class="token string-property property">&quot;id&quot;</span><span class="token operator">:</span> <span class="token number">340202</span><span class="token punctuation">,</span>
    <span class="token string-property property">&quot;pid&quot;</span><span class="token operator">:</span> <span class="token number">340200</span><span class="token punctuation">,</span>
    <span class="token string-property property">&quot;title&quot;</span><span class="token operator">:</span> <span class="token string">&quot;镜湖区&quot;</span><span class="token punctuation">,</span>
    <span class="token string-property property">&quot;level&quot;</span><span class="token operator">:</span> <span class="token number">3</span><span class="token punctuation">,</span>
    <span class="token string-property property">&quot;region&quot;</span><span class="token operator">:</span> <span class="token punctuation">[</span>
        <span class="token punctuation">{</span>
            <span class="token string-property property">&quot;id&quot;</span><span class="token operator">:</span> <span class="token number">340000</span><span class="token punctuation">,</span>
            <span class="token string-property property">&quot;pid&quot;</span><span class="token operator">:</span> <span class="token number">0</span><span class="token punctuation">,</span>
            <span class="token string-property property">&quot;title&quot;</span><span class="token operator">:</span> <span class="token string">&quot;安徽省&quot;</span><span class="token punctuation">,</span>
            <span class="token string-property property">&quot;level&quot;</span><span class="token operator">:</span> <span class="token number">1</span>
        <span class="token punctuation">}</span><span class="token punctuation">,</span>
        <span class="token punctuation">{</span>
            <span class="token string-property property">&quot;id&quot;</span><span class="token operator">:</span> <span class="token number">340200</span><span class="token punctuation">,</span>
            <span class="token string-property property">&quot;pid&quot;</span><span class="token operator">:</span> <span class="token number">340000</span><span class="token punctuation">,</span>
            <span class="token string-property property">&quot;title&quot;</span><span class="token operator">:</span> <span class="token string">&quot;芜湖市&quot;</span><span class="token punctuation">,</span>
            <span class="token string-property property">&quot;level&quot;</span><span class="token operator">:</span> <span class="token number">2</span>
        <span class="token punctuation">}</span><span class="token punctuation">,</span>
        <span class="token punctuation">{</span>
            <span class="token string-property property">&quot;id&quot;</span><span class="token operator">:</span> <span class="token number">340202</span><span class="token punctuation">,</span>
            <span class="token string-property property">&quot;pid&quot;</span><span class="token operator">:</span> <span class="token number">340200</span><span class="token punctuation">,</span>
            <span class="token string-property property">&quot;title&quot;</span><span class="token operator">:</span> <span class="token string">&quot;镜湖区&quot;</span><span class="token punctuation">,</span>
            <span class="token string-property property">&quot;level&quot;</span><span class="token operator">:</span> <span class="token number">3</span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">]</span><span class="token punctuation">,</span>
    <span class="token string-property property">&quot;region_ids&quot;</span><span class="token operator">:</span> <span class="token punctuation">[</span>
        <span class="token number">340000</span><span class="token punctuation">,</span>
        <span class="token number">340200</span><span class="token punctuation">,</span>
        <span class="token number">340202</span>
    <span class="token punctuation">]</span><span class="token punctuation">,</span>
    <span class="token string-property property">&quot;region_text&quot;</span><span class="token operator">:</span> <span class="token string">&quot;安徽省芜湖市镜湖区&quot;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><table><thead><tr><th>参数名</th><th>说明</th><th>类型</th><th>示例</th></tr></thead><tbody><tr><td>id</td><td>当前编码</td><td><code>Number</code></td><td>-</td></tr><tr><td>pid</td><td>上级编码</td><td><code>Number</code></td><td>-</td></tr><tr><td>title</td><td>地区标题</td><td><code>String</code></td><td>-</td></tr><tr><td>level</td><td>地区级别</td><td><code>Number</code></td><td>-</td></tr><tr><td>region</td><td>地区对象数组</td><td><code>Array</code></td><td>-</td></tr><tr><td>region_ids</td><td>地区 id 数组</td><td><code>Array</code></td><td>-</td></tr><tr><td>region_text</td><td>地区名称数组</td><td><code>Array</code></td><td>-</td></tr></tbody></table>`,18);function y(_,f){const s=o("ExternalLinkIcon");return p(),d("div",null,[i,t("div",l,[u,t("p",null,[k,n(),t("a",v,[n("Github"),a(s)]),n(),t("a",b,[n("Gitee"),a(s)])]),t("p",null,[n("继承 "),m,n(" 所有特性 "),t("a",h,[n("中文文档"),a(s)]),n(),t("a",g,[n("英文文档"),a(s)])])]),q])}const x=e(c,[["render",y],["__file","area.html.vue"]]);export{x as default};