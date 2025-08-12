
// import { environment } from '../../environments/environment';
import { Subject } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
// import * as fileSaver from 'file-saver';

/**
 * Classe base que implementa e padroniza as chamadas http
 */
export class BaseService {

    protected options: {
        route: string;
        skipFirstLoad?: boolean;
    } | any;
    protected _subject$: Subject<Array<any>>;
    protected baseUrl: string;

    constructor(protected http: HttpClient) {
        this.baseUrl = ""; //environment.baseUrl;
        this._subject$ = <Subject<Array<any>>>new Subject();
    }

    protected init(options: any) {
        this.options = options;
        this._subject$ = <Subject<Array<any>>>new Subject();
    }

    /**
     * Verbo http get 
     * @param method - Método do endpoint a ser requisitado
     * @param entity - Parâmetro do endpoint 
     */
    protected get(method: string, entity?: any, headers?: HttpHeaders | Record<string, string | string[]>): Promise<any> {
        return new Promise((resolve, reject) => {
            this.http.get(this.formUrl(method, entity), { headers: headers }).subscribe({
                next: (data: any) => {
                    this._subject$.next(data);
                    resolve(data);
                },
                error: (error: any) => reject(this.handleError(error))
            });
        });
    }

    /**
     * Verbo http post 
     * @param method - Método do endpoint a ser requisitado
     * @param entity - Parâmetro do endpoint 
     */
    protected post(method: string, entity: any): Promise<any> {
        return new Promise((resolve, reject) => {
            this.http.post(this.formUrl(method, entity), entity)
                .subscribe(
                    data => {
                        resolve(data);
                    },
                    error => {
                        reject(this.handleError(error));
                    });
        });
    }

    /**
     * Método usado quando a chamada do endpoint terá o resultado um download
     * @param method - Método do endpoint a ser requisitado
     * @param entity - Parâmetro do endpoint 
     * @param fileName - nome do arquivo
     * @param extension - extensão do arquivo
     * @param type - content type do arquivo
     */
    protected download(method: string, entity: any, fileName: any, extension: ".xlsx" | ".pdf", type: "application/pdf" | "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"): Promise<any> {
        return new Promise((resolve, reject) => {
            this.http.post(this.formUrl(method, entity), entity, { responseType: "blob" })
                .subscribe(
                    data => {
                        let blob: any = new Blob([data], { type: type });
                        // fileSaver.saveAs(blob, fileName + extension);
                        resolve(true);
                    },
                    error => {
                        reject(this.handleError(error));
                    });
        });
    }

    /**
     * Verbo http put 
     * @param method - Método do endpoint a ser requisitado
     * @param entity - Parâmetro do endpoint 
     */
    protected put(method: string, entity: any, useEntity: boolean = true): Promise<any> {
        return new Promise((resolve, reject) => {
         
            let url = this.formUrl(method, entity);
            if(!useEntity)
                url = this.formUrl(method);
            
            this.http.put(url, entity)
                .subscribe(
                    data => {
                        resolve(data);
                    },
                    error => {
                        reject(this.handleError(error));
                    });
        });
    }

    /**
     * Verbo http delete 
     * @param method - Método do endpoint a ser requisitado
     * @param entity - Parâmetro do endpoint 
     */
    protected delete(method: string, entity: any): Promise<any> {
        return new Promise((resolve, reject) => {
            this.http.delete(this.formUrl(method, entity)).subscribe(
                data => {
                    resolve(data);
                },
                error => {
                    reject(this.handleError(error));
                });
        });
    }

    /**
     * Prepara url e constrói o corpo da requisição
     * @param method - Método do endpoint a ser requisitado
     * @param entity - Parâmetro do endpoint 
     */
    protected formUrl(method: string, entity?: any): string {
        let urlParams = '';

        if (entity && entity.id) {
            urlParams = '/' + entity.id;
        }

        if((this.baseUrl + this.options.route) != ""){
            return this.baseUrl + this.options.route + '/' + method + urlParams;
        }
        else{
            return method + urlParams;
        }
    }

    /**
     * Generic error handler
     */
    protected handleError(error: any) {
        try {
            // if (error)
            //     return { message: error.erros[0] }
            // else
            return error

        } catch (erro) {
            return error
        }
    }
}

/**
 * Model usada para tratar os erros
 */
export class ErrorMessage {
    message?: string;
}