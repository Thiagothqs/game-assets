import { Injectable } from "@angular/core";
import { BaseService } from "./base.service";
import { HttpClient } from "@angular/common/http";

@Injectable({ providedIn: 'root' })
export class PlayStationService extends BaseService{
    private domain = "http://localhost:3000";
    public override baseUrl = "";
    constructor(protected override http: HttpClient){
        super(http);
        const options = {
            route: ''
        };
        this.init(options);
    }

    searchStore(gameName: string): Promise<any> {
        // return this.get(`https://store.playstation.com/pt-br/search/${gameName}`);
        return this.get(`${this.domain}/api/wallpapersPlaystation?gameName=${gameName}`);
    }

    searchStorePage(productId: string): Promise<any> {
        return this.get(`${this.domain}/api/wallpapersPlaystationPage?productId=${productId}`);
    }
}