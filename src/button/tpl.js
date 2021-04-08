export default `<div id="w-nohost">
<div class="w-nohost-modal" id="w-nohost-select-modal">
  <div id="w-nohost-list">
    <div id="w-nohost-toolbar">
      <button type="button" id="w-nohost-btn--top">当前环境/返回账号列表</button>
      <input id="w-nohost-filter" placeholder="输入字符过滤(忽略大小写)" autocomplete="off" />
    </div>
    <ul id="w-nohost-user-ul"></ul>
    <ul id="w-nohost-env-ul"></ul>
    <ul id="w-nohost-env-filter"></ul>
  </div>
</div>
<div class="w-nohost-modal" id="w-nohost-operation-modal">
  <div id="w-nohost-operations">
    <h4>Nohost快捷操作<span id="w-nohost-close-modal">X</span></h4>
    <button id="w-nohost-reload-page" class="w-nohost-operation">刷新页面</button>
    <button id="w-nohost-clear-cookie" class="w-nohost-operation">清除Cookie</button>
    <button id="w-nohost-clear-storage" class="w-nohost-operation">清除Storage</button>
    <button id="w-nohost-copy-env" class="w-nohost-operation w-nohost-copy-env">复制环境</button>
    <button id="w-nohost-copy-location" class="w-nohost-operation w-nohost-copy-link">复制地址</button>
    <button id="w-nohost-choose-env" class="w-nohost-operation">选择环境</button>
    <button id="w-nohost-custom-btn" class="w-nohost-operation">自定义菜单</button>
  </div>
</div>
<div class="w-nohost-modal" id="w-nohost-custom-context-modal">
  <div id="w-nohost-custom-menu">
    <h4>自定义菜单<span id="w-nohost-close-custom-modal">X</span></h4>
  </div>
</div>
<div id="w-nohost-toast" class="w-nohost-toast">
  <div class="w-nohost-toast-content"></div>
</div>
<div id="w-nohost-circle">
  <div id="w-nohost-circle-context">
    <div id="w-nohost-circle-env" class="w-nohost-copy-env" title="点击复制">
      当前环境
    </div>
    <div class="w-nohost-circle-items">
      <div id="w-nohost-circle-history" class="w-nohost-circle-item w-nohost-has-second">
        切换记录
        <div class="w-nohost-second-content-wrap">
          <div id="w-nohost-circle-history-list" class="w-nohost-second-content-content">
          </div>
        </div>
      </div>
      <div id="w-nohost-circle-default" class="w-nohost-circle-item">
        正式环境
      </div>
      <div id="w-nohost-circle-copyUrl" class="w-nohost-circle-item w-nohost-copy-link">
        复制链接
      </div>
      <div id="w-nohost-circle-user" class="w-nohost-circle-item">
        查看抓包
      </div>
      <div id="w-nohost-circle-open" class="w-nohost-circle-item">
        选择环境
      </div>
      <div id="w-nohost-custom" class="w-nohost-circle-item w-nohost-has-second">
        自定义菜单
        <div id="w-nohost-custom-context-wrap" class="w-nohost-second-content-wrap">
          <div id="w-nohost-custom-context" class="w-nohost-second-content-content">
          </div>
        </div>
      </div>
    </div>
  </div>
  <div id="w-nohost-circle-icon" title="点击打开环境选择窗口"></div>
</div>
</div>`;
