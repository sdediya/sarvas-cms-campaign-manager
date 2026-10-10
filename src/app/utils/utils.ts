export type LandingShortcodes = {
    region_shortcode?: string | null;
    tel_shortcode?: string | null;
    service_code?: string | null;
};

const LANDING_SLUG = /^[a-z0-9-]{1,32}$/;
const RESERVED_REGIONS = ['api', 'assets', 'he'];
const LANDING_REF = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default class Utils {
    public static isValidEmail(email:string) {
        var re = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/;
        return re.test(String(email).toLowerCase());
    }

    public static replaceCumulative(str:string, find:Array<string>, replace:Array<string>) {
        for (var i = 0; i < find.length; i++)
        str = str.replace(new RegExp(find[i],"g"), replace[i]);
        return str;
    }

    /** Same slug rules as the platform's landing routes: `ZAIN_KSA` becomes `zain-ksa`. */
    public static toSlug(value: string | null | undefined): string {
        return (value ?? '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    }

    /**
     * The platform's landing URL for a campaign (`c`) or plan (`p`):
     * `<base>/<region>/<operator>/<service>/<kind>/<id>[/<page>][?<query>]`, or null when the
     * row's shortcodes don't make a valid path or the id is not a UUID.
     */
    public static landingRefUrl(baseUrl: string, row: LandingShortcodes, kind: 'c' | 'p', id: string, page = '', query = ''): string | null {
        const region = Utils.toSlug(row.region_shortcode);
        const operator = Utils.toSlug(row.tel_shortcode);
        const service = Utils.toSlug(row.service_code);
        const valid = [region, operator, service].every((s) => LANDING_SLUG.test(s)) && !RESERVED_REGIONS.includes(region);
        if (!valid || !LANDING_REF.test(id ?? '')) return null;
        const path = `${baseUrl.replace(/\/+$/, '')}/${region}/${operator}/${service}/${kind}/${encodeURIComponent(id)}`;
        return `${path}${page ? `/${page}` : ''}${query ? `?${query}` : ''}`;
    }
}
