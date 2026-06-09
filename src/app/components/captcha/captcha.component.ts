import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnInit,
  OnDestroy,
  ElementRef,
  ViewChild,
  AfterViewInit,
  NgZone,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { environment } from '../../../environments/environment';

declare global {
  interface Window {
    hcaptcha: {
      render: (container: string | HTMLElement, params: object) => string;
      reset: (widgetId?: string) => void;
      getResponse: (widgetId?: string) => string;
      execute: (widgetId?: string) => void;
    };
    onHcaptchaLoaded?: () => void;
  }
}

@Component({
  selector: 'app-captcha',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './captcha.component.html',
  styleUrls: ['./captcha.component.scss'],
})
export class CaptchaComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() theme: 'light' | 'dark' = 'light';
  @Input() showError = false;
  @Output() tokenChange = new EventEmitter<string | null>();
  @Output() tokenResolved = new EventEmitter<string | null>();

  @ViewChild('captchaContainer') captchaContainer!: ElementRef<HTMLDivElement>;

  private widgetId: string | null = null;
  private scriptId = 'hcaptcha-script';
  private viewReady = false;
  private scriptReady = false;

  constructor(private zone: NgZone) {}

  ngOnInit(): void {
    this.loadHcaptchaScript();
  }

  ngAfterViewInit(): void {
    this.viewReady = true;
    console.log(
      '[hCaptcha] ngAfterViewInit — viewReady=true, scriptReady=',
      this.scriptReady,
    );
    if (this.scriptReady) {
      this.renderWidget();
    }
  }

  private loadHcaptchaScript(): void {
    if (window.hcaptcha) {
      console.log('[hCaptcha] API déjà disponible');
      this.scriptReady = true;
      if (this.viewReady) {
        this.renderWidget();
      }
      return;
    }

    if (document.getElementById(this.scriptId)) {
      console.log('[hCaptcha] Script déjà dans le DOM, en attente du callback');
      window.onHcaptchaLoaded = () => {
        console.log('[hCaptcha] onHcaptchaLoaded (script existant)');
        this.scriptReady = true;
        if (this.viewReady) {
          this.renderWidget();
        }
      };
      return;
    }

    console.log('[hCaptcha] Injection du script');
    window.onHcaptchaLoaded = () => {
      console.log('[hCaptcha] onHcaptchaLoaded (nouveau script)');
      this.scriptReady = true;
      if (this.viewReady) {
        this.renderWidget();
      }
    };

    const script = document.createElement('script');
    script.id = this.scriptId;
    script.src =
      'https://js.hcaptcha.com/1/api.js?onload=onHcaptchaLoaded&render=explicit';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  }

  private renderWidget(): void {
    console.log('[hCaptcha] renderWidget —', {
      container: !!this.captchaContainer?.nativeElement,
      hcaptcha: !!window.hcaptcha,
      siteKey: environment.hcaptchaSiteKey,
      widgetId: this.widgetId,
    });

    if (!this.captchaContainer?.nativeElement || !window.hcaptcha) {
      console.warn(
        '[hCaptcha] renderWidget annulé — container ou API manquant',
      );
      return;
    }

    if (this.widgetId !== null) {
      console.log('[hCaptcha] Widget déjà rendu, skip');
      return;
    }

    try {
      this.widgetId = window.hcaptcha.render(
        this.captchaContainer.nativeElement,
        {
          sitekey: environment.hcaptchaSiteKey,
          theme: this.theme,
          callback: (token: string) => this.onResolved(token),
          'expired-callback': () => this.onExpired(),
          'error-callback': () => this.onWidgetError(),
        },
      );
      console.log('[hCaptcha] Widget rendu, widgetId=', this.widgetId);
    } catch (e) {
      console.error('[hCaptcha] Erreur render:', e);
    }
  }

  onResolved(token: string): void {
    this.zone.run(() => {
      this.showError = false;
      this.tokenChange.emit(token);
      this.tokenResolved.emit(token);
    });
  }

  onExpired(): void {
    this.zone.run(() => {
      this.showError = false;
      this.tokenChange.emit(null);
      this.tokenResolved.emit(null);
    });
  }

  onWidgetError(): void {
    this.zone.run(() => {
      this.showError = true;
      this.tokenChange.emit(null);
      this.tokenResolved.emit(null);
    });
  }

  reset(): void {
    if (window.hcaptcha && this.widgetId !== null) {
      window.hcaptcha.reset(this.widgetId);
      this.tokenChange.emit(null);
      this.tokenResolved.emit(null);
      this.showError = false;
    }
  }

  ngOnDestroy(): void {
    if (window.onHcaptchaLoaded) {
      delete window.onHcaptchaLoaded;
    }
  }
}
