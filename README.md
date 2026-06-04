# @getmesslo/messlo-mcp

Messlo [Model Context Protocol](https://modelcontextprotocol.io) server for Cursor, VS Code, and other MCP-compatible IDEs.

Ask your AI assistant to manage Messlo from your editor: create API keys, WhatsApp templates, send messages, set up Login with WhatsApp, and more.

## Quick start (Cursor)

1. Create an API key in [Messlo](https://messlo.com) → **Integration Tools** → **API Credentials**.
2. Open **Cursor Settings** → **MCP** → add:

```json
{
  "mcpServers": {
    "messlo": {
      "command": "npx",
      "args": ["-y", "@getmesslo/messlo-mcp"],
      "env": {
        "MESSLO_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

3. Restart Cursor and try: *"Check my Messlo integration status"*.

## Environment variables

| Variable | Required | Notes |
|----------|----------|--------|
| `MESSLO_API_KEY` | Yes | From Integration Tools → API Credentials |

The MCP server always uses `https://api.messlo.com` — the API base URL is not configurable.

## Tools

The server exposes tools for API keys, messaging, CRM, automations, chatbots, commerce, and more. In your IDE, ask Messlo to run `messlo_get_started`, `messlo_plan_integration` (pick a goal), or `messlo_list_mcp_tools` to see what is available.

## Resources

- `messlo://docs/overview`
- `messlo://automation/guide`
- `messlo://bots/guide`
- `messlo://crm/field-guide`
- `messlo://limits/plan`
- `messlo://automation/examples/{preset}` — full flow JSON per preset
- `messlo://prompts/{goal}` — example Cursor prompts
- `messlo://checkout/guide` — order notifications + dynamic PDF headers
- `messlo://docs/section/{id}`
- `messlo://docs/login-with-whatsapp`
- `messlo://examples/template/{preset}`

## License

MIT
