def make_config(email, password, region):
    return {
        "remarks": email,
        "inbounds": [
            {
                "listen": "127.0.0.1",
                "port": 10808,
                "protocol": "socks",
                "settings": {
                    "auth": "noauth",
                    "udp": True,
                    "userLevel": 8
                },
                "sniffing": {
                    "destOverride": [
                        "http",
                        "tls",
                        "fakedns"
                    ],
                    "enabled": True,
                    "routeOnly": False
                },
                "tag": "socks"
            }
        ],
        "outbounds": [
            {
                "mux": {
                    "concurrency": -1,
                    "enabled": False
                },
                "protocol": "trojan",
                "settings": {
                    "servers": [
                        {
                            "address": f"{region}.tunnel.kirafan.xyz",
                            "level": 8,
                            "ota": False,
                            "password": password,
                            "port": 443
                        }
                    ]
                },
                "streamSettings": {
                    "network": "tcp",
                    "security": "tls",
                    "tcpSettings": {
                        "header": {
                            "type": "none"
                        }
                    },
                    "tlsSettings": {
                        "allowInsecure": False,
                        "fingerprint": "randomized",
                        "serverName": f"{region}.tunnel.kirafan.xyz",
                        "show": False
                    }
                },
                "tag": "proxy"
            },
            {
                "protocol": "freedom",
                "settings": {
                    "domainStrategy": "UseIP"
                },
                "tag": "direct"
            }
        ],
        "policy": {
            "levels": {
                "8": {
                    "connIdle": 300,
                    "downlinkOnly": 5,
                    "handshake": 4,
                    "uplinkOnly": 2
                }
            }
        },
        "routing": {
            "domainStrategy": "IPIfNonMatch",
            "rules": [
                {
                    "domain": [
                        "domain:star-api.com",
                        "domain:gstatic.com",
                        "domain:vpc.kirara.us.kg"
                    ],
                    "outboundTag": "proxy"
                },
                {
                    "ip": [
                        "1.1.1.1"
                    ],
                    "outboundTag": "proxy"
                },
                {
                    "outboundTag": "direct",
                    "port": "0-65535"
                }
            ]
        },
        "dns": {},
        "log": {},
        "stats": {}
    }
