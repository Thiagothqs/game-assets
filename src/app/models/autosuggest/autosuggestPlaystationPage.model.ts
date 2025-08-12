export class AutoSuggestPlayStationPageResponse {
    constructor(json: any){
        this.imageList = json.data.productRetrieve.concept.media.filter((f:any) => f.type == "IMAGE").map((m:any) => { return { "role": m.role, "url": m.url } });
        this.screenshotList = json.data.productRetrieve.concept.media.filter((f:any) => f.type == "IMAGE" && f.role == "SCREENSHOT").map((m:any) => { return { "role": m.role, "url": m.url } });
        this.videoList = json.data.productRetrieve.concept.media.filter((f:any) => f.type == "VIDEO").map((m:any) => { return { "role": m.role, "url": m.url } });
    }

    public imageList: string[];
    public screenshotList: string[];
    public videoList: string[];
}