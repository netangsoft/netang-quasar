import{_ as e,M as o,p,q as l,R as n,t as s,N as t,a1 as r}from"./framework-204010b2.js";const i={},c=n("h1",{id:"rulevalid-表单单个验证",tabindex:"-1"},[n("a",{class:"header-anchor",href:"#rulevalid-表单单个验证","aria-hidden":"true"},"#"),s(" $ruleValid 表单单个验证")],-1),u={class:"custom-container tip"},d=n("p",{class:"custom-container-title"},"TIP",-1),k=n("code",null,"@netang/quasar/utils/$ruleValid.js",-1),v={href:"https://github.com/netangsoft/netang-quasar/blob/main/utils/%24ruleValid.js",target:"_blank",rel:"noopener noreferrer"},h={href:"https://gitee.com/jinmarcus/netang-quasar/blob/main/utils/%24ruleValid.js",target:"_blank",rel:"noopener noreferrer"},m=n("p",null,"单个验证真假规则(用于表单验证)",-1),_=r(`<ul><li>示例</li></ul><div class="language-javascript line-numbers-mode" data-ext="js"><pre class="language-javascript"><code>dialog<span class="token punctuation">.</span><span class="token function">create</span><span class="token punctuation">(</span><span class="token punctuation">{</span>
    <span class="token literal-property property">title</span><span class="token operator">:</span> <span class="token string">&#39;请输入&#39;</span><span class="token punctuation">,</span>
    <span class="token literal-property property">prompt</span><span class="token operator">:</span> <span class="token punctuation">{</span>
        <span class="token literal-property property">model</span><span class="token operator">:</span> <span class="token string">&#39;&#39;</span><span class="token punctuation">,</span>
        <span class="token literal-property property">type</span><span class="token operator">:</span> <span class="token string">&#39;text&#39;</span><span class="token punctuation">,</span>
        <span class="token literal-property property">isValid</span><span class="token operator">:</span> <span class="token function">$ruleValid</span><span class="token punctuation">(</span><span class="token string">&#39;required|min:6|max:20&#39;</span><span class="token punctuation">)</span><span class="token punctuation">,</span>
    <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token literal-property property">cancel</span><span class="token operator">:</span> <span class="token boolean">true</span><span class="token punctuation">,</span>
    <span class="token literal-property property">persistent</span><span class="token operator">:</span> <span class="token boolean">true</span><span class="token punctuation">,</span>
<span class="token punctuation">}</span><span class="token punctuation">)</span>
    <span class="token punctuation">.</span><span class="token function">onOk</span><span class="token punctuation">(</span><span class="token keyword">function</span><span class="token punctuation">(</span><span class="token parameter">data</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>

    <span class="token punctuation">}</span><span class="token punctuation">)</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="options-参数" tabindex="-1"><a class="header-anchor" href="#options-参数" aria-hidden="true">#</a> options 参数</h3><table><thead><tr><th>参数名</th><th>说明</th><th>类型</th></tr></thead><tbody><tr><td>rule</td><td>验证规则</td><td><code>String</code></td></tr></tbody></table>`,4);function b(f,g){const a=o("ExternalLinkIcon");return p(),l("div",null,[c,n("div",u,[d,n("p",null,[k,s(),n("a",v,[s("Github"),t(a)]),s(),n("a",h,[s("Gitee"),t(a)])]),m]),_])}const V=e(i,[["render",b],["__file","ruleValid.html.vue"]]);export{V as default};
