/**
 * Tencent is pleased to support the open source community by making nohost-环境配置与抓包调试平台 available.
 * Copyright (C) 2020 THL A29 Limited, a Tencent company.  All rights reserved. The below software in
 * this distribution may have been modified by THL A29 Limited ("Tencent Modifications").
 * All Tencent Modifications are Copyright (C) THL A29 Limited.
 * nohost-环境配置与抓包调试平台 is licensed under the MIT License except for the third-party components listed below.
 */

import $ from 'jquery';
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { parse } from 'query-string';
import ClipboardJS from 'clipboard';
import { Cascader, Button, Modal, Checkbox, Input, Icon, message, Tooltip } from 'antd';
import QRCode from '../components/qrCode';
import { getAllAccounts, getFollower, unfollow } from '../admin/cgi';
import '../base.less';
import './index.css';

const { search, href } = window.location;
const query = parse(search);
const PREFIX_LEN = 'x-nohost-'.length;
const URL_DIR = href.replace(/[^/]+([?#].*)?$/, '');
const REDIRECT_URL = `${URL_DIR.replace(/:\d+/, '')}redirect`;
const isHeadless = /^\$\d+$/.test(query.name);
const { tab, filter } = query;
let pageName;
// 通过请求参数获取当前显示的页面
if (['network', 'rules', 'values', 'plugins'].indexOf(tab) !== -1) {
  pageName = `#${tab}`;
} else {
  pageName = (query.name && !query.env) ? '#rules' : '#network';
}
// iframe 切换页面时的回调
window.onWhistlePageChange = name => {
  pageName = `#${name}`;
};
// localStorage
const setLocalStorage = (key, value) => {
  try {
    localStorage[key] = value;
  } catch (e) {}
};
// localStorage
const getLocalStorage = (key) => {
  try {
    return localStorage[key];
  } catch (e) {}
};
// 获取抓包url
// 打开该 url 可以选择好指定环境并切换到选中到环境
const getRedirectUrl = (value, url) => {
  value = value || [];
  value = value.filter(v => v);
  value = value.map((val, i) => {
    val = encodeURIComponent(val);
    if (i) {
      return `env=${val}`;
    }
    return `name=${val}`;
  });
  if (url) {
    if (!/^https?:\/\//.test(url)) {
      url = `${/^\/\//.test(url) ? 'http:' : 'http://'}${url}`;
    }
    value.push(`url=${encodeURIComponent(url)}`);
  }
  return value.length ? `${REDIRECT_URL}?${value.join('&')}` : REDIRECT_URL;
};
// 显示详细规则
const formatRules = (data) => {
  const { rules, headers } = data;
  const curHeaders = Object.keys(headers).map((name) => {
    return `${name.substring(PREFIX_LEN)}: ${headers[name]}`;
  }).join('\n');
  const result = [];
  if (curHeaders) {
    result.push(`# nohost配置\n${curHeaders}`);
  }
  if (rules) {
    result.push(`# whistle规则\n${rules}`);
  }
  return result.join('\n\n');
};

$(window).on('blur', () => {
  try {
    const evt = document.createEvent('MouseEvents');
    evt.initMouseEvent('mousedown', true, true, window);
    document.dispatchEvent(evt);
  } catch (e) {}
});

const getUrl = (name, envName) => {
  if (isHeadless) {
    return `account/${query.name}/index.html?${pageName}${filter ? `?${filter}` : ''}`;
  }
  if (!name) {
    return;
  }
  // whistle 支持通过 ip 过滤抓包数据
  // 如果 ip=self 表示直接使用当前客户端 ip 过滤
  const viewOwn = getLocalStorage('viewOwn') ? 'self' : '';
  const own = `?ip=${viewOwn}${envName ? `&ruleName=${encodeURIComponent(envName)}` : ''}`;
  let url = `account/${name}/index.html?${pageName}${own}`;
  if (envName) {
    const env = encodeURIComponent(`${name}/${envName.trim() || ''}`);
    // name=x-whistle-nohost-env：表示获取请求头 x-whistle-nohost-env 的值包含 ${env} 的请求
    // mtype=exact：表示精确匹配，不填或其它表示不区分大小写的子字符串
    url = `${url}&name=x-whistle-nohost-env&value=${env}&mtype=exact`;
  }
  return `${url}${filter ? `&${filter}` : ''}`;
};
// 支持 copy
const clipboard = new ClipboardJS('.n-copy-btn');

clipboard.on('error', () => {
  message.error('Copy failed.');
});
clipboard.on('success', () => {
  message.success('Copied clipboard.');
});

// 保存通知内容与账号对的键值对
const envNoticeMap = {};

/* eslint-disable react/no-access-state-in-setstate */
/**
 * 抓包界面
 * 存在两种情况：
 * 1. 普通模式
 * 2. headless
 */
class Capture extends Component {
  // 需要注意 headless 模式
  state = {
    url: isHeadless ? getUrl() : undefined,
    redirectUrl: REDIRECT_URL,
    testUrl: getLocalStorage('nohostTestUrl') || '',
  }

  componentDidMount() {
    // headless 无需加载账号列表
    if (isHeadless) {
      return;
    }
    this.loadData();
    let timer;
    const debounce = () => {
      clearTimeout(timer);
      timer = setTimeout(this.loadData, 3000);
    };
    // iframe 里面到规则发生变化时触发该方法
    window.onWhistleRulesChange = debounce;
    // iframe 初始化完成
    window.onWhistleReady = debounce;
  }

  onEnvChange = (envValue) => {
    this.setState({
      envValue,
      redirectUrl: getRedirectUrl(envValue, this.state.testUrl),
    });
  }

  // input 框失焦更新测试环境 url
  onTestUrlBlur = () => {
    const { envValue, testUrl } = this.state;
    this.setState({
      redirectUrl: getRedirectUrl(envValue, testUrl),
    });
  }

  onTestUrlChange = (e) => {
    // 生成对应url的二维码
    clearTimeout(this.timer);
    const testUrl = e.target.value;
    const { envValue } = this.state;
    this.timer = setTimeout(() => {
      this.setState({ redirectUrl: getRedirectUrl(envValue, testUrl) });
      setLocalStorage('nohostTestUrl', testUrl);
    }, 600);
    this.setState({ testUrl });
  }

  onChange = (value) => {
    if (!value.length) {
      const { curEnv } = this.envData || '';
      if (curEnv) {
        value.push(curEnv.name);
        value.push(curEnv.envName || '');
      }
    }
    setLocalStorage('curEnvValue', JSON.stringify(value));
    this.setState({
      value,
      url: getUrl(value[0], value[1]),
      notice: envNoticeMap[value[0]],
    });
  }

  getEnvValue(envMap, curEnv) {
    // 格式化环境信息，确保对应环境存在
    const formatEnvValue = (name, envName) => {
      if (!name || !envMap[name]) {
        return;
      }
      const value = [name, ''];
      if (envName && envMap[`${name}/${envName}`]) {
        value[1] = envName;
      }
      return value;
    };
    let result = formatEnvValue(query.name, query.env);
    if (result) {
      return result;
    }
    const { name, envName } = curEnv || '';
    result = formatEnvValue(name, envName);
    try {
      // 如果没有选择环境，则从本地存储获取
      const localEnv = JSON.parse(getLocalStorage('curEnvValue')) || [];
      result = formatEnvValue(...localEnv) || result;
    } catch (e) {}
    return result;
  }

  // 自动补全功能
  initHints = (data) => {
    const list = [];
    const rulesMap = {};
    data.list.forEach(({ name, envList }) => {
      list.push(name);
      envList.forEach((env) => {
        const envName = `${name}/${env.name}`;
        rulesMap[envName] = env.rules;
        list.push(envName);
      });
    });
    // 给通过 iframe 引入的 whistle 提供 @ 自动补全的数据
    window.getAtValueListForWhistle = (keyword) => {
      keyword = keyword && keyword.trim();
      if (!keyword) {
        return list;
      }
      keyword = keyword.toLowerCase();
      const result = list.filter(name => name.toLowerCase().indexOf(keyword) !== -1);
      result.sort((cur, next) => {
        const curIndex = cur.toLowerCase().indexOf(keyword);
        const nextIndex = next.toLowerCase().indexOf(keyword);
        if (curIndex === nextIndex) {
          return 0;
        }
        return curIndex > nextIndex ? 1 : -1;
      });
      return result;
    };
    const getEnvName = (name, url) => {
      // 通过路径获取账号名称
      url = url.replace(/\/[^/]*([?#].*)?$/, '');
      const accountName = url.substring(url.lastIndexOf('/') + 1);
      return `${accountName}/${name}`;
    };
    // 添加帮助链接
    const getAtHelpUrlForWhistle = (name, options) => {
      if (options && options.name === 'Default') {
        return;
      }
      if (!/\//.test(name)) {
        name = getEnvName(options.name, options.url);
      }
      let rules = rulesMap[name];
      if (!rules) {
        message.error(`"${name}"不存在或已被删除！`);
        return false;
      }
      rules = formatRules(rules);
      if (!rules) {
        message.info(`"${name}"配置为空！`);
        return false;
      }
      this.setState({ rules, showRules: true, envName: name });
      return false;
    };
    // 给 iframe 的回调
    // 点击帮助时触发回调该方法
    window.getAtHelpUrlForWhistle = getAtHelpUrlForWhistle;
    // 按快捷键时触发回调该方法
    window.onWhistleRulesEditorKeyDown = (e, { name, url }) => {
      const { keyCode } = e;
      if (keyCode === 13 || keyCode === 27) {
        this.setState({
          showRules: false,
          rules: '',
        });
        return;
      }
      if (name === 'Default' || !(e.ctrlKey || e.metaKey) || keyCode !== 112) {
        return;
      }
      getAtHelpUrlForWhistle(getEnvName(name, url));
      return false;
    };
  }

  loadData = () => {
    // 加载所有账号，不包括内容
    getAllAccounts((data) => {
      const envMap = {};
      const options = data.list.map((account) => {
        envMap[account.name] = 1;
        envNoticeMap[account.name] = account.notice;

        const children = account.envList.map(({ name }) => {
          envMap[`${account.name}/${name}`] = 1;
          return {
            label: name,
            value: name,
          };
        });
        // All 选项用于查看账号的所有请求
        // 正式环境 用于查看账号正式环境的请求
        // 正式环境一般可作为正式环境
        children.unshift({
          label: 'All',
          value: '',
        }, {
          label: '正式环境',
          value: ' ',
        });
        return {
          label: account.name,
          value: account.name,
          notice: account.notice || data.notice,
          children,
        };
      });
      const state = { options };
      if (!this.state.options) {
        state.viewOwn = getLocalStorage('viewOwn') === '1';
        const value = this.getEnvValue(envMap, data.curEnv);
        state.value = value;
        state.envValue = value;
        if (value) {
          state.url = getUrl(value[0], value[1]);
          state.notice = envNoticeMap && envNoticeMap[value[0]];
        }
        state.redirectUrl = getRedirectUrl(value, this.state.testUrl);
      }
      this.setState(state);
      this.initHints(data);
      this.envData = data;
      // 给 iframe 页面提供获取账号数据的方法
      if (!window.getNohostEnvData) {
        window.getNohostEnvData = cb => (cb && cb(this.envData));
      }
    });
  }

  showQRCode = () => {
    // 关联手机端请求
    this.setState({ showQRCode: true, qrCode: undefined });
    this.loadQRCode();
  }

  showTestDialog = () => {
    this.setState({ showTestDialog: true });
  }

  loadQRCode = () => {
    // 生成二维码
    this.setState({ loadQRCodeError: false, followerIp: undefined });
    getFollower((data) => {
      if (!data) {
        this.setState({ loadQRCodeError: true });
        return;
      }
      const qrCode = `${URL_DIR}follow?followId=${encodeURIComponent(data.clientId)}`;
      this.setState({ qrCode, followerIp: data.followerIp });
    });
  }

  confirmQRCode = () => {
    this.setState({ followerIp: undefined });
  }

  hideDialog = () => {
    this.setState({ showQRCode: false, showTestDialog: false });
  }

  handleMasker = (e) => {
    if (e.target.nodeName === 'TEXTAREA') {
      return;
    }
    this.setState({
      rules: '',
      showRules: false,
    });
  }

  // 只看本机请求
  viewOwn = (e) => {
    const { checked } = e.target;
    setLocalStorage('viewOwn', checked ? '1' : '');
    const url = (this.state.url || '').replace(/\?ip=[^&]*/, checked ? '?ip=self' : '?ip=');
    this.setState({
      url,
      viewOwn: checked,
    });
  }

  // 去掉关联的ip（关联 IP 后该 IP 的所有请求也会被当成本机请求）
  unfollow = () => {
    unfollow();
    this.confirmQRCode();
  }

  preventBlur(e) {
    if (e.target.nodeName === 'TEXTAREA') {
      return;
    }
    e.preventDefault();
  }

  stopPropagation(e) {
    e.stopPropagation();
  }

  /* eslint-disable no-script-url, jsx-a11y/anchor-is-valid */
  render() {
    const {
      options, value, viewOwn, rules, showRules, envName, testUrl, notice,
      showQRCode, qrCode, followerIp, redirectUrl, envValue, showTestDialog,
    } = this.state;
    let { url } = this.state;
    // 切换抓包界面
    url = url && url.replace(/#\w*/, pageName);
    let qrCodeTips;
    if (!qrCode) {
      qrCodeTips = this.state.loadQRCodeError ? (
        <div className="n-qrcode-loading">
          二维码加载失败，请<a href="javascript:;">点击重试</a>
        </div>
      ) : (
        <div className="n-qrcode-loading">二维码加载中...</div>
      );
    }
    let qrcodeElem;
    if (qrCode) {
      if (followerIp) {
        qrcodeElem = (
          <div className="n-qrcode-warning">
            <p>本机已关联IP: <strong>{followerIp}</strong></p>
            <p>重新扫描会解除上述关系</p>
            <Button onClick={this.confirmQRCode} type="primary">我知道了</Button>
            <p className="n-unfollow">
              <a onClick={this.unfollow}>解除关联</a>
            </p>
          </div>
        );
      } else {
        qrcodeElem = <QRCode size="340" value={qrCode} />;
      }
    }

    const displayValue = value ? value.join('/') : '正式环境';

    return !isHeadless && !options ? null : (
      <div className="container fill vbox">
        <div
          style={{ display: showRules ? 'block' : 'none' }}
          className="n-masker"
          onMouseDown={this.preventBlur}
          onClick={this.handleMasker}
        >
          <div
            onClick={this.stopPropagation}
            className="n-card"
          >
            <div className="n-header">
              <h4>{`"${envName}"`} 的配置</h4>
            </div>
            <textarea readOnly value={rules} />
            <div className="n-footer">
              <Button
                onClick={this.handleMasker}
                size="small"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
        {/* 顶部操作栏，headless 默认隐藏 */}
        <div className="action-bar" style={{ display: isHeadless ? 'none' : 'block' }}>
          <Cascader
            onChange={this.onChange}
            options={options}
            value={value}
            placeholder="选择抓包环境"
            showSearch
          />
          <Tooltip overlayClassName="env-tips" placement="bottom" title={<p>点击复制：<br />{displayValue}</p>}>
            <Icon type="copy" data-clipboard-text={displayValue} className="n-copy-btn n-copy-env" />
          </Tooltip>
          <span className="view-self-only">
            <Checkbox onChange={this.viewOwn} checked={viewOwn}>
              只看本机请求
            </Checkbox>
            {viewOwn ? (
              <Icon
                onClick={this.showQRCode}
                style={{ cursor: 'pointer' }}
                title="点击扫描二维码将手机请求设置为本机请求"
                type="qrcode"
              />
            ) : undefined}
          </span>
          {notice ? <span className="n-notice-ctn">{ notice }</span> : null}
          <Button onClick={this.showTestDialog} className="n-qrcode-button" type="default">生成二维码</Button>
        </div>
        <iframe title="抓包界面" className="fill capture-win" src={url} />
        <div
          style={{ display: url && 'none' }}
          className="empty-tips"
        >
          <Icon type="info-circle-o" /> 请先在页面左上角选择抓包环境
        </div>
        <Modal
          width={360}
          className="n-qrcode-dialog"
          visible={showQRCode}
          title="扫描二维码将手机请求设置为本机请求"
          footer={[
            <Button
              key="close"
              onClick={this.hideDialog}
            >
              Close
            </Button>,
          ]}
          onCancel={this.hideDialog}
        >
          {qrcodeElem}
          {qrCodeTips}
        </Modal>
        {/* 生成包含环境信息的链接和二维码 */}
        {/* 打开链接或扫描扫描二维码会自动切换到指定页面及环境 */}
        <Modal
          className="n-create-test-env-dialog"
          width={620}
          visible={showTestDialog}
          title="生成访问指定nohost环境的URL及二维码"
          footer={[
            <Button
              key="close"
              onClick={this.hideDialog}
            >
              Close
            </Button>,
          ]}
          onCancel={this.hideDialog}
        >
          <Input
            className="n-test-url"
            maxLength={512}
            value={testUrl}
            placeholder="请输入页面的URL"
            onChange={this.onTestUrlChange}
            onBlur={this.onTestUrlBlur}
            ref={input => (this.testUrlInput = input)}
          />
          <Cascader
            onChange={this.onEnvChange}
            options={options}
            value={envValue}
            placeholder="选择nohost环境"
            showSearch
          />
          <div className="n-qrcode-url-wrap">
            <Input className="n-qrcode-url" readOnly value={redirectUrl} />
            <Button
              className="n-copy-btn"
              data-clipboard-text={redirectUrl}
            >
              复制URL
            </Button>
          </div>
          <fieldset className="n-test-env-qrcode">
            <legend>二维码(手机扫描可以直接切换到上述环境并跳转到测试页面)</legend>
            <div className="n-settings-bar">
              右键点击二维码复制图片
            </div>
            <QRCode size="300" value={redirectUrl} />
          </fieldset>
        </Modal>
      </div>
    );
  }
}

ReactDOM.render(<Capture />, document.getElementById('root'));
