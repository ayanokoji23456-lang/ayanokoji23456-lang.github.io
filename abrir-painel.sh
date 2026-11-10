#!/usr/bin/env bash
# Abre o painel local da Petala Floricultura e informa o endereço para o celular.

set -e
cd "$(dirname "$0")"

echo "Painel local - Petala Floricultura"

if ! command -v node >/dev/null 2>&1; then
    echo "Node.js nao foi encontrado."
    echo "Instale o Node.js em https://nodejs.org/ (ou via seu gerenciador de pacotes) e execute este script novamente."
    exit 1
fi

if [ ! -d "node_modules/express" ]; then
    echo "Instalando as dependencias pela primeira vez..."
    npm install
fi

# Encerra qualquer servidor antigo que tenha ficado rodando
if [ -f .painel.pid ] && kill -0 "$(cat .painel.pid)" 2>/dev/null; then
    kill "$(cat .painel.pid)" 2>/dev/null || true
fi

nohup npm start > painel-servidor.log 2>&1 &
echo $! > .painel.pid

sleep 2

URL="http://localhost:3000/painel.html"
LAN_IP=""
if command -v hostname >/dev/null 2>&1; then
    LAN_IP="$(hostname -I 2>/dev/null | awk '{print $1}')"
fi
if [ -z "$LAN_IP" ] && command -v ipconfig >/dev/null 2>&1; then
    LAN_IP="$(ipconfig 2>/dev/null | awk '/IPv4 Address|Endereço IPv4/ {gsub(/[^0-9.]/, "", $NF); print $NF; exit}')"
fi

# Tenta abrir direto em um navegador conhecido primeiro. Em algumas instalacoes
# de Linux sem navegador padrao configurado, o xdg-open acaba repassando o link
# para o gerenciador de arquivos, que tenta abrir "http://..." como se fosse uma
# pasta de rede e falha com "nao foi possivel encontrar a pasta". Ir direto no
# binario do navegador evita esse problema.
ABRIU=""
for BROWSER in google-chrome google-chrome-stable chromium chromium-browser brave-browser microsoft-edge firefox; do
    if command -v "$BROWSER" >/dev/null 2>&1; then
        nohup "$BROWSER" "$URL" >/dev/null 2>&1 &
        ABRIU="1"
        break
    fi
done

if [ -z "$ABRIU" ]; then
    if command -v xdg-open >/dev/null 2>&1; then
        nohup xdg-open "$URL" >/dev/null 2>&1 &
    elif command -v open >/dev/null 2>&1; then
        open "$URL"
    fi
fi

echo "Painel aberto em $URL"
if [ -z "$ABRIU" ]; then
    echo "Se nao abrir sozinho, copie o endereco acima e cole na barra de um navegador (Chrome, Firefox, etc.)."
fi
if [ -n "$LAN_IP" ]; then
    echo "Para abrir pelo celular na mesma rede Wi-Fi: http://$LAN_IP:3000/painel.html"
else
    echo "Nao foi possivel descobrir o IP da rede. Execute hostname -I e use: http://SEU-IP:3000/painel.html"
fi
echo "O servidor esta rodando em segundo plano (PID $(cat .painel.pid))."
echo "Para encerrar, rode: kill \$(cat .painel.pid)"
