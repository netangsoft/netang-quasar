import{_ as p,M as t,p as o,q as l,R as n,t as s,N as e,a1 as c}from"./framework-204010b2.js";const i={},r=n("h1",{id:"dialog-对话框",tabindex:"-1"},[n("a",{class:"header-anchor",href:"#dialog-对话框","aria-hidden":"true"},"#"),s(" dialog 对话框")],-1),u={class:"custom-container tip"},d=n("p",{class:"custom-container-title"},"TIP",-1),k=n("code",null,"@netang/quasar/utils/dialog.js",-1),v={href:"https://github.com/netangsoft/netang-quasar/blob/main/utils/dialog.js",target:"_blank",rel:"noopener noreferrer"},m={href:"https://gitee.com/jinmarcus/netang-quasar/blob/main/utils/dialog.js",target:"_blank",rel:"noopener noreferrer"},b=n("code",null,"Dialog.create()",-1),g={href:"http://www.quasarchs.com/quasar-plugins/dialog",target:"_blank",rel:"noopener noreferrer"},y={href:"https://quasar.dev/quasar-plugins/dialog",target:"_blank",rel:"noopener noreferrer"},_=c(`<ul><li>普通示例</li></ul><div class="language-javascript line-numbers-mode" data-ext="js"><pre class="language-javascript"><code>dialog<span class="token punctuation">.</span><span class="token function">create</span><span class="token punctuation">(</span><span class="token punctuation">{</span>
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
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><ul><li>调用 vue 路由页面</li></ul><p>通过 <code>path</code> 参数定义 vue 路由路径来调用路由页面</p><p>并且对话框使用的组件是 <code>&lt;n-dialog&gt;</code>，可通过 <code>props</code> 参数定义该组件的声明属性</p><div class="language-javascript line-numbers-mode" data-ext="js"><pre class="language-javascript"><code>dialog<span class="token punctuation">.</span><span class="token function">create</span><span class="token punctuation">(</span><span class="token punctuation">{</span>
    <span class="token comment">// 标题</span>
    <span class="token literal-property property">title</span><span class="token operator">:</span> <span class="token string">&#39;订单明细&#39;</span><span class="token punctuation">,</span>
    <span class="token comment">// 宽</span>
    <span class="token literal-property property">width</span><span class="token operator">:</span> <span class="token string">&#39;80%&#39;</span><span class="token punctuation">,</span>
    <span class="token comment">// 关闭底部</span>
    <span class="token literal-property property">bottom</span><span class="token operator">:</span> <span class="token boolean">false</span><span class="token punctuation">,</span>
    <span class="token comment">// 路由路径</span>
    <span class="token literal-property property">path</span><span class="token operator">:</span> <span class="token string">&#39;order/order/view&#39;</span><span class="token punctuation">,</span>
    <span class="token comment">// 路由参数</span>
    <span class="token literal-property property">query</span><span class="token operator">:</span> <span class="token punctuation">{</span>
        <span class="token comment">// 订单 id</span>
        <span class="token literal-property property">id</span><span class="token operator">:</span> <span class="token number">123</span><span class="token punctuation">,</span>
    <span class="token punctuation">}</span><span class="token punctuation">,</span>
<span class="token punctuation">}</span><span class="token punctuation">)</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><ul><li>调用自定义组件</li></ul><p>通过 <code>name</code> 参数获取自定义组件</p><p>并且对话框使用的组件是 <code>&lt;n-dialog&gt;</code>，可通过 <code>props</code> 参数定义该组件的声明属性</p><div class="language-javascript line-numbers-mode" data-ext="js"><pre class="language-javascript"><code><span class="token comment">// 创建对话框</span>
dialog<span class="token punctuation">.</span><span class="token function">create</span><span class="token punctuation">(</span><span class="token punctuation">{</span>
    <span class="token comment">// 组件标识</span>
    <span class="token literal-property property">name</span><span class="token operator">:</span> <span class="token string">&#39;packageAddSku&#39;</span><span class="token punctuation">,</span>
    <span class="token comment">// 标题</span>
    <span class="token literal-property property">title</span><span class="token operator">:</span> <span class="token string">&#39;添加商品&#39;</span><span class="token punctuation">,</span>
    <span class="token comment">// 宽</span>
    <span class="token literal-property property">width</span><span class="token operator">:</span> <span class="token string">&#39;80%&#39;</span><span class="token punctuation">,</span>
    <span class="token comment">// 不能通过按 ESC 键关闭对话框</span>
    <span class="token literal-property property">noEscDismiss</span><span class="token operator">:</span> <span class="token boolean">true</span><span class="token punctuation">,</span>
    <span class="token comment">// 不能通过在对话框外单击来关闭对话框</span>
    <span class="token literal-property property">noBackdropDismiss</span><span class="token operator">:</span> <span class="token boolean">true</span><span class="token punctuation">,</span>
    <span class="token comment">// 显示取消按钮</span>
    <span class="token literal-property property">cancel</span><span class="token operator">:</span> <span class="token boolean">true</span><span class="token punctuation">,</span>
    <span class="token comment">// 组件声明参数</span>
    <span class="token literal-property property">props</span><span class="token operator">:</span> <span class="token punctuation">{</span>
        <span class="token literal-property property">test</span><span class="token operator">:</span> <span class="token number">123</span><span class="token punctuation">,</span>
    <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token comment">// 点击确认执行</span>
    <span class="token keyword">async</span> <span class="token function">onConfirm</span><span class="token punctuation">(</span><span class="token parameter">data</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>

        <span class="token comment">// 验证回调数据</span>
        <span class="token keyword">const</span> res <span class="token operator">=</span> $n<span class="token punctuation">.</span><span class="token function">validator</span><span class="token punctuation">(</span>data<span class="token punctuation">,</span> <span class="token punctuation">{</span>
            <span class="token comment">// 仓库 id</span>
            <span class="token literal-property property">warehouse_id</span><span class="token operator">:</span> <span class="token string">&#39;natural&#39;</span><span class="token punctuation">,</span>
            <span class="token comment">// sku 列表</span>
            <span class="token literal-property property">sku_lists</span><span class="token operator">:</span> <span class="token string">&#39;array&#39;</span><span class="token punctuation">,</span>
        <span class="token punctuation">}</span><span class="token punctuation">)</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span>res<span class="token punctuation">)</span> <span class="token punctuation">{</span>
            <span class="token comment">// 轻提示</span>
            $n<span class="token punctuation">.</span><span class="token function">toast</span><span class="token punctuation">(</span><span class="token punctuation">{</span>
                <span class="token literal-property property">message</span><span class="token operator">:</span> res<span class="token punctuation">.</span>msg<span class="token punctuation">,</span>
            <span class="token punctuation">}</span><span class="token punctuation">)</span>
            <span class="token keyword">return</span> <span class="token boolean">false</span>
        <span class="token punctuation">}</span>
        
        console<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span>data<span class="token punctuation">)</span>
    <span class="token punctuation">}</span><span class="token punctuation">,</span>
<span class="token punctuation">}</span><span class="token punctuation">)</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,10);function h(f,j){const a=t("ExternalLinkIcon");return o(),l("div",null,[r,n("div",u,[d,n("p",null,[k,s(),n("a",v,[s("Github"),e(a)]),s(),n("a",m,[s("Gitee"),e(a)])]),n("p",null,[s("继承 "),b,s(" 所有特性 "),n("a",g,[s("中文文档"),e(a)]),s(),n("a",y,[s("英文文档"),e(a)])])]),_])}const x=p(i,[["render",h],["__file","dialog.html.vue"]]);export{x as default};
