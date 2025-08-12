import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { XboxService } from './services/xbox.service';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { CommonModule } from '@angular/common';
import { PlayStationService } from './services/playstation.service';
import { AutoSuggestPlayStationResponse } from './models/autosuggest/autosuggestPlaystation.model';
import { AutoSuggestXboxResponse } from './models/autosuggest/autosuggestXbox.model';
import { Gallery, GalleryItem, GalleryModule, GalleryRef, ImageItem } from 'ng-gallery';
import { LightboxModule } from 'ng-gallery/lightbox';
import { AutoSuggestResponse } from './models/autosuggest/autosuggest.model';
import { AutoSuggestPlayStationPageResponse } from './models/autosuggest/autosuggestPlaystationPage.model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule, GalleryModule, LightboxModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  private searchSubject = new Subject<string>();
  autoSuggestList: AutoSuggestResponse[] = [];
  imagesListPlaystation: AutoSuggestPlayStationResponse[] = [];
  imageFormat = "format=png";
  imageSize = ""; // &h=100&w=500
  imageQuality = ""; // &q=100
  galleryXbox: GalleryItem[] = [];
  imagesXbox: string[] = [];
  imagesXboxScreenshots: string[] = [];
  galleryPlayStation: GalleryItem[] = [];
  imagesPlayStation: string[] = [];
  imagesPlayStationScreenshots: string[] = [];
  includeScreenshot: boolean = true;
  
  constructor(
    private _xboxService: XboxService,
    private _playstationService: PlayStationService,
    private gallery: Gallery
  ){
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(query => {
      if(query != ""){
        this.search(query);
      }
    });
  }

  onInput(event: any){
    this.searchSubject.next(event.target.value);
  }
  
  search(query: string): void {
    this._xboxService.searchAutoSuggest(query).then(
      async res => {
        if(res.ResultSets.length > 0){
          var response = res.ResultSets[0].Suggests.map((m: any) => new AutoSuggestXboxResponse(m));
          this.autoSuggestList = response;
        }
        else{
          this.autoSuggestList = [];
        }

        await this.searchPlayStation(query);
      },
      err => console.error(err)
    );
  }

  searchPlayStation(query: string): Promise<void> {
    return this._playstationService.searchStore(query).then(
      res => {
        this.imagesListPlaystation = res.map((m: any) => new AutoSuggestPlayStationResponse(m));

        this.autoSuggestList.push(...this.imagesListPlaystation.map((m) => {
          return new AutoSuggestResponse(
            { "id": m.id, "iconUrl": m.imageList[0].url, "storeUrl": "", "title": m.name, "iconClass": ["bi bi-playstation"] }
          );
        }));

        this.autoSuggestList = Object.values(
          this.autoSuggestList.reduce((list, item, index) => {
            if (!list.map(m => m.title.replace("’", "'")).includes(item.title.replace("’", "'"))) {
              list[index] = { ...item }; // copia o primeiro item com esse title
            } else {
              // já existe, então concatena os iconClass
              const existingIconClassIndex = list.map(m => m.title.replace("’", "'")).indexOf(item.title.replace("’", "'"));              
              list[existingIconClassIndex].iconClass = [
                ...list[existingIconClassIndex].iconClass.map((m:string) => m),
                ...item.iconClass.map(m => m)
              ];

              //Adiciona id do PlayStation
              list[existingIconClassIndex].id = item.id;
            }
            return list;
          }, [] as AutoSuggestResponse[])
        );

      },
      err => console.error(err)
    );
  }

  async getImages(item: AutoSuggestResponse){
    try {
      this.clearLists();
      this.setImageSize();
      
      if(item.storeUrl != ""){
        const response = await this._xboxService.searchStore(`https:${item.storeUrl}`);
        this.imagesXbox = [
          response.boxArt.url,
          response.poster.url,
          response.superHeroArt.url
        ];
        
        this.galleryXbox = this.imagesXbox.map(m => new ImageItem({ src: m, thumb: m }));
        if(response.screenshots != null){
          this.imagesXboxScreenshots = response.screenshots.map((m:any) => m.url);
          if(this.includeScreenshot){
            this.galleryXbox.push(...this.imagesXboxScreenshots.map((m:any) => new ImageItem({ src: m, thumb: m })));
          }
        }

        // // Carrega os itens na galeria "xbox" para funcionar com lightbox
        const galleryRef: GalleryRef = this.gallery.ref('glr_xbox');
        galleryRef.load(this.galleryXbox);
      }

      if(this.imagesListPlaystation.length > 0){
        const imagesPlayStationGame = this.imagesListPlaystation.filter(f => f.name.replace("’", "'") == item.title.replace("’", "'"))[0];
        if(imagesPlayStationGame != null){
          this.imagesPlayStation = imagesPlayStationGame.imageList.map((m:any) => m.url);
          if(this.includeScreenshot){
            this.imagesPlayStationScreenshots.push(...imagesPlayStationGame.screenshotList.map((m:any) => m.url));
          }
        }
      }
      
      if(item.id != null){
        const responsePlayStationStore = await this._playstationService.searchStorePage(item.id);
        const playstationStorePage = new AutoSuggestPlayStationPageResponse(responsePlayStationStore);

        this.imagesPlayStation.push(...playstationStorePage.imageList.map((m:any) => m.url));
        this.imagesPlayStationScreenshots.push(...playstationStorePage.screenshotList.map((m:any) => m.url));
      }

      // Remove imagens duplicadas
      var setPlayStationImages = new Set([...this.imagesPlayStation]);
      this.imagesPlayStation = [...setPlayStationImages];

      this.galleryPlayStation = this.imagesPlayStation.map((m:any) => new ImageItem({ src: m, thumb: m }));
      if(this.includeScreenshot){
        var setPlayStationScreenshots = new Set([...this.imagesPlayStationScreenshots]);
        this.imagesPlayStationScreenshots = [...setPlayStationScreenshots];
        this.galleryPlayStation.push(...[...setPlayStationScreenshots].map((m:any) => new ImageItem({ src: m, thumb: m })));
      }
    } catch (error) {
      console.error(error);
    }
  }

  formatChange(event: any){
    this.imageFormat = `format=${event.target.value}`;
  }

  setImageSizeFromScreenSize(){
    const width = window.screen.width * window.devicePixelRatio;
    const height = window.screen.height * window.devicePixelRatio;

    (document.getElementById("txt_width") as HTMLInputElement).value = width.toString();
    (document.getElementById("txt_height") as HTMLInputElement).value = height.toString();
  }

  setImageSize(){
    const width = (document.getElementById("txt_width") as HTMLInputElement).value;
    const height = (document.getElementById("txt_height") as HTMLInputElement).value;
    if(width != "0" && width != ""){
      this.imageSize += `&w=${width}`;
    }
    if(height != "0" && height != ""){
      this.imageSize += `&h=${height}`;
    }
  }

  clearLists(){
    this.autoSuggestList = [];
    this.imagesXbox = [];
    this.imagesPlayStation = [];
    this.imagesPlayStationScreenshots = [];
  }

  openInNewTab(indexPosition: number, list: GalleryItem[]){
    const imageUrl = list[indexPosition].data?.src || list[indexPosition].data?.thumb || '';
    if (imageUrl) {
      window.open(imageUrl.toString(), '_blank');
    }
  }

  switchChange(event: any){
    if(event.target.checked){
      this.galleryXbox.push(...this.imagesXboxScreenshots.map((m:any) => new ImageItem({ src: m, thumb: m })));
      this.galleryPlayStation.push(...this.imagesPlayStationScreenshots.map((m:any) => new ImageItem({ src: m, thumb: m })));
    }
    else{
      this.galleryXbox = this.galleryXbox.filter(f => {
        if (typeof f.data?.src !== 'string') return false; // ignora se não for string
        return !this.imagesXboxScreenshots.includes(f.data?.src);
      });

      this.galleryPlayStation = this.galleryPlayStation.filter(f => {
        if (typeof f.data?.src !== 'string') return false; // ignora se não for string
        return !this.imagesPlayStationScreenshots.includes(f.data?.src);
      });
    }
  }
}

