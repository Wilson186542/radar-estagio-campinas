# Campinas Transit GIS • GTFS & Telemetria AVL em Tempo Real

Sistema web GIS open-source (baseado em **Leaflet.js** + **OpenStreetMap** + **GTFS** + **Telemetria AVL Protobuf**) para visualização viária exata rua a rua e rastreamento de ônibus em tempo real em **Campinas-SP**, cobrindo as linhas:

- **Linha 330:** Corredor Central ↔ Unicamp (Cidade Universitária) — `IDA` (29 paradas, 292 vértices de rua) e `VOLTA` (27 paradas, 296 vértices de rua)
- **Linha 386:** Cambuí ↔ Terminal Rodoviária — `IDA` (14 paradas, 123 vértices de rua) e `VOLTA` (14 paradas, 130 vértices de rua)
- **Linha 382:** Cambuí ↔ Campinas Shopping — `IDA` (38 paradas, 293 vértices de rua) e `VOLTA` (38 paradas, 236 vértices de rua)

---

## Estrutura do Projeto

```text
Onibus/
├── index.html                  # Interface GIS principal (Leaflet.js + Painel AVL)
├── server.py                   # Servidor HTTP + Proxy decodificador Protobuf em tempo real
├── README.md                   # Documentação do sistema
├── data/
│   ├── transit_data.json       # Bundle JSON otimizado (geometria de rua, paradas, horários)
│   └── gtfs/                   # Arquivos estáticos padrão GTFS gerados a partir dos dados reais
│       ├── routes.txt
│       ├── trips.txt
│       ├── stops.txt
│       ├── stop_times.txt
│       └── shapes.txt
├── scripts/
│   ├── fetch_real_gtfs.py      # Extrator de geometria viária real, paradas e horários (EMDEC/Cittamobi)
│   └── parse_gtfs.py           # Conversor auxiliar de CSV GTFS
└── src/
    ├── css/
    │   └── style.css           # Estilização do painel GIS, marcadores de frota e timeline
    └── js/
        └── app.js              # Renderização Leaflet, setas de fluxo e interpolação AVL em tempo real
```

---

## Como Executar

1. **Atualizar a base GTFS e geometria de ruas (opcional, já gerada em `data/`):**
   ```powershell
   py scripts/fetch_real_gtfs.py
   ```

2. **Iniciar o servidor com suporte a Tempo Real (AVL):**
   ```powershell
   py server.py
   ```

3. **Acessar no navegador:**
   Abra `http://localhost:8000`
