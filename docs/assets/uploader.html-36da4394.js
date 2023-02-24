import{_ as r,M as a,p as c,q as s,R as t,t as d,N as e,V as l,a1 as i}from"./framework-204010b2.js";const u={},p=t("h1",{id:"uploader-上传器",tabindex:"-1"},[t("a",{class:"header-anchor",href:"#uploader-上传器","aria-hidden":"true"},"#"),d(" uploader 上传器")],-1),h={class:"custom-container tip"},_=t("p",{class:"custom-container-title"},"TIP",-1),m=t("code",null,"@netang/quasar/utils/uploader.js",-1),f={href:"https://github.com/netangsoft/netang-quasar/blob/main/utils/uploader.js",target:"_blank",rel:"noopener noreferrer"},b={href:"https://gitee.com/jinmarcus/netang-quasar/blob/main/utils/uploader.js",target:"_blank",rel:"noopener noreferrer"},g=t("code",null,"<n-uploader>",-1),k=i(`<ul><li>类型</li></ul><div class="language-javascript line-numbers-mode" data-ext="js"><pre class="language-javascript"><code><span class="token function">uploader</span><span class="token punctuation">(</span>options<span class="token operator">:</span> Object<span class="token punctuation">)</span><span class="token operator">:</span> <span class="token keyword">void</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><table><thead><tr><th>参数名</th><th>说明</th><th>类型</th><th>可选值</th><th>默认值</th></tr></thead><tbody><tr><td>fileRef</td><td>上传文件输入框节点</td><td><code>ref()</code></td><td>-</td><td>-</td></tr><tr><td>modelValue</td><td>值</td><td><code>String</code> / <code>Array</code></td><td>-</td><td>-</td></tr><tr><td>type</td><td>上传文件类型</td><td><code>String</code></td><td><code>file</code> / <code>image</code> / <code>video</code> / <code>audio</code></td><td>image</td></tr><tr><td>count</td><td>上传文件数量(0:不限)</td><td><code>Number</code></td><td>-</td><td>0</td></tr><tr><td>maxSize</td><td>单个文件的最大大小(单位: MB)</td><td><code>Number</code></td><td>-</td><td>0</td></tr><tr><td>exts</td><td>单个文件的限制后缀</td><td><code>Array</code></td><td>-</td><td>[ ]</td></tr><tr><td>valueArray</td><td>值是否为数组</td><td><code>Boolean</code></td><td>-</td><td>false</td></tr><tr><td>unique</td><td>是否去重</td><td><code>Boolean</code></td><td>-</td><td>false</td></tr><tr><td>loadInfo</td><td>是否初始加载文件信息(仅图片有效, 其他类型自动会加载文件信息)</td><td><code>Boolean</code></td><td>-</td><td>false</td></tr><tr><td>confirm</td><td>单文件上传提示</td><td><code>Boolean</code></td><td>-</td><td>false</td></tr><tr><td>uploadFileLists</td><td>上传文件列表</td><td><code>ref(Array)</code></td><td>-</td><td>-</td></tr><tr><td>onUpdateModelValue</td><td>更新值方法(初始化上传列表时不更新值)</td><td><code>Function</code></td><td>-</td><td>-</td></tr><tr><td>onUpdate</td><td>更新方法</td><td><code>Function</code></td><td>-</td><td>-</td></tr></tbody></table>`,3);function v(x,j){const o=a("ExternalLinkIcon"),n=a("RouterLink");return c(),s("div",null,[p,t("div",h,[_,t("p",null,[m,d(),t("a",f,[d("Github"),e(o)]),d(),t("a",b,[d("Gitee"),e(o)])]),t("p",null,[d("配合组件 "),e(n,{to:"/components/uploader.html"},{default:l(()=>[g]),_:1}),d(" 使用")])]),k])}const B=r(u,[["render",v],["__file","uploader.html.vue"]]);export{B as default};
