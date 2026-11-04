#!/usr/bin/env bash
# TopkenX live site: builds the wip/console-redesign branch and swaps it into
# the running live container (same name, data, ports, network and settings).
# Before swapping it backs up the live database, and keeps the old container
# (stopped) so ROLLBACK=1 can bring it back in seconds.
#   update:    bash live-site.sh
#   rollback:  ROLLBACK=1 bash live-site.sh
set -euo pipefail

BRANCH="${BRANCH:-wip/console-redesign}"
REPO="https://github.com/danielkingsuper668-sudo/Topkenapi.git"
DIR=/opt/topkenx-live
IMAGE=topkenx:live

say(){ printf '\n\033[1;35m==> %s\033[0m\n' "$*"; }
die(){ printf '\n\033[1;31m[错误] %s\033[0m\n' "$*"; exit 1; }
[ "$(id -u)" = 0 ] || die "请用 root 运行"
command -v docker >/dev/null || die "没有找到 docker"

# the live site is the new-api container that is NOT a test site and not a backup
find_live(){
  docker ps -a --format '{{.Names}} {{.Image}}' \
    | awk 'tolower($1) !~ /test|-old$/ && tolower($2) !~ /caddy/' \
    | grep -Ei 'new-?api|topken' | head -1 | cut -d' ' -f1 || true
}
LIVE=$(find_live)
[ -n "$LIVE" ] || die "没找到正式站容器（docker ps 里应该有 topkenapi / new-api）"
OLD="$LIVE-old"

if [ "${ROLLBACK:-0}" = 1 ]; then
  say "回滚：恢复上一个版本"
  docker inspect "$OLD" >/dev/null 2>&1 || die "没有可回滚的旧版本（$OLD 不存在）"
  docker rm -f "$LIVE" >/dev/null
  docker rename "$OLD" "$LIVE"
  docker start "$LIVE" >/dev/null
  sleep 4; docker ps --filter "name=^/$LIVE$" --format '状态：{{.Status}}'
  printf '\n\033[1;32m已回滚完成！\033[0m\n'; exit 0
fi

say "1/5 检查内存"
if [ "$(awk '/SwapTotal/{print $2}' /proc/meminfo)" -lt 1000000 ]; then
  [ -f /swapfile ] || { fallocate -l 2G /swapfile && chmod 600 /swapfile && mkswap /swapfile >/dev/null; }
  swapon /swapfile 2>/dev/null || true
fi

say "2/5 下载最新代码（分支 $BRANCH）"
if [ -d "$DIR/src/.git" ]; then
  git -C "$DIR/src" fetch -q --depth 1 origin "$BRANCH"
  git -C "$DIR/src" checkout -q -B live FETCH_HEAD
else
  mkdir -p "$DIR" && git clone -q --depth 1 -b "$BRANCH" "$REPO" "$DIR/src"
fi
echo "版本：$(git -C "$DIR/src" log -1 --format='%h %s')"

say "3/5 编译（测试站编译过的同一版本会直接复用，通常 1–3 分钟；否则 8–15 分钟）"
git -C "$DIR/src" rev-parse --short HEAD:web > "$DIR/src/VERSION"
docker build -q -t "$IMAGE" "$DIR/src" >/dev/null || die "编译失败，正式站没有任何改动。请截图发给 Claude"

say "4/5 备份正式站数据"
DATA=$(docker inspect -f '{{range .Mounts}}{{if eq .Destination "/data"}}{{.Source}}{{end}}{{end}}' "$LIVE")
[ -n "$DATA" ] || die "正式站没有挂载 /data"
B="/root/backups/before-update-$(date +%Y%m%d-%H%M)"
mkdir -p "$B" && cp -a "$DATA"/. "$B"/
echo "已备份到：$B"

say "5/5 用新版本替换正式站（几秒钟）"
# copy every setting of the running container onto the new one
ARGS=(--name "$LIVE")
RESTART=$(docker inspect -f '{{.HostConfig.RestartPolicy.Name}}' "$LIVE"); ARGS+=(--restart "${RESTART:-unless-stopped}")
NET=$(docker inspect -f "{{.HostConfig.NetworkMode}}" "$LIVE"); [ "$NET" = default ] && NET=bridge; ARGS+=(--network "$NET")
while read -r m; do [ -n "$m" ] && ARGS+=(-v "$m"); done < <(docker inspect -f '{{range .Mounts}}{{.Source}}:{{.Destination}}{{"\n"}}{{end}}' "$LIVE")
while read -r p; do [ -n "$p" ] && ARGS+=(-p "$p"); done < <(docker inspect -f '{{range $c,$b := .HostConfig.PortBindings}}{{range $b}}{{if .HostIp}}{{.HostIp}}:{{end}}{{.HostPort}}:{{$c}}{{"\n"}}{{end}}{{end}}' "$LIVE" | sed 's#/tcp$##')
ENVF="$DIR/live.env"
docker inspect -f '{{range .Config.Env}}{{println .}}{{end}}' "$LIVE" | grep -Ev '^(PATH|HOME|HOSTNAME)=' > "$ENVF" || true
ARGS+=(--env-file "$ENVF")
CMD=$(docker inspect -f '{{join .Config.Cmd " "}}' "$LIVE")
ALIASES=$(docker inspect -f '{{range $k,$v := .NetworkSettings.Networks}}{{join $v.Aliases " "}}{{end}}' "$LIVE")

docker rm -f "$OLD" >/dev/null 2>&1 || true
docker stop "$LIVE" >/dev/null
docker rename "$LIVE" "$OLD"
# shellcheck disable=SC2086
if ! docker run -d "${ARGS[@]}" "$IMAGE" $CMD >/dev/null; then
  docker rm -f "$LIVE" >/dev/null 2>&1 || true
  docker rename "$OLD" "$LIVE"; docker start "$LIVE" >/dev/null
  die "新版本启动失败，已自动恢复旧版本"
fi
# reconnect any extra networks the old container was on (e.g. Caddy's)
for n in $(docker inspect -f '{{range $k,$v := .NetworkSettings.Networks}}{{$k}} {{end}}' "$OLD"); do
  [ "$n" = "$NET" ] || docker network connect "$n" "$LIVE" 2>/dev/null || true
done
: "$ALIASES"
sleep 6
if ! docker ps --filter "name=^/$LIVE$" --filter status=running -q | grep -q .; then
  docker rm -f "$LIVE" >/dev/null 2>&1 || true
  docker rename "$OLD" "$LIVE"; docker start "$LIVE" >/dev/null
  die "新版本没有正常运行，已自动恢复旧版本"
fi
docker ps --filter "name=^/$LIVE$" --format '状态：{{.Status}}'
docker image prune -f >/dev/null 2>&1 || true

printf '\n\033[1;32m完成！正式站已更新\033[0m\n'
echo "旧版本已保留（停止状态）：$OLD"
echo "如需回滚：ROLLBACK=1 bash /root/live-site.sh"
