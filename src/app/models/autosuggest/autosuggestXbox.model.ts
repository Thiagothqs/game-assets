export class AutoSuggestXboxResponse {
    constructor(json: any){
        this.title = json.Title;
        this.storeUrl = json.Url;
        this.imageUrl = json.ImageUrl;
        this.iconUrl = json.Metas.filter((f: { Key: string; Value: string; }) => f.Key == "Icon")[0].Value;
        this.iconClass = ["bi bi-xbox"];
    }

    public title: string;
    public storeUrl: string;
    public imageUrl: string;
    public iconUrl: string;
    public iconClass: string[];
}