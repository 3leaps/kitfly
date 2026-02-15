:::flow-branching
source: "Incoming Request"
split: "Route"
branches:
  - "API Handler"
  - "Static Files"
  - "WebSocket"
:::
