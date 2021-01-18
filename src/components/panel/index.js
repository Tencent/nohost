/* Tencent is pleased to support the open source community by making nohost-环境配置与抓包调试平台 available.
* Copyright (C) 2020 THL A29 Limited, a Tencent company.  All rights reserved. The below software in
* this distribution may have been modified by THL A29 Limited ("Tencent Modifications").
* All Tencent Modifications are Copyright (C) THL A29 Limited.
* nohost-环境配置与抓包调试平台 is licensed under the MIT License except for the third-party components listed below.
*/

import React from 'react';

const Panel = ({ title, children, hide }) => (
  <div className={hide ? 'p-hide' : ''}>
    {title ? <h3 className="p-title">{title}</h3> : undefined}
    <div className="p-mid-ctn">
      {children}
    </div>
  </div>
);

export default Panel;
