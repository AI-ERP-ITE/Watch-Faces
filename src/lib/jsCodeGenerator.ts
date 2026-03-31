// JavaScript Code Generator for ZeppOS Watch Faces
// Based on working ZPK structure from Brushed_Steel_Petroleum.zpk

import type { WatchFaceConfig, WatchFaceElement, GeneratedCode } from '@/types';

export function generateWatchFaceCode(config: WatchFaceConfig): GeneratedCode {
  console.log('[JSGen] Starting code generation for:', config.name);
  try {
    const appJson = generateAppJson(config);
    console.log('[JSGen] app.json generated, length:', appJson.length);
    
    const appJs = generateAppJs(config);
    console.log('[JSGen] app.js generated, length:', appJs.length);
    
    const watchfaceIndexJs = generateWatchfaceIndexJs(config);
    console.log('[JSGen] watchface/index.js generated, length:', watchfaceIndexJs.length);
    
    return { appJson, appJs, watchfaceIndexJs };
  } catch (error) {
    console.error('[JSGen] Error generating code:', error);
    throw error;
  }
}

// Generate app.json - Matching working ZPK structure exactly
function generateAppJson(config: WatchFaceConfig): string {
  const appId = generateAppId();
  
  // Get device source for the watch model
  const deviceSources = getDeviceSources(config.watchModel);
  
  const json = {
    configVersion: 'v2',
    app: {
      appIdType: 0,
      appId: appId,
      appName: config.name,
      appType: 'watchface',
      version: {
        code: 1,
        name: '1.0.0',
      },
      vender: 'AI-WatchFace-Creator',
      description: `Custom watch face - ${config.name}`,
      icon: 'assets/bg.png',
      cover: ['assets/bg.png'],
    },
    permissions: [],
    runtime: {
      apiVersion: {
        compatible: '1.0.0',
        target: '1.0.1',
        minVersion: '1.0.0',
      },
    },
    i18n: {
      'en-US': {
        icon: 'assets/bg.png',
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
      name: config.watchModel,
      deviceSource: source,
    })),
    designWidth: config.resolution.width,
    packageInfo: {
      mode: 'production',
      timeStamp: Math.floor(Date.now() / 1000),
      expiredTime: 172800,
      zpm: '2.8.2',
    },
  };

  return JSON.stringify(json, null, 2);
}

// Get device sources for different watch models
function getDeviceSources(watchModel: string): number[] {
  const sources: Record<string, number[]> = {
    'Balance 2': [8519936, 8519937, 8519939],
    'Balance': [8519936, 8519937, 8519939],
    'Active Max': [8519936, 8519937, 8519939],
    'Active 3 Premium': [8388608, 8388609],
    'Active 2 Round': [8388608, 8388609],
    'Active 2 Square': [8388610, 8388611],
    'Active': [8388608, 8388609],
    'Pop 3S (PIB)': [8388608, 8388609],
    'GTR4': [8388608, 8388609],
    'GTS4': [8388610, 8388611],
    'Cheetah Pro': [8388608, 8388609],
    'T-Rex 2': [8388608, 8388609],
    'Falcon': [8388608, 8388609],
  };
  
  return sources[watchModel] || [8519936, 8519937, 8519939];
}

// Generate app.js - Matching working ZPK structure (comes from Brushed_Steel_Petroleum)
function generateAppJs(config: WatchFaceConfig): string {
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

// Generate watchface/index.js - Matching working ZPK structure from Brushed_Steel_Petroleum
function generateWatchfaceIndexJs(config: WatchFaceConfig): string {
  const elements = config.elements.filter((el) => el.visible);
  
  let widgetsCode = '';
  
  for (const element of elements) {
    const code = generateWidgetCode(element);
    widgetsCode += code;
    console.log('[JSGen] Widget code for', element.name, ':\n', code);
  }
  
  const finalCode = `// Zepp OS Watchface generated by AI WatchFace Creator
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
        const {px} = __$$app$$__.__globals__;
        const logger = Logger.getLogger('WatchFaceEditor');

        __$$module$$__.module = DeviceRuntimeCore.WatchFace({
            init_view() {
                // Background image - Fill entire screen
                hmUI.createWidget(hmUI.widget.IMG, {
                    x: px(0),
                    y: px(0),
                    w: px(${config.resolution.width}),
                    h: px(${config.resolution.height}),
                    src: 'bg.png',
                    alpha: 255,
                    show_level: hmUI.show_level.ONLY_NORMAL
                });
                
                // Widgets
${widgetsCode}
                
                // Widget delegate for lifecycle management
                const widgetDelegate = hmUI.createWidget(hmUI.widget.WIDGET_DELEGATE, {
                    resume_call() {
                        logger.log('resume_call()');
                    },
                    pause_call() {
                        logger.log('pause_call()');
                    }
                });
            },
            onInit() {
                logger.log('Watchface initialized');
            },
            build() {
                this.init_view();
                logger.log('Watchface built');
            },
            onDestroy() {
                logger.log('Watchface destroyed');
            }
        });
    })();
} catch (e) {
    console.log('Watchface Error', e);
    e && e.stack && e.stack.split(/\\n/).forEach(i => console.log('error stack', i));
}`;
  
  console.log('[JSGen] Complete watchface/index.js:\n', finalCode);
  return finalCode;
}

// Generate widget code for each element
function generateWidgetCode(element: WatchFaceElement): string {
  switch (element.type) {
    case 'TIME_POINTER':
      return generateTimePointerWidget(element);
    case 'IMG_LEVEL':
      return generateImgLevelWidget(element);
    case 'TEXT':
      return generateTextWidget(element);
    case 'IMG':
      return generateImgWidget(element);
    default:
      return generateImgWidget(element);
  }
}

// TIME_POINTER - Use actual image pointer files instead of digit arrays (fixes black screen)
function generateTimePointerWidget(element: WatchFaceElement): string {
  // Check if we have an actual image file for this element
  const imageFile = element.src ? `'${element.src}'` : `'hour_hand.png'`;
  
  return `
                // ${element.name} - Time Pointer
                hmUI.createWidget(hmUI.widget.TIME_POINTER, {
                    hour: {
                        centerX: px(${element.bounds.x + Math.floor(element.bounds.width / 2)}),
                        centerY: px(${element.bounds.y + Math.floor(element.bounds.height / 2)}),
                        posX: px(${element.bounds.x}),
                        posY: px(${element.bounds.y}),
                        path: ${imageFile},
                    },
                });`;
}

// IMG_LEVEL - Battery/Steps/Level indicators (simplified to avoid missing asset files)
function generateImgLevelWidget(element: WatchFaceElement): string {
  // Use a simple ARC display instead of IMG_LEVEL which requires multiple image files
  const dataType = getDataTypeConstant(element.dataType || 'BATTERY');

  return `
                // ${element.name} - Level Indicator
                hmUI.createWidget(hmUI.widget.ARC, {
                    x: px(${element.bounds.x}),
                    y: px(${element.bounds.y}),
                    w: px(${element.bounds.width}),
                    h: px(${element.bounds.height}),
                    start_angle: 0,
                    end_angle: 360,
                    color: 0x00FF00,
                    type: ${dataType},
                });`;
}

// TEXT - Text display
function generateTextWidget(element: WatchFaceElement): string {
  const dataType = element.dataType ? getDataTypeConstant(element.dataType) : 'hmUI.data_type.DATE';

  return `
                // ${element.name}
                hmUI.createWidget(hmUI.widget.TEXT, {
                    x: px(${element.bounds.x}),
                    y: px(${element.bounds.y}),
                    w: px(${element.bounds.width}),
                    h: px(${element.bounds.height}),
                    color: ${element.color ? `0x${element.color.replace('#', '')}FF` : '0xFFFFFFFF'},
                    text_size: px(${element.fontSize || 20}),
                    text: '',
                    type: ${dataType},
                    show_level: hmUI.show_level.ONLY_NORMAL
                });`;
}

// IMG - Static image
function generateImgWidget(element: WatchFaceElement): string {
  const src = element.src || element.images?.[0] || 'assets/bg.png';
  // Simple: just use the filename as-is
  const srcPath = src;
  
  return `
                // ${element.name}
                hmUI.createWidget(hmUI.widget.IMG, {
                    x: px(${element.bounds.x}),
                    y: px(${element.bounds.y}),
                    w: px(${element.bounds.width}),
                    h: px(${element.bounds.height}),
                    src: '${srcPath}',
                    alpha: 255,
                    show_level: hmUI.show_level.ONLY_NORMAL
                });`;
}

// Map data type strings to ZeppOS constants
function getDataTypeConstant(dataType: string): string {
  const typeMap: Record<string, string> = {
    BATTERY: 'hmUI.data_type.BATTERY',
    STEP: 'hmUI.data_type.STEP',
    STEP_TARGET: 'hmUI.data_type.STEP_TARGET',
    CALORIE: 'hmUI.data_type.CALORIE',
    CALORIE_TARGET: 'hmUI.data_type.CALORIE_TARGET',
    HEART: 'hmUI.data_type.HEART',
    PAI: 'hmUI.data_type.PAI',
    STAND: 'hmUI.data_type.STAND',
    STAND_TARGET: 'hmUI.data_type.STAND_TARGET',
    FAT_BURN: 'hmUI.data_type.FAT_BURN',
    WEATHER: 'hmUI.data_type.WEATHER',
    UVI: 'hmUI.data_type.UVI',
    AQI: 'hmUI.data_type.AQI',
    HUMIDITY: 'hmUI.data_type.HUMIDITY',
    SUN_RISE: 'hmUI.data_type.SUN_RISE',
    SUN_SET: 'hmUI.data_type.SUN_SET',
    WIND: 'hmUI.data_type.WIND',
    WIND_DIRECTION: 'hmUI.data_type.WIND_DIRECTION',
    ALARM: 'hmUI.data_type.ALARM',
    SLEEP: 'hmUI.data_type.SLEEP',
    SPO2: 'hmUI.data_type.SPO2',
    STRESS: 'hmUI.data_type.STRESS',
    NOTIFICATION: 'hmUI.data_type.NOTIFICATION',
    DISTANCE: 'hmUI.data_type.DISTANCE',
    DATE: 'hmUI.data_type.DATE',
    WEEK: 'hmUI.data_type.WEEK',
    MOON: 'hmUI.data_type.MOON',
  };

  return typeMap[dataType] || 'hmUI.data_type.BATTERY';
}

// Generate unique app ID
function generateAppId(): number {
  return Math.floor(1000000 + Math.random() * 9000000);
}
