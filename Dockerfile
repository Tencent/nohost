FROM csighub.tencentyun.com/imweb/node12-with-gyp

WORKDIR /nohost

COPY . .

RUN npm install --registry=http://r.tnpm.oa.com

RUN npm run dist

CMD ["node", "bin/nohost", "run"]
