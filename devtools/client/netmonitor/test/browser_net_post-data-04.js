/* Any copyright is dedicated to the Public Domain.
   http://creativecommons.org/publicdomain/zero/1.0/ */

"use strict";

/**
 * Tests if the POST requests display the correct information in the UI,
 * for JSON payloads.
 */

add_task(function* () {
  let { L10N } = require("devtools/client/netmonitor/l10n");

  let { tab, monitor } = yield initNetMonitor(POST_JSON_URL);
  info("Starting test... ");

  let { document, EVENTS, NetMonitorView } = monitor.panelWin;
  let { RequestsMenu, NetworkDetails } = NetMonitorView;

  RequestsMenu.lazyUpdate = false;
  NetworkDetails._params.lazyEmpty = false;

  let wait = waitForNetworkEvents(monitor, 0, 1);
  yield ContentTask.spawn(tab.linkedBrowser, {}, function* () {
    content.wrappedJSObject.performRequests();
  });
  yield wait;

  let onEvent = monitor.panelWin.once(EVENTS.TAB_UPDATED);
  NetMonitorView.toggleDetailsPane({ visible: true }, 2);
  RequestsMenu.selectedIndex = 0;
  yield onEvent;

  let tabEl = document.querySelectorAll("#event-details-pane tab")[2];
  let tabpanel = document.querySelectorAll("#event-details-pane tabpanel")[2];

  is(tabEl.getAttribute("selected"), "true",
    "The params tab in the network details pane should be selected.");

  is(tabpanel.querySelector("#request-params-box")
    .hasAttribute("hidden"), false,
    "The request params box doesn't have the intended visibility.");
  is(tabpanel.querySelector("#request-post-data-textarea-box")
    .hasAttribute("hidden"), true,
    "The request post data textarea box doesn't have the intended visibility.");

  is(tabpanel.querySelectorAll(".variables-view-scope").length, 1,
    "There should be 1 param scopes displayed in this tabpanel.");
  is(tabpanel.querySelectorAll(".variables-view-empty-notice").length, 0,
    "The empty notice should not be displayed in this tabpanel.");

  let jsonScope = tabpanel.querySelectorAll(".variables-view-scope")[0];
  is(jsonScope.querySelector(".name").getAttribute("value"),
    L10N.getStr("jsonScopeName"),
    "The JSON scope doesn't have the correct title.");

  let valueScope = tabpanel.querySelector(
    ".variables-view-scope > .variables-view-element-details");

  is(valueScope.querySelectorAll(".variables-view-variable").length, 1,
    "There should be 1 value displayed in the JSON scope.");
  is(valueScope.querySelector(".variables-view-property .name")
    .getAttribute("value"),
    "a", "The JSON var name was incorrect.");
  is(valueScope.querySelector(".variables-view-property .value")
    .getAttribute("value"),
    "1", "The JSON var value was incorrect.");

  let detailsParent = valueScope.querySelector(".variables-view-property .name")
    .closest(".variables-view-element-details");
  is(detailsParent.hasAttribute("open"), true, "The JSON value must be visible");

  return teardown(monitor);
});
