/*
 * Copyright The UIO+ copyright holders
 * See the AUTHORS.md file at the top-level directory of this distribution and at
 * https://github.com/fluid-project/uio-plus/blob/main/AUTHORS.md
 *
 * Licensed under the BSD 3-Clause License. You may not use this file except in
 * compliance with this license.
 *
 * You may obtain a copy of the license at
 * https://github.com/fluid-project/uio-plus/blob/main/LICENSE.txt
 */

/* global fluid, chrome, uioPlus, jqUnit*/
"use strict";

(function () {

    fluid.defaults("uioPlus.tests.portBinding.portName", {
        testOpts: {
            expectedPortName: "{portBinding}.options.portName"
        }
    });

    fluid.registerNamespace("uioPlus.tests.chrome.portBinding");

    uioPlus.tests.chrome.portBinding.assertConnection = function (expectedPortName) {
        jqUnit.assertTrue("Connection called with the correct arguments", chrome.runtime.connect.withArgs({name: expectedPortName}).calledOnce);
    };

    uioPlus.tests.chrome.portBinding.assertPostMessage = function (port, postedMessage) {
        jqUnit.assertTrue("postMessage called with the correct arguments", port.postMessage.calledWith(postedMessage));
    };

    /**
     * Sends a reset method to the postMessage stub.
     *
     * @param {Port} port - the mocked port
     * @param {String} resetMethod - defaults to "reset" but can be the following:
     *                               "reset": resets behavior and history
     *                               "resetBehavior": just resets the behavior
     *                               "resetHistory": just resets the history
     */
    uioPlus.tests.chrome.portBinding.resetPostMessage = function (port, resetMethod) {
        var method = resetMethod || "reset";
        port.postMessage[method]();
    };

    uioPlus.tests.chrome.portBinding.assertPostMessageWithUnknownID = function (prefix, port, expectedPost, callIndex) {
        callIndex = callIndex || 0;
        var actualPost = port.postMessage.args[callIndex][0];
        jqUnit.assertEquals(prefix + ": The posted message type is correct", expectedPost.type, actualPost.type);
        jqUnit.assertDeepEq(prefix + ": The posted message payload is correct", expectedPost.payload, actualPost.payload);
    };

    uioPlus.tests.chrome.portBinding.returnReceipt = function (that, receipt) {
        var returnedReceipt = fluid.copy(receipt);
        that.port.postMessage.callsFake(function () {
            // Needs to get the actual id used in the post request.
            // Best to make sure that there is only one open request to ensure that
            // the correct id is retrieved.
            var ids = fluid.keys(that.openRequests);
            if (ids.length) {
                returnedReceipt.id = ids[0];
                uioPlus.tests.mockPort.trigger.onMessage(that.port, returnedReceipt);
            }
        });
    };

})();
