// V2 Code Generator for ZeppOS Watch Faces (Balance 2 & Legacy Devices)
// Generates v2 manifest structure with flat organization
// Compatible with Amazfit Balance 2, Balance, Active Max (older Zepp OS)

import type { WatchFaceConfig, WatchFaceElement, GeneratedCode } from '@/types';

export function generateWatchFaceCodeV2(config: WatchFaceConfig): GeneratedCode {
  console.log('[JSGenV2] Starting v2 code generation for:', config.name);
  try {
    const appJson = generateAppJsonV2(config);
    console.log('[JSGenV2] app.json v2 generated, length:', appJson.length);
    
    const appJs = generateAppJsV2(config);
    console.log('[JSGenV2] app.js v2 generated, length:', appJs.length);
    
    const watchfaceIndexJs = generateWatchfaceIndexJsV2(config);
    console.log('[JSGenV2] watchface/index.js v2 generated, length:', watchfaceIndexJs.length);
    
    return { appJson, appJs, watchfaceIndexJs };
  } catch (error) {
    console.error('[JSGenV2] Error generating code:', error);
    throw error;
  }
}

// Generate app.json - V2 format (EXACTLY matching reference structure)
function generateAppJsonV2(config: WatchFaceConfig): string {
  const appId = generateAppId();
  const deviceSources = getDeviceSourcesV2(config.watchModel);
  const versionCode = Math.floor(Date.now() / 1000);
  
  // Build JSON as plain object with exact structure from reference
  const json: any = {
    configVersion: 'v2',
    app: {
      appIdType: 0,
      appId: appId,
      appName: config.name,
      appType: 'watchface',
      version: {
        code: versionCode,
        name: '1.0.1',
      },
      vender: 'zepp',
      description: '',
      icon: 'anteprima.png',
      cover: ['anteprima.png'],
      extraInfo: {
        madeBy: 1,
        fromZoom: false,
      },
    },
    permissions: ['gps'],
    runtime: {
      apiVersion: {
        compatible: '1.0.0',
        target: '1.0.1',
        minVersion: '1.0.0',
      },
    },
    i18n: {
      enUS: {
        icon: 'anteprima.png',
        appName: config.name,
      },
    },
    defaultLanguage: 'en-US',
    debug: false,
    module: {
      watchface: {
        path: 'watchface/index',
        main: 1,
        editable: 0,
        lockscreen: 1,
        hightCost: 0,
      },
    },
    platforms: deviceSources.map((source) => ({
      name: 'Amazfit Balance',  // EXACT name from reference
      deviceSource: source,
    })),
    designWidth: config.resolution.width,
    packageInfo: {
      mode: 'production',
      timeStamp: versionCode,
      expiredTime: 172800,
      zpm: '2.8.2',
    },
  };

  return JSON.stringify(json, null, 2);
}

// Get device sources for v2 (Balance 2 & related models)
function getDeviceSourcesV2(watchModel: string): number[] {
  const sources: Record<string, number[]> = {
    'Balance 2': [8519936, 8519937, 8519939],
    'Balance': [8519936, 8519937, 8519939],
    'Active Max': [8519936, 8519937, 8519939],
  };
  
  return sources[watchModel] || [8519936, 8519937, 8519939];
}

// Generate app.js - V2 format (minimal, from brushed_steel reference)
function generateAppJsV2(config: WatchFaceConfig): string {
  return `try {
    (() => {
        const __$$app$$__ = __$$hmAppManager$$__.currentApp;
        function getApp() {
            return __$$app$$__.app;
        }
        function getCurrentPage() {
            return __$$app$$__.current && __$$app$$__.current.module;
        }
        __$$app$$__.__globals__ = {
            lang: new DeviceRuntimeCore.HmUtils.Lang(DeviceRuntimeCore.HmUtils.getLanguage()),
            px: DeviceRuntimeCore.HmUtils.getPx(${config.resolution.width})
        };
        const {px} = __$$app$$__.__globals__;
        const languageTable = {};
        __$$app$$__.__globals__.gettext = DeviceRuntimeCore.HmUtils.gettextFactory(languageTable, __$$app$$__.__globals__.lang, 'en-US');
        function getGlobal() {
            if (typeof self !== 'undefined') {
                return self;
            }
            if (typeof window !== 'undefined') {
                return window;
            }
            if (typeof global !== 'undefined') {
                return global;
            }
            if (typeof globalThis !== 'undefined') {
                return globalThis;
            }
            throw new Error('unable to locate global object');
        }
        let globalNS$2 = getGlobal();
        if (!globalNS$2.Logger) {
            if (typeof DeviceRuntimeCore !== 'undefined') {
                globalNS$2.Logger = DeviceRuntimeCore.HmLogger;
            }
        }
        let globalNS$1 = getGlobal();
        if (!globalNS$1.Buffer) {
            if (typeof Buffer !== 'undefined') {
                globalNS$1.Buffer = Buffer;
            } else {
                globalNS$1.Buffer = DeviceRuntimeCore.Buffer;
            }
        }
        function isHmTimerDefined() {
            return typeof timer !== 'undefined';
        }
        let globalNS = getGlobal();
        if (typeof setTimeout === 'undefined' && isHmTimerDefined()) {
            globalNS.setTimeout = timer.setTimeout;
        }
        if (typeof setInterval === 'undefined' && isHmTimerDefined()) {
            globalNS.setInterval = timer.setInterval;
        }
        if (typeof clearTimeout === 'undefined' && isHmTimerDefined()) {
            globalNS.clearTimeout = timer.clearTimeout;
        }
        if (typeof clearInterval === 'undefined' && isHmTimerDefined()) {
            globalNS.clearInterval = timer.clearInterval;
        }
        let __$$module$$__ = __$$app$$__.current;
    })();
} catch (e) {
    console.log(e);
}`;
}

// Generate watchface/index.js - V2 format (NO px() wrapping, device-native widgets)
function generateWatchfaceIndexJsV2(config: WatchFaceConfig): string {
  const elements = config.elements.filter((el) => el.visible);
  
  let widgetsCode = '';
  let widgetCounter = 6;
  
  for (const element of elements) {
    const code = generateWidgetCodeV2(element, widgetCounter);
    if (code) {
      widgetsCode += code;
      widgetCounter++;
    }
  }
  
  // Get background image from config or use basic color fallback
  const backgroundSrc = config.background?.src || 'background.png';
  
  const finalCode = `// Zepp OS Watchface generated by AI WatchFace Creator (V2 Format)
// V2 Manifest: Flat structure, device-native widgets
// Compatible with Amazfit Balance 2, Balance, Active Max
try {
    (() => {
        const __$$app$$__ = __$$hmAppManager$$__.currentApp;
        function getApp() {
            return __$$app$$__.app;
        }
        function getCurrentPage() {
            return __$$app$$__.current && __$$app$$__.current.module;
        }
        const __$$module$$__ = __$$app$$__.current;
        const h = new DeviceRuntimeCore.WidgetFactory(new DeviceRuntimeCore.HmDomApi(__$$app$$__, __$$module$$__));
        const logger = Logger.getLogger('WatchFaceEditor');

        __$$module$$__.module = DeviceRuntimeCore.WatchFace({
            init_view() {
                // Background image - Fill entire screen (NO px() wrapping)
                let widget_1 = hmUI.createWidget(hmUI.widget.IMG, {
                    x: 0,
                    y: 0,
                    w: ${config.resolution.width},
                    h: ${config.resolution.height},
                    src: '${backgroundSrc}',
                    alpha: 255,
                    show_level: hmUI.show_level.ONLY_NORMAL
                });

${widgetsCode}

                // Widget delegate for lifecycle management
                const widgetDelegate = hmUI.createWidget(hmUI.widget.WIDGET_DELEGATE, {
                    resume_call() {
                        logger.log('watchface resumed');
                    },
                    pause_call() {
                        logger.log('watchface paused');
                    }
                });
            },
            onInit() {
                logger.log('Watchface initialized');
            },
            build() {
                this.init_view();
                logger.log('Watchface built and displayed');
            },
            onDestroy() {
                logger.log('Watchface destroyed, cleaning up');
            }
        });
    })();
} catch (e) {
    console.log('Watchface Error', e);
    e && e.stack && e.stack.split(/\\n/).forEach(i => console.log('error stack', i));
}`;
  
  return finalCode;
}

// Generate widget code for each element (V2 format)
function generateWidgetCodeV2(element: WatchFaceElement, widgetIndex: number): string {
  // Only handle IMG elements with actual sources
  if (element.type === 'IMG' && element.src) {
    return `
                // ${element.name}
                let widget_${widgetIndex} = hmUI.createWidget(hmUI.widget.IMG, {
                    x: ${element.bounds.x},
                    y: ${element.bounds.y},
                    w: ${element.bounds.width},
                    h: ${element.bounds.height},
                    src: '${element.src}',
                    alpha: 255,
                    show_level: hmUI.show_level.ONLY_NORMAL
                });`;
  }
  
  return ''; // Skip other types for v2 (they require special image arrays we don't have)
}

// Generate unique app ID
function generateAppId(): number {
  return Math.floor(Math.random() * (9999999 - 1000000 + 1)) + 1000000;
}
