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

| Tool | Description |
|------|-------------|
| `messlo_get_started` | Integration checklist (WABA, phones, keys) |
| `messlo_plan_integration` | Recommended tool sequence by goal (any industry) |
| `messlo_search_docs` | Search API docs and FAQs |
| `messlo_list_connections` | WABA + phone numbers |
| `messlo_create_api_key` | Create API key (secret shown once) |
| `messlo_list_api_keys` | List keys (masked) |
| `messlo_delete_api_key` | Delete keys (`confirm: true`) |
| `messlo_list_api_logs` | API request logs |
| `messlo_send_message` | Send WhatsApp messages |
| `messlo_create_contact` | Create contact |
| `messlo_list_contacts` | List contacts |
| `messlo_get_contact` | Get contact by id |
| `messlo_update_contact` | Update contact / custom fields |
| `messlo_list_segments` | List segments |
| `messlo_create_segment` | Create segment |
| `messlo_list_tags` | List tags |
| `messlo_create_tag` | Create tag |
| `messlo_list_custom_fields` | List CRM custom fields |
| `messlo_create_custom_field` | Create CRM custom field |
| `messlo_send_template` | Send approved WhatsApp template |
| `messlo_list_chats` | Recent WhatsApp conversations |
| `messlo_list_messages` | Messages in a thread (by contact_id) |
| `messlo_list_industry_packs` | List industry packs |
| `messlo_preview_industry_pack` | Preview pack provisioning |
| `messlo_apply_industry_pack` | Apply pack (`confirm: true`) |
| `messlo_resync_industry_pack` | Resync pack flows (`confirm: true`) |
| `messlo_create_template` | Create template (presets) |
| `messlo_update_template` | Update template (fix rejections) |
| `messlo_list_templates` | List templates |
| `messlo_sync_templates` | Sync from Meta |
| `messlo_create_campaign` | Create broadcast |
| `messlo_list_campaigns` | List campaigns |
| `messlo_send_campaign` | Send campaign |
| `messlo_create_whatsapp_login_app` | Create Login app |
| `messlo_list_whatsapp_login_apps` | List Login apps |
| `messlo_regenerate_login_webhook_secret` | Rotate webhook secret |
| `messlo_start_whatsapp_login` | Start login session (dev) |
| `messlo_get_whatsapp_login_status` | Poll session |
| `messlo_verify_whatsapp_login_token` | Verify JWT |
| `messlo_call_api` | Escape hatch for allowed paths |
| `messlo_get_automation_builder_guide` | Patterns + steps for any industry (start here) |
| `messlo_compose_automation_flow` | Build flow JSON from declarative steps |
| `messlo_get_automation_node_types` | Automation node catalog |
| `messlo_list_automation_flows` | List bot flows |
| `messlo_list_automation_presets` | Starter presets (menu, CRM capture, routing, …) |
| `messlo_get_automation_preset` | Materialize a preset by id |
| `messlo_validate_automation_flow` | Validate nodes/connections locally |
| `messlo_create_automation_flow` | Create flow via API |
| `messlo_get_automation_flow` | Get flow by id |
| `messlo_update_automation_flow` | Update flow |
| `messlo_toggle_automation_flow` | Activate / deactivate |
| `messlo_test_automation_flow` | Test-run active flow |
| `messlo_delete_automation_flow` | Delete flow (`confirm: true`) |
| `messlo_list_automation_executions` | List runs for a flow |
| `messlo_get_automation_execution` | Execution detail + logs |

### Chatbots, message bots, forms

| Tool | Description |
|------|-------------|
| `messlo_list_chatbots` | List AI chatbots (waba_id) |
| `messlo_get_chatbot` | Get chatbot |
| `messlo_create_chatbot` | Create AI chatbot |
| `messlo_update_chatbot` | Update chatbot |
| `messlo_train_chatbot` | Train Q&A / context |
| `messlo_add_chatbot_qna_source` | Add Q&A knowledge source |
| `messlo_list_chatbot_knowledge_sources` | List knowledge sources |
| `messlo_delete_chatbot` | Delete (`confirm: true`) |
| `messlo_list_message_bots` | Keyword auto-replies |
| `messlo_create_message_bot` | Create (text via `reply_content`) |
| `messlo_update_message_bot` | Update message bot |
| `messlo_delete_message_bot` | Delete (`confirm: true`) |
| `messlo_create_reply_material` | Text reply asset |
| `messlo_list_quick_replies` | Inbox quick replies |
| `messlo_create_quick_reply` | Create quick reply |
| `messlo_update_quick_reply` | Update quick reply |
| `messlo_delete_quick_replies` | Bulk delete (`confirm: true`) |
| `messlo_list_forms` | WhatsApp Flow forms |
| `messlo_get_form` | Get form + `flow.flow_id` |
| `messlo_create_form` | Create form |
| `messlo_update_form` | Update form |
| `messlo_publish_form` | Publish Meta Flow |
| `messlo_delete_form` | Delete (`confirm: true`) |

### Ops & integrations

| Tool | Description |
|------|-------------|
| `messlo_get_usage` | Plan limits vs usage |
| `messlo_get_my_subscription` | Current plan + features |
| `messlo_list_agents` | Staff agents |
| `messlo_get_agent` | Agent details |
| `messlo_list_teams` | Teams (for create agent) |
| `messlo_create_agent` | Create agent |
| `messlo_update_agent_status` | Enable/disable agent |
| `messlo_assign_chat` | Assign chat to agent/chatbot |
| `messlo_list_sequences` | Drip sequences |
| `messlo_get_sequence` | Sequence + steps |
| `messlo_create_sequence` | New sequence |
| `messlo_create_sequence_step` | Add step |
| `messlo_delete_sequence` | Delete (`confirm: true`) |
| `messlo_google_connect_url` | Google OAuth URL |
| `messlo_list_google_accounts` | Connected Google accounts |
| `messlo_list_google_calendars` | Calendars |
| `messlo_create_google_calendar_event` | Calendar event |
| `messlo_list_google_sheets` | Linked sheets |
| `messlo_write_google_sheet` | Write sheet rows |
| `messlo_read_google_sheet` | Read sheet |
| `messlo_list_kanban_funnels` | Pipelines |
| `messlo_move_kanban_item` | Move contact stage |
| `messlo_import_contacts_csv` | Import CSV from local path |
| `messlo_list_import_jobs` | Import job status |

### Developer polish (Tier 5)

| Tool | Description |
|------|-------------|
| `messlo_setup_waba_webhooks` | Subscribe Meta webhooks for a WABA |
| `messlo_sync_templates_status` | Poll template approval (requires `waba_id`) |
| `messlo_list_reply_materials` | Saved replies for bots/sequences |
| `messlo_get_automation_statistics` | Flow/execution stats |
| `messlo_list_catalogs` | WhatsApp commerce catalogs |
| `messlo_sync_catalogs` | Pull catalogs from Meta |
| `messlo_list_catalog_products` | Products in a catalog |
| `messlo_link_catalog` | Link catalog to WABA |

### Commerce checkout (Tier 6)

| Tool | Description |
|------|-------------|
| `messlo_list_mcp_tools` | Tool catalog + plan goals |
| `messlo_create_ecommerce_webhook` | Order/checkout webhook endpoint |
| `messlo_map_ecommerce_webhook_template` | Map approved template + payload fields |
| `messlo_list_ecommerce_webhooks` | List webhooks |
| `messlo_delete_ecommerce_webhook` | Delete (`confirm: true`) |
| `messlo_delete_template` | Delete template (`confirm: true`) |
| `messlo_test_chatbot` | Test AI chatbot reply |
| `messlo_sync_workspace_waba` | Sync WABA from Meta |
| `messlo_get_business_profile` | Business profile |
| `messlo_update_business_profile` | Update profile |
| `messlo_delete_contacts` | Bulk delete (`confirm: true`) |

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

## Development

```bash
cd packages/messlo-mcp
npm install
npm run sync-docs   # bundle docs from mess-frontend
npm test            # offline smoke tests
npm run test:e2e    # live API (requires MESSLO_API_KEY)
npm run test:all    # smoke + e2e
MESSLO_API_KEY=xxx npm start
```

## E2E & go-live

1. Copy `.env.e2e.example` → set `MESSLO_API_KEY` from Integration Tools.
2. Run the full checklist:

```bash
MESSLO_API_KEY=your_key npm run go-live
```

This runs `sync-docs`, smoke tests, live E2E (16 checks against api.messlo.com), and `npm pack --dry-run`.

For CI, add GitHub secret `MESSLO_API_KEY` so PRs run `npm run test:e2e` automatically.

See [docs/messlo-mcp-e2e.md](../../docs/messlo-mcp-e2e.md) for the full go-live runbook.

## Publish

```bash
MESSLO_API_KEY=your_key npm run go-live
npm version patch   # when ready
npm publish --access public
```

## License

MIT
