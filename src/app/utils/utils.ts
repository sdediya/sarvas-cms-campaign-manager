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
}