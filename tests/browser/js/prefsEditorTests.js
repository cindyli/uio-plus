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

/* global fluid, jqUnit, gpii */
"use strict";

(function ($) {

    $(document).ready(function () {

        fluid.registerNamespace("gpii.tests");

        /*********************************************************************************************************
         * store tests
         ********************************************************************************************************/

        gpii.tests.stored = {
            testSettings: {
                panelIndex: 2,
                settings: {
                    characterSpace: "test-characterSpace",
                    clickToSelectEnabled: "test-clickToSelectEnabled",
                    contrastTheme: "test-contrastTheme",
                    fontSize: "test-fontSize",
                    inputsLargerEnabled: "test-inputsLargerEnabled",
                    lineSpace: "test-lineSpace",
                    selectionTheme: "test-selectionTheme",
                    selfVoicingEnabled: "test-selfVoicingEnabled",
                    simplifiedUiEnabled: "test-simplifiedUiEnabled",
                    tableOfContentsEnabled: "test-tableOfContents",
                    wordSpace: "test-wordSpace"
                }
            },
            testPrefs: {
                panelIndex: 2,
                preferences: {
                    fluid_prefs_enhanceInputs: "test-inputsLargerEnabled",
                    fluid_prefs_letterSpace: "test-characterSpace",
                    fluid_prefs_speak: "test-selfVoicingEnabled",
                    fluid_prefs_tableOfContents: "test-tableOfContents",
                    gpii_chrome_prefs_clickToSelect: "test-clickToSelectEnabled",
                    gpii_chrome_prefs_contrast: "test-contrastTheme",
                    gpii_chrome_prefs_highlight: "test-selectionTheme",
                    gpii_chrome_prefs_lineSpace: "test-lineSpace",
                    gpii_chrome_prefs_simplify: "test-simplifiedUiEnabled",
                    gpii_chrome_prefs_textSize: "test-fontSize",
                    gpii_chrome_prefs_wordSpace: "test-wordSpace"
                }
            }
        };

        fluid.defaults("gpii.tests.chrome.prefs.extensionPanel.store", {
            gradeNames: ["gpii.chrome.prefs.extensionPanel.store", "fluid.dataSource.writable"],
            members: {
                lastIncomingPayload: gpii.tests.stored.testSettings
            }
        });

        fluid.defaults("gpii.tests.chrome.prefs.extensionPanel.store.tests", {
            gradeNames: ["fluid.test.testEnvironment"],
            components: {
                store: {
                    type: "gpii.tests.chrome.prefs.extensionPanel.store"
                },
                storeTester: {
                    type: "gpii.tests.chrome.prefs.extensionPanel.store.tester"
                }
            }
        });

        fluid.defaults("gpii.tests.chrome.prefs.extensionPanel.store.tester", {
            gradeNames: ["fluid.test.testCaseHolder", "gpii.tests.portBinding.portName"],
            testOpts: {
                readReceipt: {
                    type: "gpii.chrome.readReceipt",
                    // the id will be added by gpii.tests.chrome.portBinding.returnReceipt
                    payload: gpii.tests.stored.testSettings
                },
                writeReceipt: {
                    type: "gpii.chrome.writeReceipt",
                    // the id will be added by gpii.tests.chrome.portBinding.returnReceipt
                    payload: gpii.tests.stored.testSettings
                },
                writeRequest: {
                    type: "gpii.chrome.writeRequest",
                    // the id is created with a unique number, so it will not be tested
                    payload: gpii.tests.stored.testSettings
                }
            },
            modules: [{
                name: "Store Tests",
                tests: [{
                    name: "getting/setting - transformation",
                    expect: 5,
                    sequence: [{
                        func: "gpii.tests.chrome.portBinding.assertConnection",
                        args: ["{that}.options.testOpts.expectedPortName"]
                    }, {
                        // Get
                        func: "gpii.tests.chrome.portBinding.returnReceipt",
                        args: ["{store}", "{that}.options.testOpts.readReceipt"]
                    }, {
                        task: "{store}.get",
                        resolve: "jqUnit.assertDeepEq",
                        resolveArgs: ["The get method returns the stored prefs correctly transformed", gpii.tests.stored.testPrefs, "{arguments}.0"]
                    }, {
                        func: "gpii.tests.chrome.portBinding.resetPostMessage",
                        args: ["{store}.port"]
                    }, {
                        // Set
                        func: "gpii.tests.chrome.portBinding.returnReceipt",
                        args: ["{store}", "{that}.options.testOpts.writeReceipt"]
                    }, {
                        task: "{store}.set",
                        args: [null, gpii.tests.stored.testPrefs],
                        resolve: "jqUnit.assertDeepEq",
                        resolveArgs: ["The write response is in the correct form", gpii.tests.stored.testPrefs, "{arguments}.0"]
                    }, {
                        func: "gpii.tests.chrome.portBinding.assertPostMessageWithUnknownID",
                        args: ["Set", "{store}.port", "{that}.options.testOpts.writeRequest"]
                    }]
                }]
            }]
        });

        /*********************************************************************************************************
         * Panel Tests *
         *********************************************************************************************************/

        gpii.tests.changeInput = function (container, newValue) {
            fluid.changeElementValue(container.find("input"), newValue);
        };

        fluid.registerNamespace("gpii.tests.themePicker");

        gpii.tests.themePicker.testDefault = function (that, expectedNumOfOptions, expectedContrast) {
            var inputs = that.locate("themeInput");
            var labels = that.locate("themeLabel");
            var messageBase = that.options.messageBase;

            jqUnit.assertEquals("The label text is " + messageBase.label, messageBase.label, that.locate("label").text());
            jqUnit.assertEquals("The description text is " + messageBase.description, messageBase.description, that.locate("description").text());

            jqUnit.assertEquals("There are " + expectedNumOfOptions + " contrast selections in the control", expectedNumOfOptions, inputs.length);
            jqUnit.assertEquals("The first theme is " + expectedContrast, expectedContrast, inputs.filter(":checked").val());

            var inputValue, label;
            fluid.each(inputs, function (input, index) {
                inputValue = input.value;
                label = labels.eq(index);
                jqUnit.assertTrue("The theme label has appropriate css applied", label.hasClass(that.options.classnameMap.theme[inputValue]));

                jqUnit.assertEquals("The aria-label is " + that.options.messageBase.contrast[index], that.options.messageBase.contrast[index], label.attr("aria-label"));
            });

            jqUnit.assertTrue("The default theme label has the default label css applied", labels.eq(0).hasClass(that.options.styles.defaultThemeLabel));
        };

        gpii.tests.themePicker.changeChecked = function (inputs, newValue) {
            inputs.prop("checked", false);
            var matchingInput = inputs.filter("[value='" + newValue + "']");
            matchingInput.prop("checked", "checked").change();
        };


        /*************
         * Text Size *
         *************/
        fluid.defaults("gpii.tests.chrome.prefs.panel.textSize", {
            gradeNames: ["gpii.chrome.prefs.panel.textSize", "fluid.tests.panels.utils.defaultTestPanel", "fluid.tests.panels.utils.injectTemplates"],
            model: {
                value: 1
            },
            messageBase: {
                "label": "Text Size",
                "description": "Adjust text size",
                "increaseLabel": "increase text size",
                "decreaseLabel": "decrease text size"
            },
            resources: {
                template: {
                    url: "../../../dist/templates/PrefsEditorTemplate-textSize.html"
                }
            }
        });

        fluid.defaults("gpii.tests.textSizeAdjusterTests", {
            gradeNames: ["fluid.test.testEnvironment"],
            components: {
                textSize: {
                    type: "gpii.tests.chrome.prefs.panel.textSize",
                    container: ".gpiic-textSize",
                    createOnEvent: "{textSizeTester}.events.onTestCaseStart"
                },
                textSizeTester: {
                    type: "gpii.tests.textSizeTester"
                }
            }
        });

        fluid.defaults("gpii.tests.textSizeTester", {
            gradeNames: ["fluid.test.testCaseHolder"],
            testOptions: {
                newValue: 3.5
            },
            modules: [{
                name: "Text Size Adjuster",
                tests: [{
                    expect: 2,
                    name: "rendering",
                    sequence: [{
                        event: "{gpii.tests.textSizeAdjusterTests textSize}.events.afterRender",
                        priority: "last:testing",
                        listener: "fluid.tests.panels.utils.checkModel",
                        args: ["value", "{textSize}.model", 1]
                    }, {
                        func: "gpii.tests.changeInput",
                        args: ["{textSize}.dom.textfieldStepperContainer", "{that}.options.testOptions.newValue"]
                    }, {
                        listener: "fluid.tests.panels.utils.checkModel",
                        args: ["value", "{textSize}.model", "{that}.options.testOptions.newValue"],
                        spec: {path: "value", priority: "last"},
                        changeEvent: "{textSize}.applier.modelChanged"
                    }]
                }]
            }]
        });

        /**************
         * Line Space *
         *************/
        fluid.defaults("gpii.tests.chrome.prefs.panel.lineSpace", {
            gradeNames: ["gpii.chrome.prefs.panel.lineSpace", "fluid.tests.panels.utils.defaultTestPanel", "fluid.tests.panels.utils.injectTemplates"],
            model: {
                value: 1
            },
            messageBase: {
                "label": "Line Spacing",
                "description": "Adjust the spacing between lines of text",
                "increaseLabel": "increase line spacing",
                "decreaseLabel": "decrease line spacing"
            },
            resources: {
                template: {
                    url: "../../../dist/templates/PrefsEditorTemplate-lineSpace.html"
                }
            }
        });

        fluid.defaults("gpii.tests.lineSpaceAdjusterTests", {
            gradeNames: ["fluid.test.testEnvironment"],
            components: {
                lineSpace: {
                    type: "gpii.tests.chrome.prefs.panel.lineSpace",
                    container: ".gpiic-lineSpace",
                    createOnEvent: "{lineSpaceTester}.events.onTestCaseStart"
                },
                lineSpaceTester: {
                    type: "gpii.tests.lineSpaceTester",
                    options: {
                        modules: [{
                            name: "Test the line space settings panel"
                        }]
                    }
                }
            }
        });

        fluid.defaults("gpii.tests.lineSpaceTester", {
            gradeNames: ["fluid.test.testCaseHolder"],
            testOptions: {
                newValue: 2.6
            },
            modules: [{
                name: "Line Space Adjuster",
                tests: [{
                    expect: 2,
                    name: "rendering",
                    sequence: [
                        {
                            event: "{gpii.tests.lineSpaceAdjusterTests lineSpace}.events.afterRender",
                            priority: "last:testing",
                            listener: "fluid.tests.panels.utils.checkModel",
                            args: ["value", "{lineSpace}.model", 1]
                        }, {
                            func: "gpii.tests.changeInput",
                            args: ["{lineSpace}.dom.textfieldStepperContainer", "{that}.options.testOptions.newValue"]
                        }, {
                            listener: "fluid.tests.panels.utils.checkModel",
                            args: ["value", "{lineSpace}.model", "{that}.options.testOptions.newValue"],
                            spec: {path: "value", priority: "last"},
                            changeEvent: "{lineSpace}.applier.modelChanged"
                        }
                    ]
                }]
            }]
        });

        /*******************
         * Character Space *
         ******************/
        fluid.defaults("gpii.tests.chrome.prefs.panel.charSpace", {
            gradeNames: ["fluid.prefs.panel.letterSpace", "fluid.tests.panels.utils.defaultTestPanel", "fluid.tests.panels.utils.injectTemplates"],
            model: {
                value: 1
            },
            messageBase: {
                "label": "Character Spacing",
                "description": "Adjust the spacing between letters",
                "increaseLabel": "increase character spacing",
                "decreaseLabel": "decrease character spacing"
            },
            resources: {
                template: {
                    url: "../../../dist/templates/PrefsEditorTemplate-letterSpace.html"
                }
            }
        });

        fluid.defaults("gpii.tests.charSpaceAdjusterTests", {
            gradeNames: ["fluid.test.testEnvironment"],
            components: {
                charSpace: {
                    type: "gpii.tests.chrome.prefs.panel.charSpace",
                    container: ".gpiic-charSpace",
                    createOnEvent: "{charSpaceTester}.events.onTestCaseStart"
                },
                charSpaceTester: {
                    type: "gpii.tests.charSpaceTester",
                    options: {
                        modules: [{
                            name: "Test the character space settings panel"
                        }]
                    }
                }
            }
        });

        fluid.defaults("gpii.tests.charSpaceTester", {
            gradeNames: ["fluid.test.testCaseHolder"],
            testOptions: {
                newValue: 2.6
            },
            modules: [{
                name: "Character Space Adjuster",
                tests: [{
                    expect: 2,
                    name: "rendering",
                    sequence: [
                        {
                            event: "{gpii.tests.charSpaceAdjusterTests charSpace}.events.afterRender",
                            priority: "last:testing",
                            listener: "fluid.tests.panels.utils.checkModel",
                            args: ["value", "{charSpace}.model", 1]
                        }, {
                            func: "gpii.tests.changeInput",
                            args: ["{charSpace}.dom.textfieldStepperContainer", "{that}.options.testOptions.newValue"]
                        }, {
                            listener: "fluid.tests.panels.utils.checkModel",
                            args: ["value", "{charSpace}.model", "{that}.options.testOptions.newValue"],
                            spec: {path: "value", priority: "last"},
                            changeEvent: "{charSpace}.applier.modelChanged"
                        }
                    ]
                }]
            }]
        });

        /************
         * Contrast *
         ***********/
        // Contrast
        fluid.defaults("gpii.chrome.tests.prefs.panel.contrast", {
            gradeNames: ["gpii.chrome.prefs.panel.contrast", "fluid.tests.panels.utils.defaultTestPanel", "fluid.tests.panels.utils.injectTemplates"],
            messageBase: {
                "contrast": ["Default", "Black on white", "White on black", "Black on yellow", "Yellow on black"],
                "contrast-default": "Default",
                "contrast-bw": "Black on white",
                "contrast-wb": "White on black",
                "contrast-by": "Black on yellow",
                "contrast-yb": "Yellow on black",
                "label": "colour and contrast",
                "description": "Change the text and background colours"
            },
            model: {
                value: "default"
            },
            resources: {
                template: {
                    url: "../../../dist/templates/PrefsEditorTemplate-contrast.html"
                }
            },
            classnameMap: {
                "theme": {
                    "default": "fl-prefsEditor-default-theme",
                    "bw": "fl-theme-bw",
                    "wb": "fl-theme-wb",
                    "by": "fl-theme-by",
                    "yb": "fl-theme-yb"
                }
            },
            controlValues: {
                theme: ["default", "bw", "wb", "by", "yb"]
            }
        });

        fluid.defaults("gpii.tests.contrastAdjusterTests", {
            gradeNames: ["fluid.test.testEnvironment"],
            components: {
                contrast: {
                    type: "gpii.chrome.tests.prefs.panel.contrast",
                    container: ".gpiic-contrast",
                    createOnEvent: "{contrastTester}.events.onTestCaseStart"
                },
                contrastTester: {
                    type: "gpii.tests.contrastTester"
                }
            }
        });

        fluid.defaults("gpii.tests.contrastTester", {
            gradeNames: ["fluid.test.testCaseHolder"],
            testOptions: {
                expectedNumOfOptions: 5,
                defaultValue: "default",
                newValue: "bw"
            },
            modules: [{
                name: "Contrast Adjuster",
                tests: [{
                    expect: 16,
                    name: "rendering",
                    sequence: [{
                        listener: "gpii.tests.themePicker.testDefault",
                        args: ["{contrast}", "{that}.options.testOptions.expectedNumOfOptions", "{that}.options.testOptions.defaultValue"],
                        spec: {priority: "last"},
                        event: "{contrastAdjusterTests contrast}.events.afterRender"
                    }, {
                        func: "gpii.tests.themePicker.changeChecked",
                        args: ["{contrast}.dom.themeInput", "{that}.options.testOptions.newValue"]
                    }, {
                        listener: "fluid.tests.panels.utils.checkModel",
                        args: ["value", "{contrast}.model", "{that}.options.testOptions.newValue"],
                        spec: {path: "value", priority: "last"},
                        changeEvent: "{contrast}.applier.modelChanged"
                    }]
                }]
            }]
        });

        /*************
         * Highlight *
         ************/
        fluid.defaults("gpii.chrome.tests.prefs.panel.highlight", {
            gradeNames: ["gpii.chrome.prefs.panel.highlight", "fluid.tests.panels.utils.defaultTestPanel", "fluid.tests.panels.utils.injectTemplates"],
            messageBase: {
                "contrast": ["Default", "Yellow highlight", "Green highlight", "Pink highlight"],
                "selectionHighlight-default": "Default",
                "selectionHighlight-yellow": "Yellow highlight",
                "selectionHighlight-green": "Green highlight",
                "selectionHighlight-pink": "Pink highlight",
                "label": "Selection Highlight",
                "description": "Change the highlight colour for text selections"
            },
            model: {
                value: "default"
            },
            resources: {
                template: {
                    url: "../../../dist/templates/SelectionHighlightPanelTemplate.html"
                }
            },
            classnameMap: {
                "theme": {
                    "default": "fl-theme-prefsEditor-default",
                    "yellow": "gpii-ext-selection-preview-yellow",
                    "green": "gpii-ext-selection-preview-green",
                    "pink": "gpii-ext-selection-preview-pink"
                }
            }
        });

        fluid.defaults("gpii.tests.highlightAdjusterTests", {
            gradeNames: ["fluid.test.testEnvironment"],
            components: {
                highlight: {
                    type: "gpii.chrome.tests.prefs.panel.highlight",
                    container: ".gpiic-highlight",
                    createOnEvent: "{highlightTester}.events.onTestCaseStart"
                },
                highlightTester: {
                    type: "gpii.tests.highlightTester"
                }
            }
        });

        fluid.defaults("gpii.tests.highlightTester", {
            gradeNames: ["fluid.test.testCaseHolder"],
            testOptions: {
                expectedNumOfOptions: 4,
                defaultValue: "default",
                newValue: "green"
            },
            modules: [{
                name: "Highlight Adjuster",
                tests: [{
                    expect: 14,
                    name: "rendering",
                    sequence: [{
                        listener: "gpii.tests.themePicker.testDefault",
                        args: ["{highlight}", "{that}.options.testOptions.expectedNumOfOptions", "{that}.options.testOptions.defaultValue"],
                        spec: {priority: "last"},
                        event: "{highlightAdjusterTests highlight}.events.afterRender"
                    }, {
                        func: "gpii.tests.themePicker.changeChecked",
                        args: ["{highlight}.dom.themeInput", "{that}.options.testOptions.newValue"]
                    }, {
                        listener: "fluid.tests.panels.utils.checkModel",
                        args: ["value", "{highlight}.model", "{that}.options.testOptions.newValue"],
                        spec: {path: "value", priority: "last"},
                        changeEvent: "{highlight}.applier.modelChanged"
                    }]
                }]
            }]
        });

        /*****************************
         * Switch Adjuster Sequences *
         ****************************/
        fluid.defaults("gppi.tests.sequence.switchAdjusterRendering", {
            gradeNames: "fluid.test.sequenceElement",
            sequence: [{
                listener: "fluid.tests.panels.checkSwitchAdjusterRendering",
                event: "{testEnvironment panel}.events.afterRender",
                priority: "last:testing",
                args: ["{panel}", "{that}.options.defaultInputStatus"]
            }]
        });

        fluid.defaults("gppi.tests.sequence.switchAdjusterChange", {
            gradeNames: "fluid.test.sequenceElement",
            sequence: [{
                jQueryTrigger: "click",
                element: "{panel}.switchUI.dom.control"
            }, {
                listener: "fluid.tests.panels.utils.checkModel",
                args: ["value", "{panel}.model", "{that}.options.newValue"],
                spec: {path: "value", priority: "last"},
                changeEvent: "{panel}.applier.modelChanged"
            }, {
                jQueryTrigger: "click",
                element: "{panel}.switchUI.dom.control"
            }, {
                listener: "fluid.tests.panels.utils.checkModel",
                args: ["value", "{panel}.model", "{that}.options.originalValue"],
                spec: {path: "value", priority: "last"},
                changeEvent: "{panel}.applier.modelChanged"
            }]
        });

        fluid.defaults("fluid.tests.switchAdjusterSequences", {
            gradeNames: "fluid.test.sequence",
            sequenceElements: {
                initialRendering: {
                    gradeNames: "gppi.tests.sequence.switchAdjusterRendering",
                    options: {
                        defaultInputStatus: "{fluid.test.testCaseHolder}.options.testOptions.defaultInputStatus"
                    }
                },
                inputChange: {
                    gradeNames: "gppi.tests.sequence.switchAdjusterChange",
                    priority: "after:initialRendering",
                    options: {
                        newValue: "{fluid.test.testCaseHolder}.options.testOptions.newValue",
                        originalValue: "{fluid.test.testCaseHolder}.options.testOptions.defaultInputStatus"
                    }
                }
            }
        });

        /************
         * Simplify *
         **********/
        fluid.defaults("fluid.tests.prefs.panel.simplify", {
            gradeNames: ["gpii.chrome.prefs.panel.simplify", "fluid.tests.panels.utils.defaultTestPanel", "fluid.tests.panels.utils.injectTemplates"],
            model: {
                value: false
            },
            messageBase: {
                "label": "Simplify",
                "description": "Only display the main content",
                "switchOn": "ON",
                "switchOff": "OFF"
            },
            resources: {
                template: {
                    url: "../../../dist/templates/SimplifyPanelTemplate.html"
                }
            }
        });

        fluid.defaults("gpii.tests.simplifyAdjusterTests", {
            gradeNames: ["fluid.test.testEnvironment"],
            components: {
                simplify: {
                    type: "fluid.tests.prefs.panel.simplify",
                    container: ".gpiic-simplify",
                    createOnEvent: "{simplifyTester}.events.onTestCaseStart"
                },
                simplifyTester: {
                    type: "gpii.tests.simplifyTester"
                }
            }
        });

        fluid.defaults("gpii.tests.simplifyTester", {
            gradeNames: ["fluid.test.testCaseHolder"],
            testOptions: {
                defaultInputStatus: false,
                newValue: true
            },
            modules: [{
                name: "Simplify Adjuster",
                tests: [{
                    expect: 8,
                    name: "rendering and input change",
                    sequenceGrade: "fluid.tests.switchAdjusterSequences"
                }]
            }]
        });

        /*******************
         * Syllabification *
         ******************/
        fluid.defaults("fluid.tests.prefs.panel.syllabification", {
            gradeNames: ["fluid.prefs.panel.syllabification", "fluid.tests.panels.utils.defaultTestPanel", "fluid.tests.panels.utils.injectTemplates"],
            model: {
                value: false
            },
            messageBase: {
                "label": "Syllabification",
                "description": "Separate words into their phonetic parts.",
                "switchOn": "ON",
                "switchOff": "OFF"
            },
            resources: {
                template: {
                    url: "../../../dist/templates/PrefsEditorTemplate-syllabification.html"
                }
            }
        });

        fluid.defaults("gpii.tests.syllabificationAdjusterTests", {
            gradeNames: ["fluid.test.testEnvironment"],
            components: {
                syllabification: {
                    type: "fluid.tests.prefs.panel.syllabification",
                    container: ".gpiic-syllabification",
                    createOnEvent: "{syllabificationTester}.events.onTestCaseStart"
                },
                syllabificationTester: {
                    type: "gpii.tests.syllabificationTester"
                }
            }
        });

        fluid.defaults("gpii.tests.syllabificationTester", {
            gradeNames: ["fluid.test.testCaseHolder"],
            testOptions: {
                defaultInputStatus: false,
                newValue: true
            },
            modules: [{
                name: "Syllabification Adjuster",
                tests: [{
                    expect: 8,
                    name: "rendering and input change",
                    sequenceGrade: "fluid.tests.switchAdjusterSequences"
                }]
            }]
        });

        /*******************
         * Click to Select *
         ******************/
        fluid.defaults("fluid.tests.prefs.panel.clickToSelect", {
            gradeNames: ["gpii.chrome.prefs.panel.clickToSelect", "fluid.tests.panels.utils.defaultTestPanel", "fluid.tests.panels.utils.injectTemplates"],
            model: {
                value: false
            },
            messageBase: {
                "label": "Click To Select",
                "description": "Right click to select paragraph",
                "switchOn": "ON",
                "switchOff": "OFF"
            },
            resources: {
                template: {
                    url: "../../../dist/templates/ClickToSelectPanelTemplate.html"
                }
            }
        });

        fluid.defaults("gpii.tests.clickToSelectAdjusterTests", {
            gradeNames: ["fluid.test.testEnvironment"],
            components: {
                clickToSelect: {
                    type: "fluid.tests.prefs.panel.clickToSelect",
                    container: ".gpiic-clickToSelect",
                    createOnEvent: "{clickToSelectTester}.events.onTestCaseStart"
                },
                clickToSelectTester: {
                    type: "gpii.tests.clickToSelectTester"
                }
            }
        });

        fluid.defaults("gpii.tests.clickToSelectTester", {
            gradeNames: ["fluid.test.testCaseHolder"],
            testOptions: {
                defaultInputStatus: false,
                newValue: true
            },
            modules: [{
                name: "Click to Select Adjuster",
                tests: [{
                    expect: 8,
                    name: "rendering and input change",
                    sequenceGrade: "fluid.tests.switchAdjusterSequences"
                }]
            }]
        });

        /*********************************************************************************************************
         * PrefsEditor Tests *
         *********************************************************************************************************/

        // TODO: Added "integration" tests for the prefs editor using the gpii.chrome.prefs.auxSchema schema.
        //       Ensure that adjuster models are updated in both directions, and that the store is triggered.

        fluid.defaults("gpii.tests.chrome.prefs.auxSchema", {
            gradeNames: ["gpii.chrome.prefs.auxSchema"],
            auxiliarySchema: {
                "namespace": "gpii.tests.chrome.prefs.constructed",
                "terms": {
                    "templatePrefix": "../../../dist/templates/",
                    "messagePrefix": "../../../dist/messages/"
                }
            }
        });

        gpii.tests.built = fluid.prefs.builder({
            gradeNames: ["gpii.tests.chrome.prefs.auxSchema"]
        });

        fluid.defaults("gpii.tests.prefsEditorTests", {
            gradeNames: ["fluid.test.testEnvironment"],
            listeners: {
                "{prefsEditorStackTester}.events.onTestCaseStart": {
                    listener: "gpii.tests.mockPort.reset",
                    priority: "first",
                    namespace: "resetPort"
                }
            },
            components: {
                prefsEditorStack: {
                    type: gpii.tests.built.options.assembledPrefsEditorGrade,
                    container: ".gpiic-prefsEditor",
                    createOnEvent: "{prefsEditorStackTester}.events.onTestCaseStart",
                    options: {
                        distributeOptions: [{
                            record: {
                                gradeNames: ["fluid.resolveRootSingle", "fluid.dataSource.writable"],
                                singleRootType: "fluid.prefs.store",
                                listeners: {
                                    "onCreate.setupInitialReturnReceipt": {
                                        listener: "gpii.tests.chrome.portBinding.returnReceipt",
                                        priority: "first",
                                        args: ["{that}", {
                                            type: "gpii.chrome.readReceipt",
                                            payload: {}
                                        }]
                                    }
                                }
                            },
                            target: "{that settingsStore}.options"
                        }]
                    }
                },
                prefsEditorStackTester: {
                    type: "gpii.tests.prefsEditorStackTester"
                }
            }
        });

        gpii.tests.prefsEditorTests.assertInit = function (prefsEditorStack, defaultModel, adjusters) {
            // setting store initialization
            var store = prefsEditorStack.store;
            jqUnit.assertValue("The store has been initialized", store);
            jqUnit.assertValue("The settingsStore has been initialized", store.settingsStore);

            // enhancer initialization
            var enhancer = prefsEditorStack.enhancer;
            jqUnit.assertValue("The enhancer has been initialized", enhancer);
            jqUnit.assertValue("The uiEnhancer has been initialized", enhancer.uiEnhancer);
            jqUnit.assertDeepEq("The uiEnhancer's default model should be set", defaultModel.preferences, enhancer.uiEnhancer.model);

            // The schema for the prefs editor does not include any enactors.
            // Verify that none have been configured.
            jqUnit.assertUndefined("There are no enactors initialized", enhancer.uiEnhancer.options.components);

            // prefsEditorLoader
            var prefsEditorLoader = prefsEditorStack.prefsEditorLoader;
            jqUnit.assertValue("The prefsEditorLoader has been initialized", prefsEditorLoader);
            jqUnit.assertDeepEq("The prefsEditor's default model should be set", defaultModel.preferences, prefsEditorLoader.prefsEditor.model.preferences);
            jqUnit.assertUndefined("The aria-busy attribute should be removed", prefsEditorLoader.container.attr("aria-busy"));
            jqUnit.assertNodeNotExists("The loading spinner should be removed", prefsEditorLoader.options.selectors.loading);
            fluid.each(adjusters, function (adjuster) {
                jqUnit.assertValue("The " + adjuster + " has been initialized", prefsEditorLoader.prefsEditor[adjuster]);
            });
        };

        gpii.tests.prefsEditorTests.assertSettingChanged = function (prefsEditorStack, prefsPath, newModel) {
            var prefsEditorModel = prefsEditorStack.prefsEditorLoader.prefsEditor.model;

            fluid.tests.panels.utils.checkModel(prefsPath, prefsEditorModel, fluid.get(newModel, prefsPath));
        };

        gpii.tests.prefsEditorTests.assertExternalPrefChange = function (prefsEditorStack, newModel) {
            // prefsEditorLoader
            var prefsEditorLoader = prefsEditorStack.prefsEditorLoader;
            jqUnit.assertDeepEq("The prefsEditor's model should be set", newModel.preferences, prefsEditorLoader.prefsEditor.model.preferences);

            // enhancer model
            jqUnit.assertDeepEq("The uiEnhancer's model should be set", newModel.preferences, prefsEditorStack.enhancer.uiEnhancer.model);
        };

        fluid.defaults("gpii.tests.prefsEditorStackTester", {
            gradeNames: ["fluid.test.testCaseHolder"],
            testOpts: {
                defaultModel:{
                    preferences: {
                        fluid_prefs_enhanceInputs: false,
                        fluid_prefs_letterSpace: 1,
                        fluid_prefs_speak: false,
                        fluid_prefs_syllabification: false,
                        fluid_prefs_tableOfContents: false,
                        gpii_chrome_prefs_clickToSelect: false,
                        gpii_chrome_prefs_contrast: "default",
                        gpii_chrome_prefs_highlight: "default",
                        gpii_chrome_prefs_lineSpace: 1,
                        gpii_chrome_prefs_simplify: false,
                        gpii_chrome_prefs_textSize: 1,
                        gpii_chrome_prefs_wordSpace: 1
                    }
                },
                newModel: {
                    preferences: {
                        fluid_prefs_enhanceInputs: true,
                        fluid_prefs_letterSpace: 1.2,
                        fluid_prefs_speak: true,
                        fluid_prefs_syllabification: true,
                        fluid_prefs_tableOfContents: true,
                        gpii_chrome_prefs_clickToSelect: true,
                        gpii_chrome_prefs_contrast: "yb",
                        gpii_chrome_prefs_highlight: "green",
                        gpii_chrome_prefs_lineSpace: 2.7,
                        gpii_chrome_prefs_simplify: true,
                        gpii_chrome_prefs_textSize: 3.1,
                        gpii_chrome_prefs_wordSpace: 0.9
                    }
                },
                adjusters: [
                    "fluid_prefs_panel_enhanceInputs",
                    "fluid_prefs_panel_layoutControls",
                    "fluid_prefs_panel_letterSpace",
                    "fluid_prefs_panel_speak",
                    "fluid_prefs_panel_syllabification",
                    "gpii_chrome_prefs_panel_clickToSelect",
                    "gpii_chrome_prefs_panel_contrast",
                    "gpii_chrome_prefs_panel_highlight",
                    "gpii_chrome_prefs_panel_lineSpace",
                    "gpii_chrome_prefs_panel_simplify",
                    "gpii_chrome_prefs_panel_textSize",
                    "gpii_chrome_prefs_panel_wordSpace"
                ]
            },
            modules: [{
                name: "Prefs Editor Tests",
                tests: [{
                    name: "Instantiation",
                    expect:22,
                    sequence: [{
                        event: "{testEnvironment prefsEditorStack prefsEditorLoader}.events.onReady",
                        listener: "gpii.tests.prefsEditorTests.assertInit",
                        priority: "last:testing",
                        args: ["{prefsEditorStack}", "{that}.options.testOpts.defaultModel", "{that}.options.testOpts.adjusters"]
                    }]
                }, {
                    name: "Model Changes",
                    expect:12,
                    sequence: [{
                        // character space model change
                        func: "gpii.tests.changeInput",
                        args: ["{prefsEditorStack}.prefsEditorLoader.prefsEditor.fluid_prefs_panel_letterSpace.dom.textfieldStepperContainer", "{that}.options.testOpts.newModel.preferences.fluid_prefs_letterSpace"]
                    }, {
                        listener: "gpii.tests.prefsEditorTests.assertSettingChanged",
                        args: ["{prefsEditorStack}", ["preferences", "fluid_prefs_letterSpace"], "{that}.options.testOpts.newModel"],
                        spec: {path: "preferences.fluid_prefs_letterSpace", priority: "last:testing"},
                        changeEvent: "{prefsEditorStack}.prefsEditorLoader.prefsEditor.applier.modelChanged"
                    }, {
                        // click to select model change
                        jQueryTrigger: "click",
                        element: "{prefsEditorStack}.prefsEditorLoader.prefsEditor.gpii_chrome_prefs_panel_clickToSelect.switchUI.dom.control"
                    }, {
                        listener: "gpii.tests.prefsEditorTests.assertSettingChanged",
                        args: ["{prefsEditorStack}", ["preferences", "gpii_chrome_prefs_clickToSelect"], "{that}.options.testOpts.newModel"],
                        spec: {path: "preferences.gpii_chrome_prefs_clickToSelect", priority: "last:testing"},
                        changeEvent: "{prefsEditorStack}.prefsEditorLoader.prefsEditor.applier.modelChanged"
                    }, {
                        // contrast model change
                        func: "gpii.tests.themePicker.changeChecked",
                        args: ["{prefsEditorStack}.prefsEditorLoader.prefsEditor.gpii_chrome_prefs_panel_contrast.dom.themeInput", "{that}.options.testOpts.newModel.preferences.gpii_chrome_prefs_contrast"]
                    }, {
                        listener: "gpii.tests.prefsEditorTests.assertSettingChanged",
                        args: ["{prefsEditorStack}", ["preferences", "gpii_chrome_prefs_contrast"], "{that}.options.testOpts.newModel"],
                        spec: {path: "preferences.gpii_chrome_prefs_contrast", priority: "last:testing"},
                        changeEvent: "{prefsEditorStack}.prefsEditorLoader.prefsEditor.applier.modelChanged"
                    }, {
                        // enhance inputs model change
                        jQueryTrigger: "click",
                        element: "{prefsEditorStack}.prefsEditorLoader.prefsEditor.fluid_prefs_panel_enhanceInputs.switchUI.dom.control"
                    }, {
                        listener: "gpii.tests.prefsEditorTests.assertSettingChanged",
                        args: ["{prefsEditorStack}", ["preferences", "fluid_prefs_enhanceInputs"], "{that}.options.testOpts.newModel"],
                        spec: {path: "preferences.fluid_prefs_enhanceInputs", priority: "last:testing"},
                        changeEvent: "{prefsEditorStack}.prefsEditorLoader.prefsEditor.applier.modelChanged"
                    }, {
                        // highlight model change
                        func: "gpii.tests.themePicker.changeChecked",
                        args: ["{prefsEditorStack}.prefsEditorLoader.prefsEditor.gpii_chrome_prefs_panel_highlight.dom.themeInput", "{that}.options.testOpts.newModel.preferences.gpii_chrome_prefs_highlight"]
                    }, {
                        listener: "gpii.tests.prefsEditorTests.assertSettingChanged",
                        args: ["{prefsEditorStack}", ["preferences", "gpii_chrome_prefs_highlight"], "{that}.options.testOpts.newModel"],
                        spec: {path: "preferences.gpii_chrome_prefs_highlight", priority: "last:testing"},
                        changeEvent: "{prefsEditorStack}.prefsEditorLoader.prefsEditor.applier.modelChanged"
                    }, {
                        // line space model change
                        func: "gpii.tests.changeInput",
                        args: ["{prefsEditorStack}.prefsEditorLoader.prefsEditor.gpii_chrome_prefs_panel_lineSpace.dom.textfieldStepperContainer", "{that}.options.testOpts.newModel.preferences.gpii_chrome_prefs_lineSpace"]
                    }, {
                        listener: "gpii.tests.prefsEditorTests.assertSettingChanged",
                        args: ["{prefsEditorStack}", ["preferences", "gpii_chrome_prefs_lineSpace"], "{that}.options.testOpts.newModel"],
                        spec: {path: "preferences.gpii_chrome_prefs_lineSpace", priority: "last:testing"},
                        changeEvent: "{prefsEditorStack}.prefsEditorLoader.prefsEditor.applier.modelChanged"
                    }, {
                        // simplify model change
                        jQueryTrigger: "click",
                        element: "{prefsEditorStack}.prefsEditorLoader.prefsEditor.gpii_chrome_prefs_panel_simplify.switchUI.dom.control"
                    }, {
                        listener: "gpii.tests.prefsEditorTests.assertSettingChanged",
                        args: ["{prefsEditorStack}", ["preferences", "gpii_chrome_prefs_simplify"], "{that}.options.testOpts.newModel"],
                        spec: {path: "preferences.gpii_chrome_prefs_simplify", priority: "last:testing"},
                        changeEvent: "{prefsEditorStack}.prefsEditorLoader.prefsEditor.applier.modelChanged"
                    }, {
                        // speak model change
                        jQueryTrigger: "click",
                        element: "{prefsEditorStack}.prefsEditorLoader.prefsEditor.fluid_prefs_panel_speak.switchUI.dom.control"
                    }, {
                        listener: "gpii.tests.prefsEditorTests.assertSettingChanged",
                        args: ["{prefsEditorStack}", ["preferences", "fluid_prefs_speak"], "{that}.options.testOpts.newModel"],
                        spec: {path: "preferences.fluid_prefs_speak", priority: "last:testing"},
                        changeEvent: "{prefsEditorStack}.prefsEditorLoader.prefsEditor.applier.modelChanged"
                    }, {
                        // syllabification model change
                        jQueryTrigger: "click",
                        element: "{prefsEditorStack}.prefsEditorLoader.prefsEditor.fluid_prefs_panel_syllabification.switchUI.dom.control"
                    }, {
                        listener: "gpii.tests.prefsEditorTests.assertSettingChanged",
                        args: ["{prefsEditorStack}", ["preferences", "fluid_prefs_syllabification"], "{that}.options.testOpts.newModel"],
                        spec: {path: "preferences.fluid_prefs_syllabification", priority: "last:testing"},
                        changeEvent: "{prefsEditorStack}.prefsEditorLoader.prefsEditor.applier.modelChanged"
                    }, {
                        // table of contents model change
                        jQueryTrigger: "click",
                        element: "{prefsEditorStack}.prefsEditorLoader.prefsEditor.fluid_prefs_panel_layoutControls.switchUI.dom.control"
                    }, {
                        listener: "gpii.tests.prefsEditorTests.assertSettingChanged",
                        args: ["{prefsEditorStack}", ["preferences", "fluid_prefs_tableOfContents"], "{that}.options.testOpts.newModel"],
                        spec: {path: "preferences.fluid_prefs_tableOfContents", priority: "last:testing"},
                        changeEvent: "{prefsEditorStack}.prefsEditorLoader.prefsEditor.applier.modelChanged"
                    }, {
                        // text size model change
                        func: "gpii.tests.changeInput",
                        args: ["{prefsEditorStack}.prefsEditorLoader.prefsEditor.gpii_chrome_prefs_panel_textSize.dom.textfieldStepperContainer", "{that}.options.testOpts.newModel.preferences.gpii_chrome_prefs_textSize"]
                    }, {
                        listener: "gpii.tests.prefsEditorTests.assertSettingChanged",
                        args: ["{prefsEditorStack}", ["preferences", "gpii_chrome_prefs_textSize"], "{that}.options.testOpts.newModel"],
                        spec: {path: "preferences.gpii_chrome_prefs_textSize", priority: "last:testing"},
                        changeEvent: "{prefsEditorStack}.prefsEditorLoader.prefsEditor.applier.modelChanged"
                    }, {
                        // word space model change
                        func: "gpii.tests.changeInput",
                        args: ["{prefsEditorStack}.prefsEditorLoader.prefsEditor.gpii_chrome_prefs_panel_wordSpace.dom.textfieldStepperContainer", "{that}.options.testOpts.newModel.preferences.gpii_chrome_prefs_wordSpace"]
                    }, {
                        listener: "gpii.tests.prefsEditorTests.assertSettingChanged",
                        args: ["{prefsEditorStack}", ["preferences", "gpii_chrome_prefs_wordSpace"], "{that}.options.testOpts.newModel"],
                        spec: {path: "preferences.gpii_chrome_prefs_wordSpace", priority: "last:testing"},
                        changeEvent: "{prefsEditorStack}.prefsEditorLoader.prefsEditor.applier.modelChanged"
                    }]
                }]
            }]
        });

        fluid.test.runTests([
            "gpii.tests.chrome.prefs.extensionPanel.store.tests",
            "gpii.tests.textSizeAdjusterTests",
            "gpii.tests.lineSpaceAdjusterTests",
            "gpii.tests.charSpaceAdjusterTests",
            "gpii.tests.contrastAdjusterTests",
            "gpii.tests.highlightAdjusterTests",
            "gpii.tests.simplifyAdjusterTests",
            "gpii.tests.syllabificationAdjusterTests",
            "gpii.tests.clickToSelectAdjusterTests",
            "gpii.tests.prefsEditorTests"
        ]);
    });
})(jQuery);
