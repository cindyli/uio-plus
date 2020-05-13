/*
 * Copyright The UIO+ copyright holders
 * See the AUTHORS.md file at the top-level directory of this distribution and at
 * https://github.com/fluid-project/uio-plus/blob/master/AUTHORS.md
 *
 * Licensed under the BSD 3-Clause License. You may not use this file except in
 * compliance with this license.
 *
 * You may obtain a copy of the license at
 * https://github.com/fluid-project/uio-plus/blob/master/LICENSE.txt
 */

/* eslint-env node */
/* global fluid, require */

"use strict";

var gpii = fluid.registerNamespace("gpii");
var chrome = chrome || fluid.require("sinon-chrome", require, "chrome");

fluid.defaults("gpii.chrome.eventedComponent", {
    gradeNames: ["fluid.component"],
    // The left hand side is the name of a chrome event. Must be the full path to a valid chrome event.
    // The right hand side is the component event to be called from the corresponding chrome event handler.
    eventRelayMap: {
        // "chromeEventName": "componentEventName"
    },
    listeners: {
        "onCreate.bindListeners": {
            funcName: "gpii.chrome.eventedComponent.processEventRelay",
            args: "{that}"
        },
        "onDestroy.unbindListeners": {
            funcName: "gpii.chrome.eventedComponent.processEventRelay",
            args: ["{that}", true]
        }
    }
});

gpii.chrome.eventedComponent.processEventRelay = function (that, remove) {
    fluid.each(that.options.eventRelayMap, function (componentEventName, chromeEventName) {
        var chromeEvent = fluid.getGlobalValue(chromeEventName);
        var chromeEventFunc = chromeEvent[remove ? "removeListener" : "addListener"];
        chromeEventFunc.call(chromeEvent, that.events[componentEventName].fire);
    });
};
