import { HttpClient } from "@angular/common/http";
import { BaseService } from "./base.service";
import { Injectable } from "@angular/core";

@Injectable({ providedIn: 'root' })
export class XboxService extends BaseService {
    private domain = "http://localhost:3000";
    public override baseUrl = ""; // "https://www.microsoft.com/msstoreapiprod/api";
    constructor(protected override http: HttpClient){
        super(http);
        const options = {
            // route: '/autosuggest?market=pt-br&sources=Microsoft-Terms%2CIris-Products%2CxSearch-Products&filter=%2BClientType%3AStoreWeb&counts=5%2C1%2C5&query='
            route: ''
        };
        this.init(options);
    }

    searchAutoSuggest(query: string): Promise<any> {
        return this.get(`https://www.microsoft.com/msstoreapiprod/api/autosuggest?market=pt-br&sources=Microsoft-Terms%2CIris-Products%2CxSearch-Products&filter=%2BClientType%3AStoreWeb&counts=5%2C1%2C5&query=${query}`);
    }

    searchStore(storeUrl: string): Promise<any> {
        return this.get(`${this.domain}/api/wallpapersXbox?url=${storeUrl}`);
    }
}