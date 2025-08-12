export class AutoSuggestResponse {
    constructor(json: any){
        this.id = json.id;
        this.title = json.title;
        this.storeUrl = json.storeUrl;
        this.iconUrl = json.iconUrl;
        this.iconClass = json.iconClass;
    }

    public id: string;
    public title: string;
    public storeUrl: string;
    public iconUrl: string;
    public iconClass: string[];
}