# Where Command - Implementation Specification

## Overview

The `where` command allows site visitors to query the owner's (Vladimir's) current location, local time, and weather data via a terminal interface on the personal website. The system uses end-to-end encryption with NaCl, communicates via Apple Push Notifications (APNs) to wake the iPhone, and relays data through a Pihole VPS to the backend.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              REQUEST FLOW                                   │
└─────────────────────────────────────────────────────────────────────────────┘

[Visitor] ──> [Terminal] ──> [Backend Go] ──> [APNs] ──> [iPhone App]
                    │                                        │
                    │        (encrypted POST)                │
                    ▼                                        ▼
              [Pihole VPS] ◄──------wireguard----------── [iPhone]
              (relay service)

┌─────────────────────────────────────────────────────────────────────────────┐
│                           NETWORK TOPOLOGY                                  │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────┐         ┌──────────────────┐         ┌──────────────────┐
│  kolchurin.dev   │         │    Pihole VPS    │         │     iPhone       │
│   (Backend VPS)  │◄───────►│   (WireGuard)    │◄───────►│   (WireGuard)    │
│                  │         │                  │         │                  │
│ - Go backend     │         │ - Traefik        │         │ - iOS App        │
│ - Valkey         │         │ - Relay service  │         │ - CL location    │
│ - NaCl keypair   │         │                  │         │ - WeatherKit     │
└──────────────────┘         └──────────────────┘         └──────────────────┘

WireGuard Network: 10.x.x.x/24 (internal IPs)
- Backend: 10.x.x.1 (to be assigned)
- Pihole: 10.x.x.2 (existing)
- iPhone: 10.x.x.x (dynamic from Pihole's WireGuard)

┌─────────────────────────────────────────────────────────────────────────────┐
│                              DATA FLOW                                      │
└─────────────────────────────────────────────────────────────────────────────┘

1. Visitor types: where admin
2. Terminal → Backend POST /api/where { command: "admin" }
3. Backend:
   a. Generate UUID request_id
   b. Write to Valkey: WHERE:request:{request_id} = { ts, status: pending, ttl: 30s }
   c. Send APNs silent push to iPhone with payload: { "request-id": request_id }
   d. Poll Valkey for WHERE:response:{request_id} (max 30s, every 500ms)
4. iPhone receives silent push:
   a. Parse request_id from payload
   b. Get city from CLLocationManager (kCLLocationAccuracyHundredMeters - city only)
   c. Get weather from WeatherKit (fallback: Open-Meteo API)
   d. Get local time (DateFormatter with TimeZone)
   e. Encrypt payload with backend public key (NaCl box)
   f. POST to relay: http://10.x.x.2:8080/where/relay
5. Pihole relay:
   a. Receive POST from iPhone: { request_id, encrypted_data }
   b. Forward to backend: http://10.x.x.1:8080/api/where/response
   c. (No decryption - only relays encrypted blob)
6. Backend receives response:
   a. Read WHERE:response:{request_id} from Valkey
   b. Decrypt with private key (NaCl box open)
   c. Delete WHERE:request:{request_id} and WHERE:response:{request_id}
   d. Return to visitor
7. Visitor sees:
   Location: Prague, Czech Republic
   Local time: 14:32 CET
   Weather: 12°C, Partly Cloudy

If iPhone doesn't respond within 30s → "Location unavailable"
