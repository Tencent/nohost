# 如何生成自定义菜单
自定义菜单通过识别window.nohostContextMenuExtensions的值来进行生成自定义菜单
nohostContextMenuExtensions值类型如下：
```ts
interface MenuItem {
  name: string;
  title: string;
  onClick: (hideMenu: () => void, e: MouseEvent) => void; // 调用hideMenu可以关闭菜单
}
type nohostContextMenuExtensions = MenuItem[];
```
***默认点击菜单是不会关闭菜单的，如果需要关闭菜单，需要手动调用hideMenu方法***

可以通过whistle插件或者rule的形式，注入window.nohostContextMenuExtensions。
> 建议不要直接对该属性赋值,不然可能存在覆盖其他插件的自定义菜单的可能。

***例子（通过whistle rule直接注入）***
```ts
* jsAppend://{test.js}

\`\`\`test.js
window.nohostContextMenuExtensions = [
{ name: '测试', title: '测试', onClick: (hideMenu, e) => { console.log('测试'); hideMenu(); } },
];
\`\`\`
```