export class AutoSuggestPlayStationResponse {
    constructor(json: any){
        this.id = json.id;
        this.name = json.name;
        this.imageList = json.media.filter((f:any) => f.type == "IMAGE" && f.role != "SCREENSHOT").map((m:any) => { return new AutoSuggestImagePlayStationResponse(m.role, m.url) });
        this.screenshotList = json.media.filter((f:any) => f.type == "IMAGE" && f.role == "SCREENSHOT").map((m:any) => { return new AutoSuggestImagePlayStationResponse(m.role, m.url) });
        this.videoList = json.media.filter((f:any) => f.type == "VIDEO").map((m:any) => { return new AutoSuggestImagePlayStationResponse(m.role, m.url) });
    }

    public id: string;
    public name: string;
    public imageList: AutoSuggestImagePlayStationResponse[];
    public screenshotList: AutoSuggestImagePlayStationResponse[];
    public videoList: AutoSuggestImagePlayStationResponse[];
}

export class AutoSuggestImagePlayStationResponse {
    constructor(role: string, url: string){
        this.role = role;
        this.url = url;
    }

    public role: string;
    public url: string;
}