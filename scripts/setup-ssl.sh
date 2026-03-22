#!/bin/bash
DOMAIN="chengnanblog.cn"
EMAIL="liuyq@chengnanblog.cn"
echo "--- 开始配置 SSL 证书 ---"
sudo apt update
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d $DOMAIN --non-interactive --agree-tos -m $EMAIL --redirect
echo "--- SSL 配置完成！请尝试访问 https://$DOMAIN ---"
