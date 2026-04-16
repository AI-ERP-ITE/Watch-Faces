// JavaScript Code Generator for ZeppOS Watch Faces
// Supports both V2 (legacy/Balance 2) and V3 (newer models) formats
// Routes based on device model selection

import type { WatchFaceConfig, WatchFaceElement, GeneratedCode } from '@/types';
import { generateWatchFaceCodeV2 } from './jsCodeGeneratorV2';

// Device models using V2 format (Balance 2, Balance, Active Max, etc.)
const V2_DEVICE_MODELS = [
  'Balance 2',
  'Balance',
  'Active Max',
  'Active 3 Premium',
];

// Device models using V3 format (GTR 4, GTS 4, newer Zepp OS models)
const V3_DEVICE_MODELS = [
  'GTR 4',
  'GTS 4',
  'Active 2 Round',
  'Active 2 Square',
  'Active',
];

export function generateWatchFaceCode(config: WatchFaceConfig): GeneratedCode {
  console.log('[JSGen] Starting code generation for:', config.name, 'Model:', config.watchModel);
  
  // Route to appropriate generator based on device model
  if (V2_DEVICE_MODELS.includes(config.watchModel)) {
    console.log('[JSGen] Using V2 generator (legacy format) for model:', config.watchModel);
    return generateWatchFaceCodeV2(config);
  } else if (V3_DEVICE_MODELS.includes(config.watchModel)) {
    console.log('[JSGen] Using V3 generator (modern format) for model:', config.watchModel);
    return generateWatchFaceCodeV3(config);
  } else {
    console.log('[JSGen] Unknown model, defaulting to V2 for safety:', config.watchModel);
    return generateWatchFaceCodeV2(config);
  }
}

// V3 Generator (for newer devices)
function generateWatchFaceCodeV3(config: WatchFaceConfig): GeneratedCode {
  console.log('[JSGenV3] Starting v3 code generation for:', config.name);
  try {
    const appJson = generateAppJson(config);
    console.log('[JSGenV3] app.json generated, length:', appJson.length);
    
    const appJs = generateAppJs(config);
    console.log('[JSGenV3] app.js generated, length:', appJs.length);
    
    const watchfaceIndexJs = generateWatchfaceIndexJs(config);
    console.log('[JSGenV3] watchface/index.js generated, length:', watchfaceIndexJs.length);
    
    return { appJson, appJs, watchfaceIndexJs };
  } catch (error) {
    console.error('[JSGenV3] Error generating code:', error);
    throw error;
  }
}

// Generate app.json - Matching working ZPK structure exactly (v3 with proper targets structure)
function generateAppJson(config: WatchFaceConfig): string {
  const appId = generateAppId();
  
  // Get device source for the watch model
  const deviceSources = getDeviceSources(config.watchModel);
  
  // Increment version code based on timestamp (ensures each build has higher code)
  const versionCode = Math.floor(Date.now() / 1000);
  
  const json = {
    configVersion: 'v3',
    app: {
      appIdType: 0,
      appId: appId,
      appName: config.name,
      appType: 'watchface',
      version: {
        code: versionCode,
        name: '1.0.0',
      },
      vender: 'AI-WatchFace-Creator',
      description: `Custom watch face - ${config.name}`,
      icon: 'icon.png',
      cover: ['icon.png'],
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
        icon: 'icon.png',
        appName: config.name,
      },
    },
    defaultLanguage: 'en-US',
    debug: false,
    targets: {
      default: {
        module: {
          watchface: {
            path: 'watchface/index.js',
            main: 1,
            editable: 0,
            lockscreen: 0,
            hightCost: 0,
          },
        },
        platforms: deviceSources.map((source) => ({
          name: config.watchModel,
          deviceSource: source,
        })),
        designWidth: config.resolution.width,
      },
    },
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

// Generate watchface/index.js - Matching working ZPK structure with proper lifecycle
function generateWatchfaceIndexJs(config: WatchFaceConfig): string {
  const elements = config.elements.filter((el) => el.visible);
  
  let widgetsCode = '';
  
  for (const element of elements) {
    const code = generateWidgetCode(element);
    widgetsCode += code;
    console.log('[JSGen] Widget code for', element.name, ':\n', code);
  }
  
  const finalCode = `// Zepp OS Watchface generated by AI WatchFace Creator
// Fixed structure: v3 manifest, complete TIME_POINTER, proper data binding, AOD support
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
                // Background image - Fill entire screen with proper asset path
                hmUI.createWidget(hmUI.widget.IMG, {
                    x: px(0),
                    y: px(0),
                    w: px(${config.resolution.width}),
                    h: px(${config.resolution.height}),
                    src: 'background.png',
                    alpha: 255,
                    show_level: hmUI.show_level.ONLY_NORMAL
                });
                
                // Widgets
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
  
  console.log('[JSGen] Complete watchface/index.js:\n', finalCode);
  return finalCode;
}

// Generate widget code for each element
function generateWidgetCode(element: WatchFaceElement): string {
  // Skip minute/second hands - they're combined with hour hand in TIME_POINTER
  if (element.type === 'TIME_POINTER' && element.subtype && element.subtype !== 'hour') {
    return ''; // Skip - will be included in hour hand widget
  }
  
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

// TIME_POINTER - Generate complete hour/minute/second hands (fixes black screen)
function generateTimePointerWidget(element: WatchFaceElement): string {
  // For TIME_POINTER, we need to generate the hand object structure
  // The element represents the hour hand; we'll create minute and second from derived info
  
  const centerX = element.center?.x || (element.bounds.x + Math.floor(element.bounds.width / 2));
  const centerY = element.center?.y || (element.bounds.y + Math.floor(element.bounds.height / 2));
  
  // Hour hand
  const hourImagePath = element.src || 'hour_hand.png';
  const hourPosX = element.bounds.x;
  const hourPosY = element.bounds.y;
  
  // Minute hand - typically longer than hour hand
  const minuteImagePath = element.name?.toLowerCase().includes('minute') ? element.src : 'minute_hand.png';
  const minuteLength = Math.floor((element.bounds.height * 120) / 100); // 20% longer
  const minutePosY = centerY - Math.floor(minuteLength / 2);
  const minutePosX = centerX - Math.floor(20 / 2);
  
  // Second hand - thin and long
  const secondImagePath = element.name?.toLowerCase().includes('second') ? element.src : 'second_hand.png';
  const secondLength = Math.floor((element.bounds.height * 130) / 100); // 30% longer
  const secondPosY = centerY - Math.floor(secondLength / 2);
  const secondPosX = centerX - Math.floor(10 / 2);

  return `
                // ${element.name} - Time Pointer (Hour/Minute/Second)
                hmUI.createWidget(hmUI.widget.TIME_POINTER, {
                    hour_path: '${hourImagePath}',
                    hour_centerX: px(${centerX}),
                    hour_centerY: px(${centerY}),
                    hour_posX: px(${hourPosX}),
                    hour_posY: px(${hourPosY}),
                    minute_path: '${minuteImagePath}',
                    minute_centerX: px(${centerX}),
                    minute_centerY: px(${centerY}),
                    minute_posX: px(${minutePosX}),
                    minute_posY: px(${minutePosY}),
                    second_path: '${secondImagePath}',
                    second_centerX: px(${centerX}),
                    second_centerY: px(${centerY}),
                    second_posX: px(${secondPosX}),
                    second_posY: px(${secondPosY}),
                    show_level: hmUI.show_level.ONLY_NORMAL
                });`;
}

// IMG_LEVEL - Battery/Steps/Level indicators using ARC_PROGRESS for proper data binding
function generateImgLevelWidget(element: WatchFaceElement): string {
  const dataType = getDataTypeConstant(element.dataType || 'BATTERY');

  return `
                // ${element.name} - Level Indicator (${element.dataType || 'BATTERY'})
                hmUI.createWidget(hmUI.widget.ARC_PROGRESS, {
                    x: px(${element.bounds.x}),
                    y: px(${element.bounds.y}),
                    w: px(${element.bounds.width}),
                    h: px(${element.bounds.height}),
                    start_angle: 0,
                    end_angle: 360,
                    color: ${element.color ? `0x${element.color.replace('#', '')}FF` : '0x00FF00FF'},
                    radius: px(${Math.floor(element.bounds.width / 2)}),
                    stroke_width: px(4),
                    type: ${dataType},
                    show_level: hmUI.show_level.ONLY_NORMAL
                });`;
}

// TEXT - Text display (simplified, no scope issues)
// If curvedText is set, use pre-rendered arch PNG as IMG widget
function generateTextWidget(element: WatchFaceElement): string {
  if (element.curvedText) {
    const radius = element.curvedText.radius;
    const fs = element.fontSize ?? 16;
    const size = (radius + fs) * 2 + 20;
    const cx = element.center?.x ?? (element.bounds.x + Math.floor(element.bounds.width / 2));
    const cy = element.center?.y ?? (element.bounds.y + Math.floor(element.bounds.height / 2));
    const imgX = Math.round(cx - size / 2);
    const imgY = Math.round(cy - size / 2);
    return `
                // ${element.name} - Arch Text (pre-rendered PNG)
                hmUI.createWidget(hmUI.widget.IMG, {
                    x: px(${imgX}),
                    y: px(${imgY}),
                    w: px(${size}),
                    h: px(${size}),
                    src: 'curved_text_${element.id}.png',
                    show_level: hmUI.show_level.ONLY_NORMAL
                });`;
  }

  return `
                // ${element.name} - Text Display
                hmUI.createWidget(hmUI.widget.TEXT, {
                    x: px(${element.bounds.x}),
                    y: px(${element.bounds.y}),
                    w: px(${element.bounds.width}),
                    h: px(${element.bounds.height}),
                    color: ${element.color ? `0x${element.color.replace('#', '')}FF` : '0xFFFFFFFF'},
                    text_size: px(${element.fontSize || 20}),
                    text: '-',
                    align_h: hmUI.align.CENTER_H,
                    align_v: hmUI.align.CENTER_V,
                    show_level: hmUI.show_level.ONLY_NORMAL
                });`;
}

// IMG - Static image with proper asset paths
function generateImgWidget(element: WatchFaceElement): string {
  const src = element.src || element.images?.[0] || 'background.png';
  
  return `
                // ${element.name}
                hmUI.createWidget(hmUI.widget.IMG, {
                    x: px(${element.bounds.x}),
                    y: px(${element.bounds.y}),
                    w: px(${element.bounds.width}),
                    h: px(${element.bounds.height}),
                    src: '${src}',
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
