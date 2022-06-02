/*
Copyright 2013-2015 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/main/Infusion-LICENSE.txt
*/

/* global jqUnit */
"use strict";

// This file is copied from Infusion's preference editor tests, because it is not included in the npm package
// See: https://issues.fluidproject.org/browse/FLUID-6170
// Copied from: https://github.com/fluid-project/infusion/blob/52732d2e08991793012995966438f0fdefefd81f/tests/framework-tests/preferences/js/PanelTestUtils.js

fluid.registerNamespace("fluid.tests.panels.utils");

fluid.defaults("fluid.tests.panels.utils.defaultTestPanel", {
    gradeNames: "fluid.resourceLoader",
    strings: {},
    testMessages: {},
    parentBundle: {
        expander: {
            // TODO: This is a dangerous technique that will leak the fluid.messageResolver component
            // We need to add checks that component creators are not used as expander functions
            funcName: "fluid.messageResolver",
            args: [{messageBase: "{that}.options.testMessages"}]
        }
    }
});

fluid.defaults("fluid.tests.panels.utils.injectTemplates", {
    gradeNames: "fluid.resourceLoader",
    renderOnInit: true
});

fluid.tests.panels.utils.checkModel = function (path, newModel, expectedValue) {
    var newval = fluid.get(newModel, path);
    jqUnit.assertEquals("Expected model value " + expectedValue + " at path " + path, expectedValue, newval);
};

fluid.tests.panels.checkSwitchAdjusterRendering = function (that, defaultInputStatus) {
    var messageBase = that.options.messageBase;

    jqUnit.assertEquals("The label text is " + messageBase.label, messageBase.label, that.locate("label").text());
    jqUnit.assertEquals("The description text is " + messageBase.description, messageBase.description, that.locate("description").text());


    jqUnit.assertValue("The switch component should have been created", that.switchUI);
    jqUnit.assertEquals("The toc state is set correctly", defaultInputStatus.toString(), that.switchUI.locate("control").attr("aria-checked"));
    jqUnit.assertEquals("The toggle on text is " + messageBase.switchOn, messageBase.switchOn, that.switchUI.locate("on").text());
    jqUnit.assertEquals("The toggle off text is " + messageBase.switchOff, messageBase.switchOff, that.switchUI.locate("off").text());
};

fluid.tests.panels.changeInput = function (controlContainer, newValue) {
    fluid.changeElementValue(controlContainer.find("input"), newValue);
};
