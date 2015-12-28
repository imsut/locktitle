var MENU_ITEM = "LockTitle.menu"

var tabStatus = {}

function escape(input) {
  return input.replace(/'/g, "\\'");
}

function updateTitle(tabId, title) {
  var escaped = escape(title);
  chrome.tabs.executeScript(tabId, {
    'code': "document.title = '" + escaped + "'",
  });
}

chrome.contextMenus.create({
  'id': MENU_ITEM,
  'title': 'Lock Title',
  'contexts': ['all'],
  'onclick': function(info, tab) {
    var newTitle = prompt("Type in title for this tab. To unlock, make it empty.", tab.title);
    if (newTitle) {
      if (!tabStatus[tab.id]) {
        // save original title if it's not overwritten yet.
        tabStatus[tab.id] = { 'original': tab.title };
      }

      tabStatus[tab.id]['override'] = newTitle;
      updateTitle(tab.id, newTitle);
    } else {
      if (tabStatus[tab.id]) {
        updateTitle(tab.id, tabStatus[tab.id]['original']);
      }
      delete tabStatus[tab.id];
    }
  }
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  if (changeInfo.status == "complete" && tabStatus[tabId]) {
    tabStatus[tabId]['original'] = tab.title;
    updateTitle(tabId, tabStatus[tabId]['override']);
  }
});
