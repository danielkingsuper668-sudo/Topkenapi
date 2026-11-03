#!/usr/bin/env bash
# TopkenX test site: builds the wip/console-redesign branch and serves it at
# https://test.topkenx.com behind a password, using a COPY of the live data.
# Safe to re-run: it pulls the latest code and restarts only the test site.
set -euo pipefail

BRANCH="${BRANCH:-wip/console-redesign}"
REPO="https://github.com/danielkingsuper668-sudo/Topkenapi.git"
DOMAIN="${DOMAIN:-test.topkenx.com}"
DIR=/opt/topkenx-test
NAME=topkenx-test
PORT=3001

say(){ printf '\n\033[1;35m==> %s\033[0m\n' "$*"; }
die(){ printf '\n\033[1;31m[错误] %s\033[0m\n' "$*"; exit 1; }
[ "$(id -u)" = 0 ] || die "请用 root 运行：sudo bash $0"
command -v docker >/dev/null || die "没有找到 docker"
command -v git >/dev/null || apt-get install -y -qq git >/dev/null

say "1/6 检查内存（编译需要约 2GB，不够就自动加 2GB 交换空间）"
if [ "$(awk '/SwapTotal/{print $2}' /proc/meminfo)" -lt 1000000 ]; then
  [ -f /swapfile ] || { fallocate -l 2G /swapfile && chmod 600 /swapfile && mkswap /swapfile >/dev/null; }
  swapon /swapfile 2>/dev/null || true
  grep -q '^/swapfile' /etc/fstab || echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi
free -h | sed -n '1,3p'

say "2/6 下载最新代码（分支 $BRANCH）"
if [ -d "$DIR/src/.git" ]; then
  git -C "$DIR/src" fetch -q --depth 1 origin "$BRANCH"
  git -C "$DIR/src" checkout -q -B test FETCH_HEAD
else
  mkdir -p "$DIR" && git clone -q --depth 1 -b "$BRANCH" "$REPO" "$DIR/src"
fi
echo "版本：$(git -C "$DIR/src" log -1 --format='%h %s')"

say "3/6 编译网站（大约 8–15 分钟，请耐心等待，不要关闭 Termius）"
git -C "$DIR/src" rev-parse --short HEAD:web > "$DIR/src/VERSION"  # web folder fingerprint: unchanged web code reuses the build cache
docker build -q -t topkenx:test "$DIR/src" >/dev/null || die "编译失败，请把上面的报错截图发给 Claude（正式站不受影响）"

say "4/6 找到正式站，复制一份数据给测试站"
# the live site is the new-api container that is NOT a test site
LIVE=$(docker ps --format '{{.ID}} {{.Image}} {{.Names}}' | awk 'tolower($3) !~ /test/' | grep -Ei 'new-?api|topken' | grep -vi caddy | head -1 | cut -d' ' -f1 || true)
[ -n "$LIVE" ] || die "没找到正在运行的正式站容器（docker ps 里应该有 new-api）"
LIVE_DATA=$(docker inspect -f '{{range .Mounts}}{{if eq .Destination "/data"}}{{.Source}}{{end}}{{end}}' "$LIVE")
[ -n "$LIVE_DATA" ] || die "正式站没有挂载 /data，无法复制数据"
NET=$(docker inspect -f '{{range $k,$v := .NetworkSettings.Networks}}{{$k}}{{"\n"}}{{end}}' "$LIVE" | head -1)
ENVF="$DIR/live.env"
# keep the live settings, but never point the test site at the live database/cache
docker inspect -f '{{range .Config.Env}}{{println .}}{{end}}' "$LIVE" \
  | grep -Ev '^(PATH|HOME|HOSTNAME|PORT|SQL_DSN|LOG_SQL_DSN|REDIS_CONN_STRING|NODE_TYPE)=' > "$ENVF" || true
if docker inspect -f '{{range .Config.Env}}{{println .}}{{end}}' "$LIVE" | grep -q '^SQL_DSN='; then
  echo "注意：正式站用的是外部数据库，测试站将使用全新的空数据库（不会碰正式数据）"
fi
mkdir -p "$DIR/data"
if [ "$(cat "$DIR/data/.copied" 2>/dev/null)" != "$LIVE_DATA" ] || [ "${FRESH_DATA:-0}" = 1 ]; then
  rm -rf "$DIR/data"/* "$DIR/data"/.copied; cp -a "$LIVE_DATA"/. "$DIR/data"/ && echo "$LIVE_DATA" > "$DIR/data/.copied"
  echo "已复制正式站数据：$LIVE_DATA → $DIR/data"
else
  echo "沿用上次复制的数据（想重新复制：FRESH_DATA=1 再运行）"
fi

say "5/6 启动测试站容器 $NAME"
docker rm -f "$NAME" >/dev/null 2>&1 || true
# an older test site (e.g. topkenapi-test) may still hold the port: retire it
for OLD in $(docker ps -a --format '{{.Names}}' | grep -i test | grep -v "^$NAME\$" || true); do
  echo "停用旧测试站容器：$OLD"; docker rm -f "$OLD" >/dev/null 2>&1 || true
done
if [ "$NET" = host ]; then NETARGS=(--network host -e PORT=$PORT); else NETARGS=(--network "$NET" -p 127.0.0.1:$PORT:3000); fi
docker run -d --name "$NAME" --restart unless-stopped "${NETARGS[@]}" \
  --env-file "$ENVF" -v "$DIR/data":/data topkenx:test >/dev/null
sleep 4; docker ps --filter "name=^/$NAME$" --format '状态：{{.Status}}'

say "6/6 配置 Caddy：$DOMAIN（带访问密码）"
CADDY_C=$(docker ps --format '{{.Names}} {{.Image}}' | awk 'tolower($2) ~ /caddy/ {print $1; exit}')
if [ -n "$CADDY_C" ]; then
  CF=$(docker inspect -f '{{range .Mounts}}{{if eq .Destination "/etc/caddy/Caddyfile"}}{{.Source}}{{end}}{{end}}' "$CADDY_C")
  [ -n "$CF" ] || CF="$(docker inspect -f '{{range .Mounts}}{{if eq .Destination "/etc/caddy"}}{{.Source}}{{end}}{{end}}' "$CADDY_C")/Caddyfile"
  HASH(){ docker exec "$CADDY_C" caddy hash-password --plaintext "$1"; }
  CNET=$(docker inspect -f '{{range $k,$v := .NetworkSettings.Networks}}{{$k}}{{"\n"}}{{end}}' "$CADDY_C" | head -1)
  if [ "$CNET" = host ]; then UP="127.0.0.1:$PORT"
  elif [ "$NET" = host ]; then UP="host.docker.internal:$PORT"
  else UP="$NAME:3000"; docker network connect "$CNET" "$NAME" 2>/dev/null || true; fi
  RELOAD(){ docker exec "$CADDY_C" caddy reload --config /etc/caddy/Caddyfile --adapter caddyfile; }
elif command -v caddy >/dev/null; then
  CF=/etc/caddy/Caddyfile; UP="127.0.0.1:$PORT"; HASH(){ caddy hash-password --plaintext "$1"; }
  RELOAD(){ systemctl reload caddy; }
else
  die "没找到 Caddy。测试站已在服务器本机 127.0.0.1:$PORT 运行，但还没有公网地址"
fi
[ -f "$CF" ] || die "没找到 Caddyfile：$CF"
PASSF="$DIR/password.txt"
[ -f "$PASSF" ] || { openssl rand -hex 6 2>/dev/null || date +%s%N | sha256sum | cut -c1-12; } > "$PASSF"
PASS=$(cat "$PASSF")
if grep -q "^$DOMAIN" "$CF" && ! grep -q "reverse_proxy $UP\$" "$CF"; then
  # an older block for this domain points somewhere else: replace it with ours
  cp "$CF" "$CF.bak.$(date +%s)"
  awk -v d="$DOMAIN" 'index($0,d)==1 && /\{/ {skip=1; depth=0}
    skip { n=gsub(/\{/,"{"); m=gsub(/\}/,"}"); depth+=n-m; if (depth<=0 && (n||m)) {skip=0}; next } {print}' "$CF" > "$CF.tmp" && cat "$CF.tmp" > "$CF" && rm -f "$CF.tmp"
fi
if ! grep -q "^$DOMAIN" "$CF"; then
  H=$(HASH "$PASS" | tail -1); [ -n "$H" ] || die "无法生成访问密码（caddy hash-password 失败）"
  cp "$CF" "$CF.bak.$(date +%s)"
  printf '\n%s {\n\tbasicauth {\n\t\ttopkenx %s\n\t}\n\treverse_proxy %s\n}\n' "$DOMAIN" "$H" "$UP" >> "$CF"
fi
RELOAD >/dev/null 2>&1 || die "Caddy 重新加载失败，Caddyfile 已备份为 $CF.bak.*"

IP=$(curl -fsS4 https://api.ipify.org 2>/dev/null || hostname -I | awk '{print $1}')
printf '\n\033[1;32m完成！\033[0m\n'
echo "测试站地址：https://$DOMAIN"
echo "登录弹窗的用户名：topkenx   密码：$PASS"
echo "（进去后用正式站同样的账号登录后台）"
echo
echo "如果打不开：到 Cloudflare → DNS 添加一条 A 记录"
echo "  名称 test   内容 $IP   代理状态：仅 DNS（灰色云朵）"
