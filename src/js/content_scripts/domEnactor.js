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

/* global fluid, chrome */
"use strict";

(function ($, fluid) {

    var gpii = fluid.registerNamespace("gpii");

    // The main component to handle settings that require DOM manipulations.
    // It contains various subcomponents for handling various settings.
    fluid.defaults("gpii.chrome.domEnactor", {
        gradeNames: ["fluid.contextAware", "fluid.viewComponent"],
        model: {
            // Accepted model values:
            // characterSpace: Number,
            // contrastTheme: String,
            // inputsLargerEnabled: Boolean,
            // lineSpace: Number,    // the multiplier to the current line space
            // selectionTheme: String,
            // selfVoicingEnabled: Boolean,
            // simplifiedUiEnabled: Boolean,
            // syllabificationEnabled: Boolean,
            // tableOfContentsEnabled: Boolean
        },
        events: {
            onIncomingSettings: null
        },
        listeners: {
            "onIncomingSettings.updateModel": "{that}.updateModel"
        },
        contextAwareness: {
            simplify: {
                checks: {
                    allowSimplification: {
                        contextValue: "{gpii.chrome.allowSimplification}",
                        gradeNames: "gpii.chrome.domEnactor.simplify"
                    }
                }
            }
        },
        invokers: {
            updateModel: {
                funcName: "gpii.chrome.domEnactor.updateModel",
                args: ["{that}", "{arguments}.0"]
            }
        },
        distributeOptions: {
            record: "{that}.container",
            target: "{that > fluid.prefs.enactor}.container"
        },
        components: {
            portBinding: {
                type: "gpii.chrome.portBinding",
                options: {
                    portName: "contentScript",
                    listeners: {
                        "onIncomingRead.handle": {
                            listener: "{that}.rejectMessage",
                            args: ["{that}.options.messageTypes.readReceipt", "{arguments}.0"]
                        }
                    },
                    invokers: {
                        handleRead: "fluid.identity",
                        handleWrite: {
                            func: "{domEnactor}.events.onIncomingSettings.fire",
                            args: ["{arguments}.0.payload.settings"]
                        }
                    }
                }
            },
            charSpace: {
                type: "gpii.chrome.enactor.charSpace",
                options: {
                    model: {
                        value: "{domEnactor}.model.characterSpace"
                    }
                }
            },
            contrast: {
                type: "gpii.chrome.enactor.contrast",
                options: {
                    model: {
                        value: "{domEnactor}.model.contrastTheme"
                    }
                }
            },
            inputsLarger: {
                type: "gpii.chrome.enactor.inputsLarger",
                options: {
                    model: {
                        value: "{domEnactor}.model.inputsLargerEnabled"
                    }
                }
            },
            lineSpace: {
                type: "gpii.chrome.enactor.lineSpace",
                options: {
                    model: {
                        value: "{domEnactor}.model.lineSpace"
                    }
                }
            },
            selectionHighlight: {
                type: "gpii.chrome.enactor.selectionHighlight",
                options: {
                    model: {
                        value: "{domEnactor}.model.selectionTheme",
                        selectParagraph: "{domEnactor}.model.clickToSelectEnabled"
                    }
                }
            },
            selfVoicing: {
                type: "gpii.chrome.enactor.selfVoicing",
                options: {
                    model: {
                        enabled: "{domEnactor}.model.selfVoicingEnabled"
                    },
                    // GPII-3373: temporarily remove the page level TTS until GPII-3286 is fixed
                    components: {
                        orator: {
                            options: {
                                components: {
                                    controller: {
                                        type: "fluid.emptySubcomponent"
                                    },
                                    domReader: {
                                        type: "fluid.emptySubcomponent"
                                    },
                                    selectionReader: {
                                        options: {
                                            markup: {
                                                control: "<button class=\"flc-orator-selectionReader-control gpiic-simplify-visible \"><span class=\"fl-icon-orator\"></span><span class=\"flc-orator-selectionReader-controlLabel\"></span></button>"
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            syllabification: {
                type: "gpii.chrome.enactor.syllabification",
                options: {
                    model: {
                        enabled: "{domEnactor}.model.syllabificationEnabled"
                    }
                }
            },
            tableOfContents: {
                type: "gpii.chrome.enactor.tableOfContents",
                options: {
                    model: {
                        toc: "{domEnactor}.model.tableOfContentsEnabled"
                    }
                }
            },
            wordSpace: {
                type: "gpii.chrome.enactor.wordSpace",
                options: {
                    model: {
                        value: "{domEnactor}.model.wordSpace"
                    }
                }
            }
        }
    });

    gpii.chrome.domEnactor.updateModel = function (that, model) {
        var transaction = that.applier.initiate();
        transaction.fireChangeRequest({path: "", type: "DELETE"});
        transaction.change("", model);
        transaction.commit();
    };

    fluid.defaults("gpii.chrome.domEnactor.simplify", {
        components: {
            simplify: {
                type: "gpii.chrome.enactor.simplify",
                options: {
                    model: {
                        simplify: "{domEnactor}.model.simplifiedUiEnabled"
                    }
                }
            }
        }
    });

    // High contrast
    fluid.defaults("gpii.chrome.enactor.contrast", {
        gradeNames: ["fluid.prefs.enactor.contrast"],
        classes: {
            "default": "",
            "bw": "fl-theme-uioPlus-bw",
            "wb": "fl-theme-uioPlus-wb",
            "by": "fl-theme-uioPlus-by",
            "yb": "fl-theme-uioPlus-yb",
            "gd": "fl-theme-uioPlus-gd",
            "gw": "fl-theme-uioPlus-gw",
            "bbr": "fl-theme-uioPlus-bbr"
        }
    });

    // fontsize map
    fluid.defaults("gpii.chrome.enactor.fontSizeMap", {
        fontSizeMap: {
            "xx-small": "9px",
            "x-small": "11px",
            "small": "13px",
            "medium": "15px",
            "large": "18px",
            "x-large": "23px",
            "xx-large": "30px"
        }
    });

    // Character space
    fluid.defaults("gpii.chrome.enactor.charSpace", {
        gradeNames: ["gpii.chrome.enactor.fontSizeMap", "fluid.prefs.enactor.letterSpace"]
    });

    // Line space
    fluid.defaults("gpii.chrome.enactor.lineSpace", {
        gradeNames: ["gpii.chrome.enactor.fontSizeMap", "fluid.prefs.enactor.lineSpace"]
    });

    // Word space
    fluid.defaults("gpii.chrome.enactor.wordSpace", {
        gradeNames: ["gpii.chrome.enactor.fontSizeMap", "fluid.prefs.enactor.wordSpace"]
    });

    // Inputs larger
    fluid.defaults("gpii.chrome.enactor.inputsLarger", {
        gradeNames: ["fluid.prefs.enactor.enhanceInputs"],
        cssClass: "gpii-ext-input-enhanced"
    });

    // Selection highlight
    fluid.defaults("gpii.chrome.enactor.selectionHighlight", {
        gradeNames: ["fluid.prefs.enactor.classSwapper"],
        classes: {
            "default": "",
            "yellow": "gpii-ext-selection-yellow",
            "green": "gpii-ext-selection-green",
            "pink": "gpii-ext-selection-pink"
        },
        listeners: {
            "onCreate.rightClick": {
                "this": "{that}.container",
                method: "contextmenu",
                args: ["{that}.handleRightClick"]
            }
        },
        invokers: {
            selectParagraph: "gpii.chrome.enactor.selectionHighlight.selectParagraph",
            handleRightClick: {
                funcName: "gpii.chrome.enactor.selectionHighlight.handleRightClick",
                args: ["{that}.model", "{arguments}.0", "{that}.selectParagraph"]
            }
        }
    });

    gpii.chrome.enactor.selectionHighlight.selectParagraph = function (node) {
        // find closest paragraph node
        node = $(node);
        var paragraphNode = node.closest("p")[0] || node[0];

        if (paragraphNode) {
            // create a range containg the paragraphNode
            var range = new Range();
            range.selectNode(paragraphNode);

            // retrieve the current selection
            var selection = window.getSelection();

            // clear all ranges in the selection
            selection.removeAllRanges();

            // add the new range based on the RIGHT-ClICKed paragraph
            selection.addRange(range);
        }
    };

    gpii.chrome.enactor.selectionHighlight.handleRightClick = function (model, event, handler) {
        // Check if the right mouse button was pressed so that this isn't
        // triggered by the context menu key ( https://api.jquery.com/contextmenu/ ).
        // Only trigger the handler if the appropriate model condition is met.
        if (event.button === 2 && model.selectParagraph) {
            handler(event.target);
            event.preventDefault();
        }
    };

    // Simplification
    fluid.defaults("gpii.chrome.enactor.simplify", {
        gradeNames: ["fluid.prefs.enactor", "gpii.simplify"],
        injectNavToggle: false
    });

    // Syllabification
    fluid.defaults("gpii.chrome.enactor.syllabification", {
        gradeNames: ["fluid.prefs.enactor.syllabification"],
        terms: {
            patternPrefix: "js/lib/syllablePatterns"
        },
        markup: {
            separator: "<span class=\"flc-syllabification-separator gpii-ext-syllabification-separator\"></span>"
        },
        invokers: {
            injectScript: "gpii.chrome.enactor.syllabification.injectScript"
        }
    });

    gpii.chrome.enactor.syllabification.injectScript = function (src) {
        var promise = fluid.promise();

        chrome.runtime.sendMessage({
            type: "gpii.chrome.contentScriptInjectionRequest",
            src: src
        }, promise.resolve);

        return promise;
    };

    // Table of contents
    fluid.defaults("gpii.chrome.enactor.tableOfContents", {
        gradeNames: ["gpii.chrome.contentView", "fluid.prefs.enactor.tableOfContents"],
        tocTemplate: {
            // Converts the relative path to a fully-qualified URL in the extension.
            expander: {
                funcName: "chrome.runtime.getURL",
                args: ["templates/TableOfContents.html"]
            }
        },
        tocMessage: {
            // Converts the relative path to a fully-qualified URL in the extension.
            expander: {
                funcName: "chrome.runtime.getURL",
                args: ["messages/tableOfContents-enactor.json"]
            }
        },
        selectors: {
            tocContainer: ".flc-toc-tocContainer",
            article: "article, [role~='article'], .article, #article",
            main: "main, [role~='main'], .main, #main",
            genericContent: ".content, #content, .body:not('body'), #body:not('body')"
        },
        defaultContent: "{that}.container",
        // Handle the initial model value when the component creation cycle completes instead of
        // relying on model listeners. See https://issues.fluidproject.org/browse/FLUID-5519
        listeners: {
            "onCreate.handleInitialModelValue": {
                listener: "{that}.applyToc",
                args: ["{that}.model.toc"]
            },
            "onCreateTOCReady.injectToCContainer": {
                listener: "{that}.injectToCContainer",
                priority: "first"
            }
        },
        invokers: {
            injectToCContainer: {
                funcName: "gpii.chrome.enactor.tableOfContents.injectToCContainer",
                args: ["{that}"]
            }
        },
        markup: {
            tocContainer: "<div class=\"flc-toc-tocContainer gpii-toc-tocContainer\"></div>"
        },
        distributeOptions: {
            source: "{that}.options.selectors.tocContainer",
            target: "{that tableOfContents}.options.selectors.tocContainer"
        }
    });

    gpii.chrome.enactor.tableOfContents.injectToCContainer = function (that) {
        if (!that.locate("tocContainer").length) {
            if (that.content.length === 1) {
                that.content.prepend(that.options.markup.tocContainer);
            } else {
                that.container.prepend(that.options.markup.tocContainer);
            }
        }
    };

    // Self Voicing
    fluid.defaults("gpii.chrome.enactor.selfVoicing", {
        gradeNames: ["gpii.chrome.contentView", "fluid.prefs.enactor.selfVoicing"],
        selectors: {
            controllerParentContainer: ".flc-prefs-selfVoicingWidget",
            domReaderContent: ".flc-orator-content"
        },
        domReaderContent: ["domReaderContent", "article", "main", "genericContent"],
        controllerParentContainer: ["controllerParentContainer", "article", "main", "genericContent"],
        distributeOptions: [{
            record: {
                expander: {
                    funcName: "gpii.chrome.contentView.findFirstSelector",
                    args: ["{selfVoicing}.locate", "{selfVoicing}.options.controllerParentContainer", "{selfVoicing}.container"]
                }
            },
            target: "{that orator > controller}.options.parentContainer",
            namespace: "controllerParentContainer"
        }, {
            record: {
                expander: {
                    funcName: "gpii.chrome.contentView.findFirstSelector",
                    args: ["{selfVoicing}.locate", "{selfVoicing}.options.domReaderContent", "{selfVoicing}.container"]
                }
            },
            target: "{that orator}.options.components.domReader.container",
            namespace: "domReaderContainer"
        }]
    });

})(jQuery, fluid);
