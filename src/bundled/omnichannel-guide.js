/**
 * Omnichannel (Telegram, Facebook Messenger, Instagram DM) integration guide.
 */
export const OMNICHANNEL_GUIDE = {
  title: "Omnichannel messaging",
  platforms: ["telegram", "facebook", "instagram"],
  contact_identifiers: {
    telegram: "telegram_chat_id",
    facebook: "facebook_page_scoped_id",
    instagram: "instagram_scoped_id",
    whatsapp: "phone_number (contact_no)",
  },
  connection: {
    list: "messlo_list_channels",
    connect_telegram: "messlo_connect_channel with platform=telegram and bot_token",
    connect_instagram:
      "messlo_get_instagram_oauth_config → open authorize_url in browser → messlo_connect_channel with code",
    connect_facebook:
      "messlo_connect_channel with platform=facebook and access_token from Meta OAuth",
  },
  send: {
    preferred: "messlo_send_message with contact_id (from messlo_list_chats or messlo_list_contacts)",
    telegram_direct:
      "messlo_send_message with platform=telegram, recipient_id=telegram_chat_id, workspace_id",
    endpoint: "POST /api/whatsapp/send (unified send path)",
  },
  inbox: {
    tool: "messlo_list_chats",
    platform_param: "platform=telegram|facebook|instagram",
    connection_id_note:
      "whatsapp_phone_number_id accepts Telegram bot id, Facebook page id, or Instagram account id for omnichannel inboxes",
  },
  templates: {
    create: "messlo_create_template with platform=instagram|facebook|telegram (omit waba_id)",
    note: "Omnichannel templates are locally approved; no Meta submission",
  },
  campaigns: {
    create:
      "messlo_create_campaign with platform=telegram|facebook|instagram|all (omit waba_id for non-whatsapp)",
  },
  meta_constraints: {
    facebook_instagram:
      "24-hour messaging window applies; use MESSAGE_TAG for certain outbound types outside the window",
    oauth:
      "Instagram and Facebook connection requires browser OAuth; MCP returns authorize_url only",
  },
  social_automation: {
    tools: [
      "messlo_fetch_social_media",
      "messlo_create_social_automation",
      "messlo_retrigger_social_comments",
    ],
    platforms: ["instagram", "facebook"],
  },
  plan_features: [
    "omnichannel_telegram",
    "omnichannel_facebook",
    "omnichannel_instagram",
    "fb_comment_dm",
    "ig_comment_dm",
  ],
};
