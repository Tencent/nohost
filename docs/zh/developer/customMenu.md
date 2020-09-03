# 如何生成自定义菜单
自定义菜单通过识别window.nohostContextMenuExtensions的值来进行生成自定义菜单
nohostContextMenuExtensions值类型如下：
```ts
interface MenuItem {
  name: string;
  title: string;
  autoHide?: boolean; // default true
  onClick: (e: MouseEvent & { hide: () => void }) => void; // 调用hide可以关闭菜单
}
type nohostContextMenuExtensions = MenuItem[];
```
***默认点击菜单会自动关闭菜单的，如果要手动关闭菜单，需要设置item.autoHide为false，并手动调用e.hide方法进行关闭***

可以通过whistle插件或者rule的形式，注入window.nohostContextMenuExtensions。
> 建议不要直接对该属性赋值,不然可能存在覆盖其他插件的自定义菜单的可能。

***例子***
通过whistle rule直接注入
```ts
* jsAppend://{test.js}

\`\`\`test.js
;(function() {
  // Xxx 表示插件的名称，如果插件 whsitle.test, 则为 window.__nohostTestPluginExtMenusDidMount__
  if (window.__nohostXxxPluginExtMenusDidMount__) {
	return;
  }
  window.__nohostXxxPluginExtMenusDidMount__ = true;
  if (Object.prototype.toString.call(window.nohostContextMenuExtensions) === '[object Array]') {
    window.nohostContextMenuExtensions.push(
      { name: '测试不关闭', title: '测试', autoHide: false, onClick: (e) => { console.log('测试'); } },
      { name: '测试关闭', title: '测试', onClick: (e) => { console.log('测试'); } },
    );
  } else {
  	window.nohostContextMenuExtensions = [
      { name: '测试不关闭', title: '测试', autoHide: false, onClick: (e) => { console.log('测试'); } },
      { name: '测试关闭', title: '测试', onClick: (e) => { console.log('测试'); } }
    ];
  }
})();
\`\`\`
```
注意要在__nohostXxxPluginExtMenusDidMount__变量标记是否已经注册过，不然可能会反复注册，导致菜单重复出现

通过whistle plugin注入
1. 通过cdn上的js注入
```ts
\`\`\` ext-menu.html
<script src="https://x.cdn.com/path/to/menus.js"></script>
\`\`\`

ke.qq.com htmlAppend://{whistle.xxx/ext-menu.html}
```
2. 通过插件内部的js注入
```ts
ke.qq.com htmlAppend://{whistle.xxx/ext-menu.html}

\`\`\` ext-menu.html
<script src="/...whistle-path.5b6af7b9884e1165...///whistle.xxx/path/to/menus.js"></script>
\`\`\`
```
/...whistle-path.5b6af7b9884e1165.../是whistle内部路径，要修改的是后面/whistle.xxx/path/to/menus.js的部分