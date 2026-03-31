try {
    (() => {
        const logger = Logger.getLogger('WatchfaceEditor');
        
        // Widget variables
        let widget_1 = null;
                let widget_2 = null;
                let widget_3 = null;
                let widget_4 = null;
                let widget_5 = null;
                
        
        __$$module$$__.module = DeviceRuntimeCore.WatchFace({
            init_view() {
                // Background image
                hmUI.createWidget(hmUI.widget.IMG, {
                    x: 0,
                    y: 0,
                    w: 480,
                    h: 480,
                    src: 'bg.png',
                    alpha: 255,
                    show_level: hmUI.show_level.ONLY_NORMAL
                });
                
                // Widgets
                
                // Hour Hand - Time Display
                widget_1 = hmUI.createWidget(hmUI.widget.IMG_TIME, {
                    hour_zero: 1,
                    hour_startX: 220,
                    hour_startY: 100,
                    hour_array: ['digit_0.png', 'digit_1.png', 'digit_2.png', 'digit_3.png', 'digit_4.png', 'digit_5.png', 'digit_6.png', 'digit_7.png', 'digit_8.png', 'digit_9.png'],
                    hour_align: hmUI.align.LEFT,
                    minute_zero: 1,
                    minute_startX: 270,
                    minute_startY: 100,
                    minute_array: ['digit_0.png', 'digit_1.png', 'digit_2.png', 'digit_3.png', 'digit_4.png', 'digit_5.png', 'digit_6.png', 'digit_7.png', 'digit_8.png', 'digit_9.png'],
                    minute_align: hmUI.align.LEFT,
                    minute_follow: 0,
                    show_level: hmUI.show_level.ONLY_NORMAL
                });
                // Minute Hand - Time Display
                widget_2 = hmUI.createWidget(hmUI.widget.IMG_TIME, {
                    hour_zero: 1,
                    hour_startX: 230,
                    hour_startY: 60,
                    hour_array: ['digit_0.png', 'digit_1.png', 'digit_2.png', 'digit_3.png', 'digit_4.png', 'digit_5.png', 'digit_6.png', 'digit_7.png', 'digit_8.png', 'digit_9.png'],
                    hour_align: hmUI.align.LEFT,
                    minute_zero: 1,
                    minute_startX: 280,
                    minute_startY: 60,
                    minute_array: ['digit_0.png', 'digit_1.png', 'digit_2.png', 'digit_3.png', 'digit_4.png', 'digit_5.png', 'digit_6.png', 'digit_7.png', 'digit_8.png', 'digit_9.png'],
                    minute_align: hmUI.align.LEFT,
                    minute_follow: 0,
                    show_level: hmUI.show_level.ONLY_NORMAL
                });
                // Second Hand - Time Display
                widget_3 = hmUI.createWidget(hmUI.widget.IMG_TIME, {
                    hour_zero: 1,
                    hour_startX: 235,
                    hour_startY: 50,
                    hour_array: ['digit_0.png', 'digit_1.png', 'digit_2.png', 'digit_3.png', 'digit_4.png', 'digit_5.png', 'digit_6.png', 'digit_7.png', 'digit_8.png', 'digit_9.png'],
                    hour_align: hmUI.align.LEFT,
                    minute_zero: 1,
                    minute_startX: 285,
                    minute_startY: 50,
                    minute_array: ['digit_0.png', 'digit_1.png', 'digit_2.png', 'digit_3.png', 'digit_4.png', 'digit_5.png', 'digit_6.png', 'digit_7.png', 'digit_8.png', 'digit_9.png'],
                    minute_align: hmUI.align.LEFT,
                    minute_follow: 0,
                    show_level: hmUI.show_level.ONLY_NORMAL
                });
                // Battery Indicator
                widget_4 = hmUI.createWidget(hmUI.widget.IMG_LEVEL, {
                    x: 200,
                    y: 400,
                    image_array: ['level_0.png', 'level_1.png', 'level_2.png', 'level_3.png', 'level_4.png'],
                    image_length: 5,
                    type: hmUI.data_type.BATTERY,
                    show_level: hmUI.show_level.ONLY_NORMAL
                });
                // Date Display
                widget_5 = hmUI.createWidget(hmUI.widget.TEXT, {
                    x: 210,
                    y: 280,
                    w: 60,
                    h: 24,
                    color: 0xFFFFFFFF,
                    text_size: 20,
                    text: '',
                    type: hmUI.data_type.DATE,
                    show_level: hmUI.show_level.ONLY_NORMAL
                });
                
                // Widget delegate for lifecycle management
                const widgetDelegate = hmUI.createWidget(hmUI.widget.WIDGET_DELEGATE, {
                    resume_call() {
                        console.log('resume_call()');
                    },
                    pause_call() {
                        console.log('pause_call()');
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
    e && e.stack && e.stack.split(/\n/).forEach(i => console.log('error stack', i));
}