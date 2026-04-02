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

// Generate watchface/index.js - V2 format with IMG_TIME, IMG_DATE, IMG_WEEK, and AOD mode
function generateWatchfaceIndexJsV2(config: WatchFaceConfig): string {
  const elements = config.elements.filter((el) => el.visible);
  
  console.log('[JSGenV2] Total elements in config:', config.elements.length);
  console.log('[JSGenV2] Visible elements after filter:', elements.length);
  
  const backgroundSrc = config.background?.src || 'background.png';
  
  // Generate NORMAL mode widgets
  let normalWidgetsCode = '';
  let normalWidgetCounter = 2;
  const timeElement = elements.find(e => e.name.toLowerCase().includes('time'));
  const dateElement = elements.find(e => e.name.toLowerCase().includes('date'));
  const weekElement = elements.find(e => e.name.toLowerCase().includes('week'));
  
  // Add IMG_TIME widget if time element exists
  if (timeElement) {
    normalWidgetsCode += generateIMGTimeWidget(timeElement, normalWidgetCounter++, 'ONLY_NORMAL');
  }
  
  // Add IMG_DATE widget if date element exists
  if (dateElement) {
    normalWidgetsCode += generateIMGDateWidget(dateElement, normalWidgetCounter++, 'ONLY_NORMAL');
  }
  
  // Add IMG_WEEK widget if week element exists
  if (weekElement) {
    normalWidgetsCode += generateIMGWeekWidget(weekElement, normalWidgetCounter++, 'ONLY_NORMAL');
  }
  
  // Add other static elements for NORMAL mode
  for (const element of elements) {
    if (element.name.toLowerCase().includes('time') || element.name.toLowerCase().includes('date') || element.name.toLowerCase().includes('week')) {
      continue; // Skip, already handled above
    }
    const code = generateWidgetCodeV2(element, normalWidgetCounter);
    if (code) {
      normalWidgetsCode += code;
      normalWidgetCounter++;
    }
  }
  
  // Generate AOD mode widgets (complete duplicate for always-on display)
  let aodWidgetsCode = '';
  let aodWidgetCounter = 100;
  
  if (timeElement) {
    aodWidgetsCode += generateIMGTimeWidget(timeElement, aodWidgetCounter++, 'ONLY_AOD');
  }
  
  if (dateElement) {
    aodWidgetsCode += generateIMGDateWidget(dateElement, aodWidgetCounter++, 'ONLY_AOD');
  }
  
  if (weekElement) {
    aodWidgetsCode += generateIMGWeekWidget(weekElement, aodWidgetCounter++, 'ONLY_AOD');
  }
  
  // Add other static elements for AOD mode
  for (const element of elements) {
    if (element.name.toLowerCase().includes('time') || element.name.toLowerCase().includes('date') || element.name.toLowerCase().includes('week')) {
      continue;
    }
    const code = generateWidgetCodeV2(element, aodWidgetCounter, true);
    if (code) {
      aodWidgetsCode += code;
      aodWidgetCounter++;
    }
  }
  
  const finalCode = `// Zepp OS Watchface generated by AI WatchFace Creator (V2 Format)
// V2 Manifest: Full A OD support with dynamic widgets
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
        const {px} = __$$app$$__.__globals__;
        const logger = Logger.getLogger('WatchFaceEditor');
        
        // Sensor for weather and system info
        let weatherSensor = null;

        __$$module$$__.module = DeviceRuntimeCore.WatchFace({
            init_view() {
                // Initialize sensors
                try {
                    weatherSensor = hmSensor.createSensor(hmSensor.id.WEATHER);
                } catch (e) {
                    logger.log('Weather sensor init failed:', e);
                }
                
                // ========== NORMAL MODE BACKGROUND ==========
                let widget_1 = hmUI.createWidget(hmUI.widget.IMG, {
                    x: 0,
                    y: 0,
                    w: ${config.resolution.width},
                    h: ${config.resolution.height},
                    src: '${backgroundSrc}',
                    alpha: 255,
                    show_level: hmUI.show_level.ONLY_NORMAL
                });
                
                // ========== NORMAL MODE WIDGETS ==========
${normalWidgetsCode}
                
                // ========== AOD MODE BACKGROUND ==========
                let widget_aod_bg = hmUI.createWidget(hmUI.widget.IMG, {
                    x: 0,
                    y: 0,
                    w: ${config.resolution.width},
                    h: ${config.resolution.height},
                    src: '${backgroundSrc}',
                    alpha: 255,
                    show_level: hmUI.show_level.ONLY_AOD
                });
                
                // ========== AOD MODE WIDGETS ==========
${aodWidgetsCode}

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

// Generate IMG_TIME widget with hour and minute arrays
function generateIMGTimeWidget(element: WatchFaceElement, widgetIndex: number, showLevel: string): string {
  const x = element.bounds.x || 25;
  const y = element.bounds.y || 220;
  
  // Use time_digit_N.png naming — must match what mockKimiAnalysis generates
  const digitArray = [];
  for (let i = 0; i < 10; i++) {
    digitArray.push(`'time_digit_${i}.png'`);
  }
  const digitArrayStr = `[${digitArray.join(', ')}]`;
  
  return `
                // ${element.name} - IMG_TIME Widget
                let widget_${widgetIndex} = hmUI.createWidget(hmUI.widget.IMG_TIME, {
                    hour_zero: 1,
                    hour_startX: ${x},
                    hour_startY: ${y},
                    hour_array: ${digitArrayStr},
                    hour_align: hmUI.align.LEFT,
                    minute_zero: 1,
                    minute_startX: ${x + 70},
                    minute_startY: ${y},
                    minute_array: ${digitArrayStr},
                    minute_align: hmUI.align.LEFT,
                    minute_follow: 0,
                    show_level: hmUI.show_level.${showLevel}
                });`;
}

// Generate IMG_DATE widget with day arrays
function generateIMGDateWidget(element: WatchFaceElement, widgetIndex: number, showLevel: string): string {
  const x = element.bounds.x || 92;
  const y = element.bounds.y || 198;
  
  // Use date_digit_N.png naming — must match what mockKimiAnalysis generates
  const digitArray = [];
  for (let i = 0; i < 10; i++) {
    digitArray.push(`'date_digit_${i}.png'`);
  }
  const digitArrayStr = `[${digitArray.join(', ')}]`;
  
  return `
                // ${element.name} - IMG_DATE Widget
                let widget_${widgetIndex} = hmUI.createWidget(hmUI.widget.IMG_DATE, {
                    day_startX: ${x},
                    day_startY: ${y},
                    day_sc_array: ${digitArrayStr},
                    day_tc_array: ${digitArrayStr},
                    day_en_array: ${digitArrayStr},
                    day_zero: 1,
                    day_space: 0,
                    day_align: hmUI.align.LEFT,
                    show_level: hmUI.show_level.${showLevel}
                });`;
}

// Generate IMG_WEEK widget with weekday arrays
function generateIMGWeekWidget(element: WatchFaceElement, widgetIndex: number, showLevel: string): string {
  const x = element.bounds.x || 33;
  const y = element.bounds.y || 198;
  
  // Use week_N.png naming — must match what mockKimiAnalysis generates
  const weekArray = [];
  for (let i = 0; i < 7; i++) {
    weekArray.push(`'week_${i}.png'`);
  }
  const weekArrayStr = `[${weekArray.join(', ')}]`;
  
  return `
                // ${element.name} - IMG_WEEK Widget
                let widget_${widgetIndex} = hmUI.createWidget(hmUI.widget.IMG_WEEK, {
                    x: ${x},
                    y: ${y},
                    week_en: ${weekArrayStr},
                    show_level: hmUI.show_level.${showLevel}
                });`;
}

// Generate widget code for each element (V2 format)
function generateWidgetCodeV2(element: WatchFaceElement, widgetIndex: number, isAod: boolean = false): string {
  console.log(`[JSGenV2] generateWidgetCodeV2: element=${element.name}, type=${element.type}, src=${element.src}`);
  
  // Skip background element - already handled
  if (element.name === 'Background' || element.type === 'IMG' && element.bounds.x === 0 && element.bounds.y === 0 && element.bounds.width === 480 && element.bounds.height === 480) {
    return '';
  }
  
  // Skip dynamic widget types - they're handled separately
  if (element.name.toLowerCase().includes('time') || element.name.toLowerCase().includes('date') || element.name.toLowerCase().includes('week')) {
    return '';
  }
  
  // Handle IMG elements (static images)
  if (element.type === 'IMG' && element.src) {
    const w = element.bounds.width || 50;
    const h = element.bounds.height || 50;
    const showLevel = isAod ? 'ONLY_AOD' : 'ONLY_NORMAL';
    
    // Regular IMG elements (icons, indicators) - raw coordinates matching reference
    return `
                // ${element.name}
                let widget_${widgetIndex} = hmUI.createWidget(hmUI.widget.IMG, {
                    x: ${element.bounds.x},
                    y: ${element.bounds.y},
                    w: ${w},
                    h: ${h},
                    src: '${element.src}',
                    alpha: 255,
                    show_level: hmUI.show_level.${showLevel}
                });`;
  }
  
  // Handle IMG_LEVEL elements (level indicators)
  if (element.type === 'IMG_LEVEL' && element.src) {
    const showLevel = isAod ? 'ONLY_AOD' : 'ONLY_NORMAL';
    return `
                // ${element.name} Level Indicator
                let widget_${widgetIndex} = hmUI.createWidget(hmUI.widget.IMG_LEVEL, {
                    x: ${element.bounds.x},
                    y: ${element.bounds.y},
                    image_array: ['${element.src}'],
                    image_length: 1,
                    show_level: hmUI.show_level.${showLevel}
                });`;
  }
  
  console.log(`[JSGenV2] No widget code generated for ${element.name} (type: ${element.type})`);
  return ''; // Skip unsupported types
}

// Generate unique app ID
function generateAppId(): number {
  return Math.floor(Math.random() * (9999999 - 1000000 + 1)) + 1000000;
}
