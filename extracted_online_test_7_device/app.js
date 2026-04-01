try {
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
            px: DeviceRuntimeCore.HmUtils.getPx(480)
        };
        const {px} = __$$app$$__.__globals__;
        let __$$module$$__ = __$$app$$__.current;
        __$$module$$__.module = DeviceRuntimeCore.WatchFace({
            init_view() {
                // Watch face initialization
            },
            onInit() {
                // On init
            },
            build() {
                this.init_view();
            },
            onDestroy() {
                // On destroy
            }
        });
    })();
} catch (e) {
    console.log(e);
}