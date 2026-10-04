/**
 * Default theme layer fields, kept in sync with the backend's
 * `src/services/cms/campaigns/theme-layers/types.ts` (vas-platform). Blank or null means
 * "inherit from the next layer"; the backend stores it as NULL.
 */

export const LAYER_SCOPE_OPTIONS = [
  { label: 'Operator', value: 'operator' },
  { label: 'Service', value: 'service' },
  { label: 'Operator + service', value: 'operator_service' }
];

export function scopeLabel(scope: string): string {
  return LAYER_SCOPE_OPTIONS.find((s) => s.value === scope)?.label ?? scope;
}

/** `null` = every language. */
export const LAYER_LANGUAGE_OPTIONS = [
  { label: 'All languages', value: null },
  { label: 'English', value: 'English' },
  { label: 'Arabic', value: 'Arabic' }
];

export type TextField = { name: string; label: string; max: number; kind: 'input' | 'textarea' | 'editor'; hint?: string };

/** Same rule as the backend (`isValidPriceText`): the amount is required and only these placeholders are allowed. */
export const PRICE_TEXT_PLACEHOLDERS = ['<currency>', '<plan_amount>', '<plan_validity>', '<validity_text>'];
export const PRICE_TEXT_HINT =
  'Blank = default (e.g. "KWD 0.15 / day"). Must include <plan_amount>. Placeholders: <currency>, <plan_amount>, <plan_validity> (days), <validity_text> (day / week / month in the page language).';

export function isValidPriceText(value: string): boolean {
  const tokens = value.match(/<[^<>]*>/g) ?? [];
  return value.includes('<plan_amount>') && tokens.every((t) => PRICE_TEXT_PLACEHOLDERS.includes(t));
}

export const TEXT_SECTIONS: { title: string; fields: TextField[] }[] = [
  {
    title: 'Price',
    fields: [
      { name: 'theme_price_text', label: 'Price text (e.g. "<currency> <plan_amount> per <validity_text>")', max: 200, kind: 'input', hint: PRICE_TEXT_HINT }
    ]
  },
  {
    title: 'Hero',
    fields: [
      { name: 'theme_title_text', label: 'Title', max: 300, kind: 'input' },
      { name: 'theme_banner_title_text', label: 'Banner title', max: 1000, kind: 'editor' },
      { name: 'theme_logo_title_text', label: 'Logo title', max: 1000, kind: 'editor' },
      { name: 'theme_hero_tag_text', label: 'Hero tag', max: 1000, kind: 'input' },
      { name: 'theme_additional_text', label: 'Additional text', max: 500, kind: 'textarea' },
      { name: 'theme_perks_text', label: 'Perks (one per line)', max: 2000, kind: 'textarea' }
    ]
  },
  {
    title: 'Mobile number and PIN',
    fields: [
      { name: 'theme_enter_mobile_label_text', label: 'Enter mobile label', max: 500, kind: 'input' },
      { name: 'theme_enter_otp_label_text', label: 'Enter PIN label', max: 500, kind: 'input' },
      { name: 'theme_send_otp_button_text', label: 'Send PIN button', max: 500, kind: 'input' },
      { name: 'theme_verify_otp_button_text', label: 'Verify PIN button', max: 500, kind: 'input' },
      { name: 'theme_verify_button_text', label: 'Verify button (short)', max: 50, kind: 'input' },
      { name: 'theme_resent_otp_text', label: 'Resend PIN text', max: 500, kind: 'input' }
    ]
  },
  {
    title: 'Subscribe button',
    fields: [
      { name: 'theme_subscribe_button_text', label: 'Subscribe button', max: 500, kind: 'input' },
      { name: 'theme_subscribe_button_before_text', label: 'Text before button', max: 1000, kind: 'editor' },
      { name: 'theme_subscribe_button_after_text', label: 'Text after button', max: 1000, kind: 'editor' },
      { name: 'theme_subscribe_button_before_text_otp', label: 'Text before button (PIN step)', max: 1000, kind: 'editor' },
      { name: 'theme_subscribe_button_after_text_otp', label: 'Text after button (PIN step)', max: 1000, kind: 'editor' }
    ]
  },
  {
    title: 'Exit and footer',
    fields: [
      { name: 'theme_exit_button_text', label: 'Exit button', max: 1000, kind: 'input' },
      { name: 'theme_exit_button_text_otp', label: 'Exit button (PIN step)', max: 1000, kind: 'input' },
      { name: 'theme_powered_by_text', label: 'Powered by', max: 200, kind: 'input' },
      { name: 'theme_terms_conditions', label: 'Terms and conditions', max: 4000, kind: 'editor' }
    ]
  }
];

export const COLOR_FIELDS = [
  { name: 'theme_page_background_color', label: 'Page background' },
  { name: 'theme_page_text_color', label: 'Page text' },
  { name: 'theme_subscribe_button_color', label: 'Subscribe button' },
  { name: 'theme_exit_button_color', label: 'Exit button' },
  { name: 'theme_secondary_color', label: 'Secondary (accent)' }
];

/** `null` inherits; unlike campaign themes, a layer flag is not forced on or off. */
export const FLAG_OPTIONS = [
  { label: 'Inherit', value: null },
  { label: 'Show', value: 1 },
  { label: 'Hide', value: 0 }
];

export const FLAG_FIELDS = [
  { name: 'theme_is_logo', label: 'Service logo' },
  { name: 'theme_operator_is_logo', label: 'Operator logo' },
  { name: 'theme_exit_button', label: 'Exit button' }
];

const inherit = { label: 'Inherit', value: null };

export const ENUM_FIELDS = [
  {
    name: 'theme_hero_layout',
    label: 'Hero layout',
    options: [inherit, { label: 'Standard', value: 'standard' }, { label: 'Poster', value: 'poster' }, { label: 'Split', value: 'split' }]
  },
  {
    name: 'theme_exit_style',
    label: 'Exit style',
    options: [
      inherit,
      { label: 'Button', value: 'button' },
      { label: 'Link', value: 'link' },
      { label: 'Cross', value: 'cross' },
      { label: 'Button and cross', value: 'both' }
    ]
  },
  {
    name: 'theme_exit_otp_action',
    label: 'Exit on PIN step',
    options: [inherit, { label: 'Exit the page', value: 'exit' }, { label: 'Back to mobile number', value: 'back' }]
  }
];

export const MAX_IMAGES = 20;
/** Backend rule is `#` + 3/4/6/8 hex digits; the form also accepts it without `#` and adds it on save. */
export const HEX_COLOR_INPUT = /^#?(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;
/** Images and the operator logo: https, or a root-relative path served by the landing host. */
export const HTTPS_OR_ROOT_URL = /^(https:\/\/[^\s"'<>\\`,]+|\/(?!\/)[^\s"'<>\\`,]*)$/;
/** The landing only follows absolute http(s) exit URLs. */
export const HTTP_URL = /^https?:\/\/[^\s"'<>\\`]+$/;
