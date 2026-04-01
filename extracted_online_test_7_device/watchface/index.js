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
        
        // Background
        h.createWidget(hmUI.widget.IMG, {
            x: 0,
            y: 0,
            w: 480,
            h: 480,
            src: 'bg.png',
        });
        
        // Widgets
        
        // Hour Hand
        h.createWidget(hmUI.widget.TIME_POINTER, {
            hour: {
                centerX: px(240),
                centerY: px(240),
                posX: px(220),
                posY: px(100),
                path: 'hour_hand.png',
            },
        });
        // Minute Hand
        h.createWidget(hmUI.widget.TIME_POINTER, {
            minute: {
                centerX: px(240),
                centerY: px(240),
                posX: px(230),
                posY: px(60),
                path: 'minute_hand.png',
            },
        });
        // Second Hand
        h.createWidget(hmUI.widget.TIME_POINTER, {
            second: {
                centerX: px(240),
                centerY: px(240),
                posX: px(235),
                posY: px(50),
                path: 'second_hand.png',
            },
        });
        // Battery Indicator
        h.createWidget(hmUI.widget.IMG_LEVEL, {
            x: px(200),
            y: px(400),
            image_array: ['bat_0.png', 'bat_1.png', 'bat_2.png', 'bat_3.png', 'bat_4.png'],
            image_length: 5,
            type: hmUI.data_type.BATTERY,
        });
        // Date Display
        h.createWidget(hmUI.widget.TEXT, {
            x: px(210),
            y: px(280),
            w: px(60),
            h: px(24),
            color: 0xFFFFFF,
            text_size: px(20),
            type: hmUI.data_type.DATE,
        });
    })();
} catch (e) {
    console.log(e);
}